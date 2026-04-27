"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { newId, savePlaylist } from "@/lib/storage";
import { EventInput, IndoorOutdoor, Playlist, Song } from "@/lib/types";
import { Spinner } from "./Spinner";

const GENRES = [
  "latin",
  "reggaeton",
  "house",
  "techno",
  "deep house",
  "afro house",
  "pop",
  "hip-hop",
  "r&b",
  "funk",
  "disco",
  "80s",
  "90s",
  "rock clásico",
  "indie",
  "español",
  "catalán",
  "lounge",
  "bossa",
];

const PHASES = [
  { id: "ceremony", name: "Ceremonia" },
  { id: "cocktail", name: "Cocktail" },
  { id: "dinner", name: "Cena" },
  { id: "warmup", name: "Warm-up pista" },
  { id: "peak", name: "Peak / fiesta" },
  { id: "closing", name: "Closing" },
];

const TIMES_OF_DAY = [
  "mañana",
  "mediodía",
  "tarde",
  "atardecer",
  "noche",
  "madrugada",
];

const TONES = [
  "formal",
  "lounge",
  "fiesta intensa",
  "networking",
  "ambiente",
  "premiación",
  "lanzamiento producto",
  "celebración",
  "íntimo",
];

const LIVE_PERFORMERS = [
  "saxo (yo)",
  "saxofonista invitado",
  "percusionista",
  "vocalista",
  "guitarrista",
  "banda Savage Party completa",
];

const VENUE_SUGGESTIONS = [
  "playa / beach club",
  "palacio de congresos",
  "hotel / sala de gala",
  "finca rural / masía",
  "restaurante / azotea",
  "club / sala",
  "jardín / al aire libre",
  "oficina / espacio corporativo",
];

export function EventForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [form, setForm] = useState<EventInput>({
    eventType: "Boda",
    date: "",
    location: "",
    duration: "",
    primaryLanguage: "Español",
    guestCount: "",
    ageRange: "",
    nationalities: "",
    venueType: "",
    indoorOutdoor: undefined,
    timesOfDay: [],
    tone: [],
    vibe: "",
    volumeConstraints: "",
    dressCode: "",
    occasion: "",
    format: "",
    livePerformers: [],
    phases: PHASES.map((p) => ({
      name: p.id,
      enabled: ["cocktail", "warmup", "peak"].includes(p.id),
      duration: "",
      energy: "",
    })),
    genres: [],
    mustPlays: "",
    noPlays: "",
    firstDance: "",
    cakeCut: "",
    bouquet: "",
    surprises: "",
    notes: "",
  });

  function setField<K extends keyof EventInput>(key: K, value: EventInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function togglePhase(name: string, patch: Partial<EventInput["phases"][number]>) {
    setForm((f) => ({
      ...f,
      phases: f.phases.map((p) =>
        p.name === name ? { ...p, ...patch } : p,
      ),
    }));
  }

  function toggleGenre(g: string) {
    setForm((f) => ({
      ...f,
      genres: f.genres.includes(g)
        ? f.genres.filter((x) => x !== g)
        : [...f.genres, g],
    }));
  }

  function toggleInArray<K extends "tone" | "timesOfDay" | "livePerformers">(
    key: K,
    value: string,
  ) {
    setForm((f) => {
      const arr = (f[key] ?? []) as string[];
      return {
        ...f,
        [key]: arr.includes(value)
          ? arr.filter((x) => x !== value)
          : [...arr, value],
      };
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("brief", JSON.stringify(form));
      if (pdfFile) fd.append("pdf", pdfFile);
      const res = await fetch("/api/generate-event", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error generando playlist");
      const songs: Song[] = data.songs;
      const inputWithBrief: EventInput = {
        ...form,
        briefDocument: data.briefDocument ?? form.briefDocument,
      };
      const playlist: Playlist = {
        id: newId(),
        name: `${form.eventType}${form.date ? ` ${form.date}` : ""}${form.location ? ` · ${form.location}` : ""}`,
        mode: "event",
        createdAt: new Date().toISOString(),
        folderId: null,
        input: inputWithBrief,
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
    <form onSubmit={onSubmit} className="space-y-8">
      <Section title="Evento">
        <Grid>
          <Field label="Tipo">
            <input
              className={inputCls}
              value={form.eventType}
              onChange={(e) => setField("eventType", e.target.value)}
              placeholder="Boda / Cumpleaños / Corporate / Privado"
            />
          </Field>
          <Field label="Fecha">
            <input
              type="date"
              className={inputCls}
              value={form.date}
              onChange={(e) => setField("date", e.target.value)}
            />
          </Field>
          <Field label="Ubicación">
            <input
              className={inputCls}
              value={form.location}
              onChange={(e) => setField("location", e.target.value)}
              placeholder="Mas Sant Llei, Sitges"
            />
          </Field>
          <Field label="Duración total">
            <input
              className={inputCls}
              value={form.duration}
              onChange={(e) => setField("duration", e.target.value)}
              placeholder="6h"
            />
          </Field>
          <Field label="Idioma principal">
            <input
              className={inputCls}
              value={form.primaryLanguage}
              onChange={(e) => setField("primaryLanguage", e.target.value)}
            />
          </Field>
        </Grid>
      </Section>

      <Section title="Venue y contexto">
        <Grid cols={2}>
          <Field label="Tipo de venue">
            <input
              className={inputCls}
              value={form.venueType ?? ""}
              onChange={(e) => setField("venueType", e.target.value)}
              list="venue-suggestions"
              placeholder="playa, palacio de congresos, finca, restaurante..."
            />
            <datalist id="venue-suggestions">
              {VENUE_SUGGESTIONS.map((v) => (
                <option key={v} value={v} />
              ))}
            </datalist>
          </Field>
          <Field label="Indoor / outdoor">
            <div className="flex gap-2">
              {(["indoor", "outdoor", "mixed"] as IndoorOutdoor[]).map((io) => {
                const on = form.indoorOutdoor === io;
                return (
                  <button
                    key={io}
                    type="button"
                    onClick={() =>
                      setField("indoorOutdoor", on ? undefined : io)
                    }
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                      on
                        ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                        : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]"
                    }`}
                  >
                    {io === "mixed" ? "mixto" : io}
                  </button>
                );
              })}
            </div>
          </Field>
        </Grid>

        <div className="mt-4">
          <span className="mb-1 block text-xs uppercase tracking-wider text-[var(--muted)]">
            Hora del día (multi)
          </span>
          <div className="flex flex-wrap gap-2">
            {TIMES_OF_DAY.map((t) => {
              const on = form.timesOfDay.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleInArray("timesOfDay", t)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    on
                      ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                      : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          <span className="mb-1 block text-xs uppercase tracking-wider text-[var(--muted)]">
            Tono del evento (multi)
          </span>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => {
              const on = form.tone.includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleInArray("tone", t)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    on
                      ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                      : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]"
                  }`}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          <Grid cols={2}>
            <Field label="Vibe / referencias">
              <input
                className={inputCls}
                value={form.vibe ?? ""}
                onChange={(e) => setField("vibe", e.target.value)}
                placeholder="tipo Ibiza beach club, gala clásica, indie jazz bar..."
              />
            </Field>
            <Field label="Ocasión / motivo (corporates)">
              <input
                className={inputCls}
                value={form.occasion ?? ""}
                onChange={(e) => setField("occasion", e.target.value)}
                placeholder="cena fin de año, lanzamiento producto, premios..."
              />
            </Field>
            <Field label="Formato (cómo está la gente)">
              <input
                className={inputCls}
                value={form.format ?? ""}
                onChange={(e) => setField("format", e.target.value)}
                placeholder="cocktail de pie, sentados a mesa, pista de baile..."
              />
            </Field>
            <Field label="Dress code">
              <input
                className={inputCls}
                value={form.dressCode ?? ""}
                onChange={(e) => setField("dressCode", e.target.value)}
                placeholder="black-tie, smart-casual, beach attire..."
              />
            </Field>
            <Field label="Restricciones de volumen u horario">
              <input
                className={inputCls}
                value={form.volumeConstraints ?? ""}
                onChange={(e) =>
                  setField("volumeConstraints", e.target.value)
                }
                placeholder="vecinos cerca, fin a las 02h, sin restricciones..."
              />
            </Field>
            <Field label="Performance en vivo durante el DJ set">
              <div className="flex flex-wrap gap-2 pt-1">
                {LIVE_PERFORMERS.map((p) => {
                  const on = form.livePerformers.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => toggleInArray("livePerformers", p)}
                      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                        on
                          ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                          : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </Field>
          </Grid>
        </div>
      </Section>

      <Section title="Audiencia">
        <Grid>
          <Field label="Nº invitados">
            <input
              className={inputCls}
              value={form.guestCount}
              onChange={(e) => setField("guestCount", e.target.value)}
              placeholder="80"
            />
          </Field>
          <Field label="Edad mayoritaria">
            <input
              className={inputCls}
              value={form.ageRange}
              onChange={(e) => setField("ageRange", e.target.value)}
              placeholder="30-45"
            />
          </Field>
          <Field label="Nacionalidades">
            <input
              className={inputCls}
              value={form.nationalities}
              onChange={(e) => setField("nationalities", e.target.value)}
              placeholder="Español 70%, UK 30%"
            />
          </Field>
        </Grid>
      </Section>

      <Section title="Fases">
        <div className="space-y-2">
          {PHASES.map((p) => {
            const phase = form.phases.find((x) => x.name === p.id);
            if (!phase) return null;
            return (
              <div
                key={p.id}
                className="flex flex-wrap items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2"
              >
                <label className="flex items-center gap-2 min-w-[160px]">
                  <input
                    type="checkbox"
                    checked={phase.enabled}
                    onChange={(e) =>
                      togglePhase(p.id, { enabled: e.target.checked })
                    }
                  />
                  <span className="text-sm">{p.name}</span>
                </label>
                <input
                  className={`${inputCls} max-w-[120px]`}
                  placeholder="duración"
                  value={phase.duration ?? ""}
                  onChange={(e) =>
                    togglePhase(p.id, { duration: e.target.value })
                  }
                  disabled={!phase.enabled}
                />
                <input
                  className={`${inputCls} max-w-[180px]`}
                  placeholder="energía (low/med/peak)"
                  value={phase.energy ?? ""}
                  onChange={(e) =>
                    togglePhase(p.id, { energy: e.target.value })
                  }
                  disabled={!phase.enabled}
                />
              </div>
            );
          })}
        </div>
      </Section>

      <Section title="Gustos">
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => {
            const on = form.genres.includes(g);
            return (
              <button
                key={g}
                type="button"
                onClick={() => toggleGenre(g)}
                className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                  on
                    ? "border-[var(--accent)] bg-[var(--accent)] text-black"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]"
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Must-plays / No-plays">
        <Grid cols={2}>
          <Field label="Must-plays (uno por línea)">
            <textarea
              rows={6}
              className={inputCls}
              value={form.mustPlays}
              onChange={(e) => setField("mustPlays", e.target.value)}
              placeholder={"September - Earth Wind & Fire\nLa Bicicleta - Shakira & Carlos Vives"}
            />
          </Field>
          <Field label="No-plays (uno por línea)">
            <textarea
              rows={6}
              className={inputCls}
              value={form.noPlays}
              onChange={(e) => setField("noPlays", e.target.value)}
              placeholder={"Despacito\nNada de Pitbull"}
            />
          </Field>
        </Grid>
      </Section>

      <Section title="Momentos clave">
        <Grid>
          <Field label="Primer baile">
            <input
              className={inputCls}
              value={form.firstDance}
              onChange={(e) => setField("firstDance", e.target.value)}
              placeholder="Artista - Canción"
            />
          </Field>
          <Field label="Tarta">
            <input
              className={inputCls}
              value={form.cakeCut}
              onChange={(e) => setField("cakeCut", e.target.value)}
            />
          </Field>
          <Field label="Ramo">
            <input
              className={inputCls}
              value={form.bouquet}
              onChange={(e) => setField("bouquet", e.target.value)}
            />
          </Field>
          <Field label="Sorpresas">
            <input
              className={inputCls}
              value={form.surprises}
              onChange={(e) => setField("surprises", e.target.value)}
            />
          </Field>
        </Grid>
      </Section>

      <Section title="Notas extra">
        <textarea
          rows={4}
          className={inputCls}
          value={form.notes}
          onChange={(e) => setField("notes", e.target.value)}
          placeholder="Cualquier cosa más que el DJ deba saber"
        />
      </Section>

      <Section title="Brief PDF (opcional)">
        <div className="space-y-2 rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-2)] p-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-[var(--muted)] file:mr-3 file:rounded-md file:border-0 file:bg-[var(--accent)] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-black hover:file:bg-amber-500"
          />
          {pdfFile && (
            <div className="flex items-center justify-between text-xs text-[var(--muted)]">
              <span>
                {pdfFile.name} · {(pdfFile.size / 1024).toFixed(0)} KB
              </span>
              <button
                type="button"
                onClick={() => setPdfFile(null)}
                className="text-red-400 hover:text-red-300"
              >
                Quitar
              </button>
            </div>
          )}
          <p className="text-xs text-[var(--muted)]">
            Si tienes el dossier o brief del cliente en PDF, súbelo. Extraigo
            el texto y se lo paso a Claude como contexto. Máx 15 MB. PDFs
            escaneados sin OCR no funcionan.
          </p>
        </div>
      </Section>

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

const inputCls =
  "w-full rounded-md border border-[var(--border)] bg-[var(--surface-2)] px-3 py-1.5 text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-xs uppercase tracking-wider text-[var(--muted)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Grid({
  children,
  cols = 3,
}: {
  children: React.ReactNode;
  cols?: 1 | 2 | 3;
}) {
  const map = { 1: "grid-cols-1", 2: "grid-cols-1 md:grid-cols-2", 3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" } as const;
  return <div className={`grid ${map[cols]} gap-4`}>{children}</div>;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs uppercase tracking-wider text-[var(--muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}
