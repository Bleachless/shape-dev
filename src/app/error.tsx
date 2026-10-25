"use client";

import Link from "next/link";

// Normalmente é o GitHub fora do ar ou devolvendo erro: dá pra tentar de novo.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-[100svh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="eyebrow">Deu ruim no supino</p>
      <h1 className="mt-2 font-display text-5xl uppercase">O GitHub não respondeu</h1>
      <p className="mt-3 text-chalk-soft">Pode ser instabilidade de lá. Respira, toma uma água e tenta de novo.</p>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={reset} className="rounded-sm bg-plate-red px-5 py-3 font-pixel text-xs uppercase text-chalk">
          Tentar de novo
        </button>
        <Link href="/" className="rounded-sm border border-line px-5 py-3 font-pixel text-xs uppercase">
          Início
        </Link>
      </div>
    </main>
  );
}
