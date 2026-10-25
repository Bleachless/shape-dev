import { frangoFor, Pixels } from "@/components/pixel";

// Enquanto o GitHub responde: o Frango aquecendo.
export default function Loading() {
  const f = frangoFor(0, true);
  return (
    <main className="flex min-h-[100svh] flex-col items-center justify-center gap-6 px-4 text-center">
      <Pixels rows={f.rows} colors={f.colors} className="anim-bob h-20 w-auto" />
      <p className="font-display text-4xl uppercase">Pesando seu shape...</p>
      <p className="anim-blink font-pixel text-[10px] uppercase text-chalk-dim">contando as séries do ano no GitHub</p>
    </main>
  );
}
