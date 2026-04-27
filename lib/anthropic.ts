import Anthropic from "@anthropic-ai/sdk";
import { Song } from "./types";
import { PLAYLIST_SYSTEM_PROMPT } from "./prompts";

import type { Tool } from "@anthropic-ai/sdk/resources/messages";

const SONG_TOOL_SCHEMA: Tool.InputSchema = {
  type: "object",
  properties: {
    songs: {
      type: "array",
      minItems: 20,
      maxItems: 60,
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          artist: { type: "string" },
          year: { type: "integer" },
          genre: { type: "string" },
          bpm: { type: "integer" },
          key: { type: "string", description: "Camelot key, ej. 8A" },
          energy: { type: "integer", enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
          moment: { type: "string", description: "Fase del evento o momento" },
          tags: { type: "array", items: { type: "string" } },
          notes: { type: "string", description: "Frase corta del DJ" },
        },
        required: [
          "title",
          "artist",
          "genre",
          "bpm",
          "energy",
          "moment",
          "tags",
        ],
      },
    },
  },
  required: ["songs"],
};

let cachedClient: Anthropic | null = null;

function getClient(): Anthropic {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.startsWith("sk-ant-replace")) {
    throw new Error(
      "ANTHROPIC_API_KEY no configurada. Edita .env.local con tu clave real.",
    );
  }
  cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}

export async function generatePlaylist(userMessage: string): Promise<Song[]> {
  const client = getClient();

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 16000,
    system: PLAYLIST_SYSTEM_PROMPT,
    tools: [
      {
        name: "return_playlist",
        description:
          "Devuelve la playlist generada como un array de canciones con metadata.",
        input_schema: SONG_TOOL_SCHEMA,
      },
    ],
    tool_choice: { type: "tool", name: "return_playlist" },
    messages: [{ role: "user", content: userMessage }],
  });

  const toolBlock = response.content.find((b) => b.type === "tool_use");
  if (!toolBlock || toolBlock.type !== "tool_use") {
    throw new Error("Claude no devolvió tool_use con la playlist.");
  }
  const input = toolBlock.input as { songs?: Song[] };
  if (!input.songs || !Array.isArray(input.songs)) {
    throw new Error("La respuesta no contiene un array de canciones.");
  }
  return input.songs;
}
