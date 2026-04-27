import { PresetPicker } from "@/components/PresetPicker";

export default function NewPresetPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">
        Tipo de evento rápido
      </h1>
      <p className="mt-2 mb-8 text-sm text-[var(--muted)]">
        Elige un tipo, ajusta duración y genera una playlist coherente sin más
        preguntas.
      </p>
      <PresetPicker />
    </div>
  );
}
