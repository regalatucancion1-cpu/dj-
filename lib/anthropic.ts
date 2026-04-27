import { spawn } from "child_process";
import { Song } from "./types";
import { PLAYLIST_SYSTEM_PROMPT } from "./prompts";

const RESPONSE_SHAPE = `{
  "songs": [
    {
      "title": "string",
      "artist": "string",
      "year": 2010,
      "genre": "string",
      "bpm": 120,
      "key": "8A",
      "energy": 7,
      "moment": "string",
      "tags": ["string"],
      "notes": "string"
    }
  ]
}`;

function buildFullPrompt(userMessage: string): string {
  return [
    PLAYLIST_SYSTEM_PROMPT,
    "",
    "BRIEF DEL EVENTO:",
    userMessage,
    "",
    "Responde SOLO con un objeto JSON con esta forma exacta:",
    RESPONSE_SHAPE,
    "Sin markdown, sin code fences, sin texto antes ni después del JSON. Mínimo 25 canciones, máximo 50.",
  ].join("\n");
}

function extractJson(text: string): string {
  let body = text.trim();
  body = body.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("La respuesta no contiene un objeto JSON.");
  }
  return body.slice(start, end + 1);
}

function runClaude(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const env = { ...process.env };
    delete env.ANTHROPIC_API_KEY;
    delete env.ANTHROPIC_AUTH_TOKEN;

    const child = spawn(
      "claude",
      ["-p", "--output-format", "json", "--max-turns", "1", prompt],
      { env, stdio: ["ignore", "pipe", "pipe"] },
    );

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d: Buffer) => {
      stdout += d.toString();
    });
    child.stderr.on("data", (d: Buffer) => {
      stderr += d.toString();
    });

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("claude CLI timeout (3 min)."));
    }, 180_000);

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(
          new Error(
            `claude exit ${code}. stderr: ${stderr.slice(0, 400) || "(vacío)"}`,
          ),
        );
        return;
      }
      resolve(stdout);
    });
  });
}

type ClaudeWrapper = {
  type: string;
  subtype: string;
  is_error: boolean;
  result?: string;
};

export async function generatePlaylist(userMessage: string): Promise<Song[]> {
  const prompt = buildFullPrompt(userMessage);

  let stdout: string;
  try {
    stdout = await runClaude(prompt);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(
      `claude CLI falló. ¿Está instalado en PATH y autenticado con tu plan Max (claude /login)? Detalle: ${detail}`,
    );
  }

  let wrapper: ClaudeWrapper;
  try {
    wrapper = JSON.parse(stdout);
  } catch {
    throw new Error("stdout de claude no es JSON válido.");
  }
  if (wrapper.is_error) {
    throw new Error(
      `claude devolvió error: ${wrapper.subtype} ${wrapper.result ?? ""}`.trim(),
    );
  }
  if (!wrapper.result || typeof wrapper.result !== "string") {
    throw new Error("claude no devolvió result.");
  }

  const inner = extractJson(wrapper.result);
  let parsed: { songs?: Song[] };
  try {
    parsed = JSON.parse(inner);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    throw new Error(`No pude parsear el JSON interno: ${detail}`);
  }
  if (!parsed.songs || !Array.isArray(parsed.songs)) {
    throw new Error("La respuesta no contiene un array 'songs'.");
  }
  return parsed.songs;
}
