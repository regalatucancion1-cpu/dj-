import { NextRequest, NextResponse } from "next/server";
import { generatePlaylist } from "@/lib/anthropic";
import { buildEventUserMessage } from "@/lib/prompts";
import { EventInput } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let input: EventInput;
  try {
    input = (await req.json()) as EventInput;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
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
    return NextResponse.json({ songs });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
