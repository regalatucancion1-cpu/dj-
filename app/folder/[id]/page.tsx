"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getFolder, listPlaylistsByFolder } from "@/lib/storage";
import { Folder, Playlist } from "@/lib/types";

export default function FolderPage() {
  const params = useParams<{ id: string }>();
  const [folder, setFolder] = useState<Folder | null>(null);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!params?.id) return;
    setFolder(getFolder(params.id) ?? null);
    setPlaylists(listPlaylistsByFolder(params.id));
  }, [params?.id]);

  if (!mounted) return <div className="mx-auto max-w-6xl px-6 py-10" />;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
      <div>
        <Link
          href="/"
          className="text-xs uppercase tracking-wider text-[var(--muted)] hover:text-[var(--accent)]"
        >
          ← Volver
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {folder?.name ?? "Carpeta no encontrada"}
        </h1>
      </div>

      {playlists.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--muted)]">
          No hay playlists en esta carpeta.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {playlists.map((p) => (
            <Link
              key={p.id}
              href={`/playlist/${p.id}`}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--accent)]"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{p.name}</span>
                <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs text-[var(--muted)]">
                  {p.mode}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-[var(--muted)]">
                <span>{p.songs.length} temas</span>
                <span>·</span>
                <span>{new Date(p.createdAt).toLocaleString()}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
