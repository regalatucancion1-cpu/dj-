"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PRESETS } from "@/lib/presets";
import { newId, savePlaylist } from "@/lib/storage";
import { Playlist, PresetInput, Song } from "@/lib/types";
import { Spinner } from "./Spinner";

export function PresetPicker() {
  const router = useRouter();
  const [selected, setSelected] = useState(PRESETS[0].id);
  const [duration, setDuration] = useState(
    PRESETS[0].defaultDurationMinutes,
  );
  const [venueType, setVenueType] = useState("");
  const [vibe, setVibe] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pickPreset(id: string) {
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setSelected(id);
    setDuration(preset.defaultDurationMinutes);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const preset = PRESETS.find((p) => p.id === selected);
    if (!preset) return;
    try {
      const input: PresetInput = {
        presetId: selected,
        durationMinutes: duration,
        venueType,
        vibe,
        notes,
      };
      const res = await fetch("/api/generate-preset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error generando playlist");
      const songs: Song[] = data.songs;
      const playlist: Playlist = {
        id: newId(),
        name: `${preset.name} · ${duration}min`,
        mode: "preset",
        createdAt: new Date().toISOString(),
        folderId: null,
        input,
        songs,
      };
      savePlaylist(playlist);
      router.push(`/playlist/${playlist.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {PRESETS.map((preset) => {
          const on = preset.id === selected;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => pickPreset(preset.id)}
              className={`rounded-lg border p-4 text-left transition-colors ${
                on
                  ? "border-[var(--accent)] bg-[var(--surface-2)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--muted)]"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-[var(--foreground)]">
                  {preset.name}
                </h3>
                <span className="font-mono text-xs text-[var(--muted)]">
                  {preset.bpmRange}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {preset.description}
              </p>
              <div className="mt-2 text-xs text-[var(--muted)]">
                {preset.genres.slice(0, 4).join(" · ")}
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-[var(--muted)]">
            Duración (minutos)
          </span>
          <input
            type="number"
            min={30}
            max={480}
            step={15}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-sm focus:border-[var(--accent)] focus:outline-none"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-[var(--muted)]">
            Tipo de venue
          </span>
          <input
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-sm focus:border-[var(--accent)] focus:outline-none"
            value={venueType}
            onChange={(e) => setVenueType(e.target.value)}
            placeholder="playa, palacio, finca, club..."
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-[var(--muted)]">
            Vibe / referencias
          </span>
          <input
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-sm focus:border-[var(--accent)] focus:outline-none"
            value={vibe}
            onChange={(e) => setVibe(e.target.value)}
            placeholder="tipo Ibiza, gala clásica, jazz bar..."
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-[var(--muted)]">
            Notas extra (opcional)
          </span>
          <input
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-sm focus:border-[var(--accent)] focus:outline-none"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Algo específico que quieras inyectar"
          />
        </label>
      </div>

      {error && (
        <div className="rounded border border-red-700 bg-red-950/40 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[var(--accent)] px-6 py-2 text-sm font-medium text-black hover:bg-amber-500 disabled:opacity-50"
        >
          {loading ? "Generando..." : "Generar playlist"}
        </button>
        {loading && <Spinner label="Esto puede tardar 10-20s" />}
      </div>
    </form>
  );
}
