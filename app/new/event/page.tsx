import { EventForm } from "@/components/EventForm";

export default function NewEventPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-semibold tracking-tight">
        Brief detallado del evento
      </h1>
      <p className="mt-2 mb-8 text-sm text-[var(--muted)]">
        Cuéntale al DJ todo lo que sabes del evento. Cuanto más concreto, mejor
        encajará la playlist.
      </p>
      <EventForm />
    </div>
  );
}
