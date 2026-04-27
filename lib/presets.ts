export type Preset = {
  id: string;
  name: string;
  description: string;
  defaultDurationMinutes: number;
  energyCurve: string;
  genres: string[];
  bpmRange: string;
  guidance: string;
};

export const PRESETS: Preset[] = [
  {
    id: "cocktail-corporate",
    name: "Cocktail corporativo",
    description:
      "Recepción corporate, asistentes adultos, conversación al frente.",
    defaultDurationMinutes: 120,
    energyCurve: "low → low-medium",
    genres: ["nu-disco", "lounge", "soft house", "soul", "bossa nova"],
    bpmRange: "90-115",
    guidance:
      "Sin reggaeton agresivo, sin hits explícitos, sin vocales gritadas. Foco en groove discreto y elegante. Mezcla anglo + español 70/30.",
  },
  {
    id: "after-work",
    name: "After-work / restaurante pre-party",
    description:
      "Restaurante o azotea con público mixto, ambiente animado pero no fiesta total.",
    defaultDurationMinutes: 150,
    energyCurve: "medium",
    genres: ["indie pop", "funk", "disco", "soulful house", "nu-disco"],
    bpmRange: "100-120",
    guidance:
      "Hits accesibles pero no quemadísimos. Permite latin pop suave. Nada de drops fuertes.",
  },
  {
    id: "wedding-cocktail",
    name: "Boda - cocktail",
    description: "Cocktail post-ceremonia, invitados charlando con copa en mano.",
    defaultDurationMinutes: 90,
    energyCurve: "low → medium",
    genres: ["latin lounge", "crooners", "bossa", "soft pop", "indie pop"],
    bpmRange: "85-110",
    guidance:
      "Romántico sin ser cursi. Permite Sinatra, Norah Jones, Bebel Gilberto, Jorge Drexler. Cierra subiendo energía hacia el cocktail final.",
  },
  {
    id: "wedding-dance",
    name: "Boda - pista de baile",
    description: "Apertura de pista hasta peak time de boda.",
    defaultDurationMinutes: 180,
    energyCurve: "medium → peak → medium-high",
    genres: [
      "latin",
      "reggaeton",
      "80s",
      "90s",
      "español",
      "house",
      "hits actuales",
    ],
    bpmRange: "100-128",
    guidance:
      "Open format. Anchors: hits universales (Earth Wind Fire, ABBA), latino actual, español. Construye, peak, valle, peak otra vez.",
  },
  {
    id: "birthday-30-50",
    name: "Cumpleaños 30-50",
    description: "Generación 80s/90s/2000s, baile pero con nostalgia.",
    defaultDurationMinutes: 180,
    energyCurve: "medium → high",
    genres: ["80s", "90s", "2000s pop", "rock clásico", "funk", "español 90s"],
    bpmRange: "100-125",
    guidance:
      "Anclas que esa generación canta a coro. Mezcla anglosajón y español. Permite alguna canción guilty pleasure.",
  },
  {
    id: "birthday-18-30",
    name: "Cumpleaños 18-30",
    description: "Audiencia joven, fiesta intensa.",
    defaultDurationMinutes: 180,
    energyCurve: "medium → peak",
    genres: ["reggaeton", "urban latino", "afro house", "tech house", "hits actuales"],
    bpmRange: "100-130",
    guidance:
      "Hits del último año pesan más. Reggaeton actual, latin urbano, drops accesibles. Sin clásicos demasiado mayores.",
  },
  {
    id: "pool-beach",
    name: "Pool party / beach",
    description: "Fiesta de día, pool o playa, sol y bebidas.",
    defaultDurationMinutes: 240,
    energyCurve: "medium → high",
    genres: ["deep house", "tropical house", "afro house", "balearic", "latin tech"],
    bpmRange: "115-125",
    guidance:
      "Vocales soleadas, atmósferas Ibiza/Tulum. Evita peak time techno duro. Permite algún reggaeton tropical.",
  },
  {
    id: "private-vip",
    name: "Fiesta privada VIP",
    description: "Evento exclusivo, audiencia con criterio musical.",
    defaultDurationMinutes: 240,
    energyCurve: "medium → high",
    genres: ["deep house", "indie dance", "afro", "nu-disco", "selecciones premium"],
    bpmRange: "115-125",
    guidance:
      "Curaduría más fina. Evita los hits obvios. Edits, remixes y versiones menos quemadas.",
  },
];

export function getPreset(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}
