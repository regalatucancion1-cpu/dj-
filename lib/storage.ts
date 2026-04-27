import { Folder, Playlist } from "./types";

const FOLDERS_KEY = "dj.folders";
const PLAYLISTS_KEY = "dj.playlists";

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function listFolders(): Folder[] {
  return read<Folder>(FOLDERS_KEY).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

export function getFolder(id: string): Folder | undefined {
  return listFolders().find((f) => f.id === id);
}

export function createFolder(name: string): Folder {
  const folder: Folder = {
    id: newId(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };
  const folders = read<Folder>(FOLDERS_KEY);
  folders.push(folder);
  write(FOLDERS_KEY, folders);
  return folder;
}

export function deleteFolder(id: string): void {
  const folders = read<Folder>(FOLDERS_KEY).filter((f) => f.id !== id);
  write(FOLDERS_KEY, folders);
  const playlists = read<Playlist>(PLAYLISTS_KEY).map((p) =>
    p.folderId === id ? { ...p, folderId: null } : p,
  );
  write(PLAYLISTS_KEY, playlists);
}

export function listPlaylists(): Playlist[] {
  return read<Playlist>(PLAYLISTS_KEY).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function getPlaylist(id: string): Playlist | undefined {
  return listPlaylists().find((p) => p.id === id);
}

export function listPlaylistsByFolder(
  folderId: string | null,
): Playlist[] {
  return listPlaylists().filter((p) => p.folderId === folderId);
}

export function savePlaylist(playlist: Playlist): void {
  const playlists = read<Playlist>(PLAYLISTS_KEY);
  const index = playlists.findIndex((p) => p.id === playlist.id);
  if (index >= 0) playlists[index] = playlist;
  else playlists.push(playlist);
  write(PLAYLISTS_KEY, playlists);
}

export function deletePlaylist(id: string): void {
  const playlists = read<Playlist>(PLAYLISTS_KEY).filter((p) => p.id !== id);
  write(PLAYLISTS_KEY, playlists);
}

export function movePlaylist(
  playlistId: string,
  folderId: string | null,
): void {
  const playlists = read<Playlist>(PLAYLISTS_KEY).map((p) =>
    p.id === playlistId ? { ...p, folderId } : p,
  );
  write(PLAYLISTS_KEY, playlists);
}

export function renamePlaylist(playlistId: string, name: string): void {
  const playlists = read<Playlist>(PLAYLISTS_KEY).map((p) =>
    p.id === playlistId ? { ...p, name } : p,
  );
  write(PLAYLISTS_KEY, playlists);
}
