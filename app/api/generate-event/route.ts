import { NextRequest, NextResponse } from "next/server";
import { generatePlaylist } from "@/lib/anthropic";
import { extractPdfText } from "@/lib/pdf";
import { buildEventUserMessage } from "@/lib/prompts";
import { EventInput } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_PDF_BYTES = 15 * 1024 * 1024;

async function readInput(req: NextRequest): Promise<EventInput> {
  const contentType = req.headers.get("content-type") || "";
  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const briefRaw = form.get("brief");
    if (typeof briefRaw !== "string") {
      throw new Error("Falta el campo 'brief' en el form data.");
    }
    const input = JSON.parse(briefRaw) as EventInput;

    const pdf = form.get("pdf");
    if (pdf && pdf instanceof File && pdf.size > 0) {
      if (pdf.size > MAX_PDF_BYTES) {
        throw new Error(
          `PDF demasiado grande: ${(pdf.size / 1024 / 1024).toFixed(1)} MB. Máximo ${MAX_PDF_BYTES / 1024 / 1024} MB.`,
        );
      }
      const buffer = Buffer.from(await pdf.arrayBuffer());
      const extracted = await extractPdfText(buffer);
      if (!extracted.text) {
        throw new Error(
          "No se pudo extraer texto del PDF (¿escaneado sin OCR?).",
        );
      }
      const header = `Archivo: ${pdf.name} (${extracted.pages} págs${extracted.truncated ? ", truncado a 40K chars" : ""}).`;
      input.briefDocument = `${header}\n\n${extracted.text}`;
    }

    return input;
  }
  return (await req.json()) as EventInput;
}

export async function POST(req: NextRequest) {
  let input: EventInput;
  try {
    input = await readInput(req);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "JSON / form data inválido";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  if (!input.eventType) {
    return NextResponse.json(
      { error: "Falta el tipo de evento" },
      { status: 400 },
    );
  }
  try {
    const message = buildEventUserMessage(input);
    const songs = await generatePlaylist(message);
    return NextResponse.json({ songs, briefDocument: input.briefDocument });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
