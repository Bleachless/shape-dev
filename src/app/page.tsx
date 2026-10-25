import Link from "next/link";
import { frangoFor, Pixels } from "@/components/pixel";
import { UserForm } from "@/components/user-form";
import { LEVELS } from "@/lib/stats";

const BAND = ["#f4efe6", "#3b7be0", "#e5432f", "#f3c13a", "#f3c13a"];
const STEPS = [
  { n: "01", title: "Carga", text: "Quantas contribuições você levantou no ano." },
  { n: "02", title: "Frequência", text: "Dias de treino, maior sequência e seu dia favorito." },
  { n: "03", title: "Grupos musculares", text: "As linguagens que mais trabalhou." },
  { n: "04", title: "Shape final", text: "Seu nível, seu tipo de marombeiro e um card pra postar." },
];

export default function Home() {
  const year = new Date().getFullYear();
  return (
    <main className="mx-auto flex min-h-[100svh] max-w-6xl flex-col px-4 py-8 sm:px-8">
      <header className="flex items-center justify-between">
        <span className="font-display text-2xl uppercase">
          Shape Dev<span className="text-plate-red">.</span>
        </span>
        <span className="font-pixel text-[10px] uppercase text-chalk-dim">retrospectiva {year}</span>
      </header>

      <section className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="eyebrow">Seu ano no GitHub como se fosse um treino</p>
          <h1 className="mt-4 font-display text-6xl uppercase leading-[1] sm:text-8xl">
            Quanto código
            <br />
            você <span className="text-plate-yellow">levantou</span>
            <br />
            em {year}?
          </h1>
          <p className="mt-6 max-w-lg text-lg text-chalk-soft">
            Digite seu usuário e veja seu shape de dev: carga, frequência, grupos musculares e o nível, de Frango a Bambam. No fim, um card
            pronto pra postar.
          </p>
          <div className="mt-8 max-w-xl">
            <UserForm autoFocus />
            <p className="mt-3 text-sm text-chalk-dim">
              Sem login. Só dados públicos. Tenta com{" "}
              <Link href="/torvalds" className="text-chalk underline underline-offset-4 hover:text-plate-yellow">
                torvalds
              </Link>{" "}
              ou{" "}
              <Link href="/sindresorhus" className="text-chalk underline underline-offset-4 hover:text-plate-yellow">
                sindresorhus
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="rounded-sm border border-line bg-iron-2 p-6">
          <p className="eyebrow">Os níveis de shape</p>
          <ol className="mt-4 space-y-3">
            {LEVELS.map((l, i) => {
              const f = frangoFor(i, i % 2 === 0);
              return (
                <li key={l.name} className="flex items-center gap-4">
                  <span className="flex h-12 w-14 items-center justify-center rounded-sm bg-iron-3">
                    <Pixels rows={f.rows} colors={f.colors} className="h-8 w-auto" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-2xl uppercase leading-none" style={{ color: BAND[i] }}>
                      {l.name}
                    </span>
                    <span className="font-pixel text-[10px] uppercase text-chalk-dim">{l.min}+ contribuições</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="grid gap-3 pb-10 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s) => (
          <div key={s.n} className="rounded-sm border border-line p-5">
            <p className="font-pixel text-[10px] text-plate-yellow">{s.n}</p>
            <p className="mt-2 font-display text-2xl uppercase">{s.title}</p>
            <p className="mt-1 text-sm text-chalk-soft">{s.text}</p>
          </div>
        ))}
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6 font-pixel text-[10px] uppercase text-chalk-dim">
        <span>
          Feito por{" "}
          <a href="https://github.com/Bleachless" className="text-chalk hover:text-plate-yellow">
            João Vaz
          </a>{" "}
          · o Frango também mora no Frango Fit
        </span>
        <a href="https://github.com/Bleachless/shape-dev" className="hover:text-plate-yellow">
          Código no GitHub ↗
        </a>
      </footer>
    </main>
  );
}
