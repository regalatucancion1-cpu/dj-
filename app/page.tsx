"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  createFolder,
  deleteFolder,
  listFolders,
  listPlaylists,
} from "@/lib/storage";
import { Folder, Playlist } from "@/lib/types";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newFolder, setNewFolder] = useState("");

  function reload() {
    setFolders(listFolders());
    setPlaylists(listPlaylists());
  }

  useEffect(() => {
    setMounted(true);
    reload();
  }, []);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newFolder.trim()) return;
    createFolder(newFolder.trim());
    setNewFolder("");
    reload();
  }

  function handleDeleteFolder(id: string) {
    if (!confirm("¿Borrar carpeta? Las playlists volverán a 'sin carpeta'."))
      return;
    deleteFolder(id);
    reload();
  }

  if (!mounted) {
    return <div className="mx-auto max-w-6xl px-6 py-10" />;
  }

  const looseFolders = playlists.filter((p) => !p.folderId);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight">
          Tus playlists
        </h1>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Genera setlists desde brief detallado o tipo de evento, guarda en
          carpetas, vuelve a ellas cuando quieras.
        </p>
      </section>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-wider text-[var(--muted)]">
            Carpetas
          </h2>
          <form onSubmit={handleCreate} className="flex gap-2">
            <input
              className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1 text-sm focus:border-[var(--accent)] focus:outline-none"
              placeholder="Nueva carpeta"
              value={newFolder}
              onChange={(e) => setNewFolder(e.target.value)}
            />
            <button
              type="submit"
              className="rounded-md border border-[var(--border)] px-3 py-1 text-sm hover:border-[var(--accent)]"
            >
              Crear
            </button>
          </form>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {folders.length === 0 && (
            <div className="text-sm text-[var(--muted)]">
              Aún no tienes carpetas.
            </div>
          )}
          {folders.map((f) => {
            const count = playlists.filter((p) => p.folderId === f.id).length;
            return (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <Link href={`/folder/${f.id}`} className="flex-1">
                  <div className="font-medium">{f.name}</div>
                  <div className="text-xs text-[var(--muted)]">
                    {count} playlist{count === 1 ? "" : "s"}
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => handleDeleteFolder(f.id)}
                  className="text-xs text-[var(--muted)] hover:text-red-400"
                >
                  Borrar
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xs uppercase tracking-wider text-[var(--muted)]">
          Sin carpeta · {looseFolders.length}
        </h2>
        {looseFolders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--muted)]">
            Genera tu primera playlist con los botones de arriba.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {looseFolders.map((p) => (
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
      </section>
    </div>
  );
}
