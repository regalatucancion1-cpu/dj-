import { PDFParse } from "pdf-parse";

const MAX_CHARS = 40_000;

export async function extractPdfText(buffer: Buffer): Promise<{
  text: string;
  pages: number;
  truncated: boolean;
}> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    const raw = (result.text ?? "").replace(/\r/g, "").trim();
    const pages = result.total ?? 0;
    if (raw.length <= MAX_CHARS) {
      return { text: raw, pages, truncated: false };
    }
    return { text: raw.slice(0, MAX_CHARS), pages, truncated: true };
  } finally {
    await parser.destroy();
  }
}
