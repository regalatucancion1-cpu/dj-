"use client";

import { useMemo, useState } from "react";
import { Song } from "@/lib/types";

type SortKey = "moment" | "bpm" | "energy" | "genre" | "artist" | "none";

function energyBar(level: number) {
  const clamped = Math.max(1, Math.min(10, level));
  return "█".repeat(clamped) + "░".repeat(10 - clamped);
}

export function PlaylistTable({ songs }: { songs: Song[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("none");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const sorted = useMemo(() => {
    if (sortKey === "none") return songs;
    const copy = [...songs];
    copy.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;
      switch (sortKey) {
        case "bpm":
          aVal = a.bpm;
          bVal = b.bpm;
          break;
        case "energy":
          aVal = a.energy;
          bVal = b.energy;
          break;
        case "moment":
          aVal = a.moment;
          bVal = b.moment;
          break;
        case "genre":
          aVal = a.genre;
          bVal = b.genre;
          break;
        case "artist":
          aVal = a.artist;
          bVal = b.artist;
          break;
        default:
          return 0;
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [songs, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function arrow(key: SortKey) {
    if (sortKey !== key) return "";
    return sortDir === "asc" ? " ↑" : " ↓";
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full text-sm">
        <thead className="bg-[var(--surface-2)] text-left text-xs uppercase tracking-wide text-[var(--muted)]">
          <tr>
            <th className="px-3 py-2 w-10">#</th>
            <th
              className="px-3 py-2 cursor-pointer hover:text-[var(--accent)]"
              onClick={() => toggleSort("moment")}
            >
              Momento{arrow("moment")}
            </th>
            <th
              className="px-3 py-2 cursor-pointer hover:text-[var(--accent)]"
              onClick={() => toggleSort("artist")}
            >
              Artista — Título{arrow("artist")}
            </th>
            <th
              className="px-3 py-2 cursor-pointer hover:text-[var(--accent)] text-right"
              onClick={() => toggleSort("bpm")}
            >
              BPM{arrow("bpm")}
            </th>
            <th className="px-3 py-2 text-right">Key</th>
            <th
              className="px-3 py-2 cursor-pointer hover:text-[var(--accent)]"
              onClick={() => toggleSort("energy")}
            >
              Energía{arrow("energy")}
            </th>
            <th
              className="px-3 py-2 cursor-pointer hover:text-[var(--accent)]"
              onClick={() => toggleSort("genre")}
            >
              Género{arrow("genre")}
            </th>
            <th className="px-3 py-2">Tags</th>
            <th className="px-3 py-2">Notas</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {sorted.map((song, i) => (
            <tr key={`${song.artist}-${song.title}-${i}`} className="hover:bg-[var(--surface-2)]">
              <td className="px-3 py-2 text-[var(--muted)] font-mono">{i + 1}</td>
              <td className="px-3 py-2 whitespace-nowrap">
                <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs text-[var(--muted)]">
                  {song.moment}
                </span>
              </td>
              <td className="px-3 py-2">
                <div className="font-medium">{song.artist}</div>
                <div className="text-[var(--muted)] text-xs">{song.title}{song.year ? ` · ${song.year}` : ""}</div>
              </td>
              <td className="px-3 py-2 text-right font-mono text-[var(--accent)]">{song.bpm}</td>
              <td className="px-3 py-2 text-right font-mono text-[var(--muted)]">{song.key ?? "—"}</td>
              <td className="px-3 py-2 font-mono text-xs text-[var(--accent)]">{energyBar(song.energy)}</td>
              <td className="px-3 py-2 text-[var(--muted)] text-xs">{song.genre}</td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  {song.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-[var(--surface-2)] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-3 py-2 text-[var(--muted)] text-xs max-w-xs">{song.notes ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
