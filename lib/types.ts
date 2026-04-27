export type Phase =
  | "ceremony"
  | "cocktail"
  | "dinner"
  | "warmup"
  | "peak"
  | "closing";

export type Song = {
  title: string;
  artist: string;
  year?: number;
  genre: string;
  bpm: number;
  key?: string;
  energy: number;
  moment: string;
  tags: string[];
  notes?: string;
};

export type IndoorOutdoor = "indoor" | "outdoor" | "mixed";

export type EventInput = {
  eventType: string;
  date?: string;
  location?: string;
  duration?: string;
  primaryLanguage?: string;
  guestCount?: string;
  ageRange?: string;
  nationalities?: string;
  venueType?: string;
  indoorOutdoor?: IndoorOutdoor;
  timesOfDay: string[];
  tone: string[];
  vibe?: string;
  volumeConstraints?: string;
  dressCode?: string;
  occasion?: string;
  format?: string;
  livePerformers: string[];
  phases: Array<{
    name: Phase | string;
    enabled: boolean;
    duration?: string;
    energy?: string;
  }>;
  genres: string[];
  mustPlays: string;
  noPlays: string;
  firstDance?: string;
  cakeCut?: string;
  bouquet?: string;
  surprises?: string;
  notes?: string;
  briefDocument?: string;
};

export type PresetInput = {
  presetId: string;
  durationMinutes: number;
  venueType?: string;
  vibe?: string;
  notes?: string;
};

export type PlaylistMode = "event" | "preset";

export type Playlist = {
  id: string;
  name: string;
  mode: PlaylistMode;
  createdAt: string;
  folderId: string | null;
  input: EventInput | PresetInput;
  songs: Song[];
};

export type Folder = {
  id: string;
  name: string;
  createdAt: string;
};
