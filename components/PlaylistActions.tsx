"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  createFolder,
  deletePlaylist,
  listFolders,
  movePlaylist,
  newId,
  renamePlaylist,
  savePlaylist,
} from "@/lib/storage";
import { EventInput, Folder, Playlist, PresetInput, Song } from "@/lib/types";
import { CopyButton } from "./CopyButton";
import { Spinner } from "./Spinner";

function songsToText(songs: Song[]): string {
  return songs
    .map(
      (s, i) =>
        `${i + 1}. ${s.artist} - ${s.title} (BPM ${s.bpm}${s.key ? `, ${s.key}` : ""}, e${s.energy}, ${s.moment})`,
    )
    .join("\n");
}

function songsToCsv(songs: Song[]): string {
  const header = "n,artist,title,year,genre,bpm,key,energy,moment,tags,notes";
  const lines = songs.map((s, i) => {
    const cells = [
      i + 1,
      s.artist,
      s.title,
      s.year ?? "",
      s.genre,
      s.bpm,
      s.key ?? "",
      s.energy,
      s.moment,
      s.tags.join(";"),
      (s.notes ?? "").replace(/"/g, "'"),
    ];
    return cells
      .map((c) => {
        const str = String(c);
        return /[,"\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
      })
      .join(",");
  });
  return [header, ...lines].join("\n");
}

export function PlaylistActions({ playlist }: { playlist: Playlist }) {
  const router = useRouter();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [name, setName] = useState(playlist.name);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFolders(listFolders());
  }, []);

  function handleMove(folderId: string | null) {
    movePlaylist(playlist.id, folderId);
    router.refresh();
  }

  function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    const folder = createFolder(newFolderName.trim());
    setNewFolderName("");
    setFolders(listFolders());
    movePlaylist(playlist.id, folder.id);
    router.refresh();
  }

  function handleRename() {
    if (!name.trim() || name === playlist.name) return;
    renamePlaylist(playlist.id, name.trim());
    router.refresh();
  }

  function handleDelete() {
    if (!confirm("¿Borrar esta playlist?")) return;
    deletePlaylist(playlist.id);
    router.push("/");
  }

  async function handleRegenerate() {
    setError(null);
    setRegenerating(true);
    try {
      const endpoint =
        playlist.mode === "event"
          ? "/api/generate-event"
          : "/api/generate-preset";
      const body =
        playlist.mode === "event"
          ? (playlist.input as EventInput)
          : (playlist.input as PresetInput);
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error regenerando");
      const newPlaylist: Playlist = {
        ...playlist,
        id: newId(),
        name: `${playlist.name} (regen)`,
        createdAt: new Date().toISOString(),
        songs: data.songs as Song[],
      };
      savePlaylist(newPlaylist);
      router.push(`/playlist/${newPlaylist.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setRegenerating(false);
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <CopyButton text={songsToText(playlist.songs)} label="Copiar texto" />
        <CopyButton text={songsToCsv(playlist.songs)} label="Copiar CSV" />
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={regenerating}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)] disabled:opacity-50"
        >
          {regenerating ? "Regenerando..." : "Regenerar"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-md border border-red-900 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950/40"
        >
          Borrar
        </button>
        {regenerating && <Spinner />}
      </div>

      {error && (
        <div className="rounded border border-red-700 bg-red-950/40 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-[var(--muted)]">
            Nombre
          </span>
          <div className="flex gap-2">
            <input
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-sm focus:border-[var(--accent)] focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button
              type="button"
              onClick={handleRename}
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]"
            >
              Guardar
            </button>
          </div>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-[var(--muted)]">
            Carpeta
          </span>
          <div className="flex gap-2">
            <select
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-sm focus:border-[var(--accent)] focus:outline-none"
              value={playlist.folderId ?? ""}
              onChange={(e) => handleMove(e.target.value || null)}
            >
              <option value="">Sin carpeta</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-2 flex gap-2">
            <input
              className="w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-xs focus:border-[var(--accent)] focus:outline-none"
              placeholder="o crea una nueva carpeta..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateFolder();
                }
              }}
            />
            <button
              type="button"
              onClick={handleCreateFolder}
              className="rounded-md border border-[var(--border)] px-3 py-1 text-xs hover:border-[var(--accent)]"
            >
              Crear
            </button>
          </div>
        </label>
      </div>
    </div>
  );
}
