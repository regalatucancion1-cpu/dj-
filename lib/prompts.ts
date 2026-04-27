import type { EventInput } from "./types";
import type { Preset } from "./presets";

export const PLAYLIST_SYSTEM_PROMPT = `Eres un DJ profesional con 15 años de experiencia pinchando bodas, eventos corporativos y fiestas privadas en España y destinos europeos. Tu trabajo es construir setlists curados con criterio, calibrados al contexto exacto del evento.

Reglas duras:
- SIEMPRE devuelves la lista mediante el formato JSON estructurado solicitado. Nunca texto libre.
- Mínimo 25 canciones, máximo 50, salvo que la duración solicitada exija otro rango.
- Cada canción real (artista + título existentes). No inventes temas. Si dudas de la existencia, sustituye por algo equivalente que sí exista.
- BPM realista (estimación honesta). Respeta el rango BPM pedido en cada fase.
- Energía 1-10 calibrada al momento del evento.
- Campo moment: una de las fases del evento (ej. "cocktail", "warmup", "peak", "closing", "ceremony", "dinner") o un descriptor breve.
- Idioma de los temas según la audiencia descrita. Si la audiencia es internacional, mezcla español/inglés.
- Tags útiles para el DJ: latino, reggaeton, 80s, hit, deep, vocal, instrumental, crowdpleaser, indie, etc.
- Notas (notes): una frase máximo explicando por qué entra esa canción en ese momento.

Reglas de contexto (críticas):
- El venue manda sobre el repertorio. Un mismo "evento corporativo" exige músicas distintas según dónde se haga:
  - Beach club, playa, terraza junto al mar: balearic, deep house, tropical house, vocales soleadas, BPM 110-122. Nada de drops electrónicos duros, nada de reggaeton perreo intenso.
  - Palacio de congresos, sala de gala, hotel formal: lounge elegante, nu-disco, soul moderno, clásicos universales. BPM 95-115. Sin explícitos, sin grito.
  - Finca rural, masía, jardín: mestizaje latino-anglo, country pop, indie folk, rumbas accesibles. Permite subir hacia la noche.
  - Restaurante, terraza urbana, azotea: indie pop, funk, disco, soul. Energía media constante, no peak time.
  - Club, sala, recinto industrial: house, tech house, afro house, edits selectos. Aquí sí cabe peak técnico.
  - Oficina, espacio corporativo: lounge muy discreto, nu-jazz, lo-fi. Nada que llame la atención.
- Indoor vs outdoor cambia las dinámicas: outdoor pide más groove y menos densidad de sub, indoor permite más bajo y peak más oscuro.
- Hora del día calibra BPM y energía: mañana/mediodía 95-110 soleados, tarde 105-118 subiendo, noche 115-128 peak, madrugada 100-115 reflexivo y memorable.
- El tono y la ocasión (formal, lounge, fiesta intensa, networking, premiación, lanzamiento) ponen el techo de energía: "formal" jamás supera 115 BPM ni vocales gritadas, aunque dure 6h. "Fiesta intensa" empuja al peak cuanto antes.
- Restricciones de volumen u horario limitan lo que se puede pinchar: vecinos cerca o final temprano significa peak más suave y closing antes.
- Si hay banda en vivo conviviendo con DJ, la lista del DJ es complementaria: relleno y enlaces, no protagonismo.

Reglas de criterio:
- Respeta los must-plays SI EXISTEN: deben aparecer literalmente en la lista.
- Respeta los no-plays: no incluyas ninguna canción ni género prohibido.
- En bodas evita la trampa "todo Despacito": busca clásicos universales y temas actuales con criterio.
- Construye una curva de energía coherente con la fase y el venue.
- Mezcla anclas conocidas (que la pista identifica) con sorpresas curadas (descubrimientos del DJ).
- Evita consecutivos del mismo artista o género idéntico salvo que tenga sentido por bloque.
- Si la audiencia incluye edad alta, prioriza 70s/80s/90s y crooners. Si es joven, latin urbano y hits actuales.

Devuelves SOLO el objeto JSON con el array de canciones, sin texto antes ni después.`;

export function buildEventUserMessage(input: EventInput): string {
  const lines: string[] = [];
  lines.push(`Tipo de evento: ${input.eventType}`);
  if (input.occasion) lines.push(`Ocasión / motivo: ${input.occasion}`);
  if (input.date) lines.push(`Fecha: ${input.date}`);
  if (input.location) lines.push(`Ciudad / región: ${input.location}`);
  if (input.duration) lines.push(`Duración total: ${input.duration}`);
  if (input.primaryLanguage)
    lines.push(`Idioma principal de invitados: ${input.primaryLanguage}`);

  if (input.venueType || input.indoorOutdoor) {
    lines.push("");
    lines.push("Venue:");
    if (input.venueType) lines.push(`- Tipo: ${input.venueType}`);
    if (input.indoorOutdoor) lines.push(`- Indoor / outdoor: ${input.indoorOutdoor}`);
  }

  if (input.timesOfDay?.length) {
    lines.push(`Hora del día: ${input.timesOfDay.join(", ")}`);
  }

  if (input.tone?.length) {
    lines.push(`Tono del evento: ${input.tone.join(", ")}`);
  }

  if (input.vibe?.trim()) {
    lines.push(`Vibe / referencias: ${input.vibe.trim()}`);
  }

  if (input.format?.trim()) {
    lines.push(`Formato (cómo está la gente): ${input.format.trim()}`);
  }

  if (input.dressCode?.trim()) {
    lines.push(`Dress code: ${input.dressCode.trim()}`);
  }

  if (input.volumeConstraints?.trim()) {
    lines.push(`Restricciones de volumen u horario: ${input.volumeConstraints.trim()}`);
  }

  if (input.liveBand) {
    lines.push("Hay banda en vivo conviviendo con el DJ. La playlist es complementaria.");
  }

  if (input.guestCount) lines.push(`Nº de invitados: ${input.guestCount}`);
  if (input.ageRange) lines.push(`Edad mayoritaria: ${input.ageRange}`);
  if (input.nationalities) lines.push(`Nacionalidades: ${input.nationalities}`);

  const enabledPhases = input.phases.filter((p) => p.enabled);
  if (enabledPhases.length) {
    lines.push("");
    lines.push("Fases activas:");
    for (const p of enabledPhases) {
      const parts = [p.name];
      if (p.duration) parts.push(`duración ${p.duration}`);
      if (p.energy) parts.push(`energía ${p.energy}`);
      lines.push(`- ${parts.join(", ")}`);
    }
  }

  if (input.genres.length) {
    lines.push("");
    lines.push(`Géneros que les gustan: ${input.genres.join(", ")}`);
  }

  if (input.mustPlays.trim()) {
    lines.push("");
    lines.push("Must-plays (incluir literalmente):");
    lines.push(input.mustPlays.trim());
  }

  if (input.noPlays.trim()) {
    lines.push("");
    lines.push("No-plays (prohibido):");
    lines.push(input.noPlays.trim());
  }

  const moments: Array<[string, string | undefined]> = [
    ["Primer baile", input.firstDance],
    ["Cake cut", input.cakeCut],
    ["Ramo", input.bouquet],
    ["Sorpresas", input.surprises],
  ];
  const filled = moments.filter(([, v]) => v && v.trim());
  if (filled.length) {
    lines.push("");
    lines.push("Momentos clave:");
    for (const [k, v] of filled) lines.push(`- ${k}: ${v}`);
  }

  if (input.notes?.trim()) {
    lines.push("");
    lines.push(`Notas extra: ${input.notes.trim()}`);
  }

  lines.push("");
  lines.push(
    "Devuelve la playlist completa cubriendo todas las fases activas, en orden cronológico del evento, calibrada al venue, hora y tono descritos.",
  );

  return lines.join("\n");
}

export function buildPresetUserMessage(
  preset: Preset,
  durationMinutes: number,
  options: { venueType?: string; vibe?: string; notes?: string } = {},
): string {
  const lines: string[] = [];
  lines.push(`Tipo de evento preset: ${preset.name}`);
  lines.push(`Descripción: ${preset.description}`);
  lines.push(`Duración solicitada: ${durationMinutes} minutos`);
  lines.push(`Curva de energía objetivo: ${preset.energyCurve}`);
  lines.push(`Rango BPM objetivo: ${preset.bpmRange}`);
  lines.push(`Géneros sugeridos: ${preset.genres.join(", ")}`);
  lines.push(`Guía adicional del DJ: ${preset.guidance}`);

  if (options.venueType?.trim()) {
    lines.push("");
    lines.push(`Venue concreto: ${options.venueType.trim()}`);
    lines.push(
      "Calibra el repertorio al venue: playa pide balearic, palacio pide lounge elegante, finca pide mestizaje latino-anglo, club pide house técnico.",
    );
  }
  if (options.vibe?.trim()) {
    lines.push(`Vibe / referencias: ${options.vibe.trim()}`);
  }
  if (options.notes?.trim()) {
    lines.push(`Notas extra del DJ: ${options.notes.trim()}`);
  }
  lines.push("");
  lines.push(
    "Devuelve la playlist coherente con la duración y la curva. Usa el campo moment para indicar el momento de cada tema (intro, building, peak, closing).",
  );
  return lines.join("\n");
}
