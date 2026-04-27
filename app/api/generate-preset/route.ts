import { NextRequest, NextResponse } from "next/server";
import { generatePlaylist } from "@/lib/anthropic";
import { buildPresetUserMessage } from "@/lib/prompts";
import { getPreset } from "@/lib/presets";
import { PresetInput } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let input: PresetInput;
  try {
    input = (await req.json()) as PresetInput;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }
  const preset = getPreset(input.presetId);
  if (!preset) {
    return NextResponse.json(
      { error: `Preset no encontrado: ${input.presetId}` },
      { status: 400 },
    );
  }
  try {
    const message = buildPresetUserMessage(
      preset,
      input.durationMinutes || preset.defaultDurationMinutes,
      { venueType: input.venueType, vibe: input.vibe, notes: input.notes },
    );
    const songs = await generatePlaylist(message);
    return NextResponse.json({ songs });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
