"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PlaylistActions } from "@/components/PlaylistActions";
import { PlaylistTable } from "@/components/PlaylistTable";
import { getPlaylist } from "@/lib/storage";
import { Playlist } from "@/lib/types";

export default function PlaylistPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!params?.id) return;
    const p = getPlaylist(params.id);
    if (!p) {
      router.replace("/");
      return;
    }
    setPlaylist(p);
  }, [params?.id, router]);

  if (!mounted || !playlist) {
    return <div className="mx-auto max-w-6xl px-6 py-10" />;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          {playlist.name}
        </h1>
        <div className="mt-1 text-xs text-[var(--muted)]">
          {playlist.songs.length} temas · {playlist.mode} ·{" "}
          {new Date(playlist.createdAt).toLocaleString()}
        </div>
      </div>

      <PlaylistActions playlist={playlist} />

      <PlaylistTable songs={playlist.songs} />
    </div>
  );
}
