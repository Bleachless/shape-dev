"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Heatmap } from "./heatmap";
import { frangoFor, Pixels } from "./pixel";
import { ShareCard, ShareActions } from "./share";
import type { DevYear } from "@/lib/github";
import { langColor } from "@/lib/langs";
import { formatDate, MONTHS, WEEKDAYS, type Stats } from "@/lib/stats";

const DURATION = 7000;

// Número que sobe do zero até o valor quando o slide aparece.
function CountUp({ value, ms = 1400 }: { value: number; ms?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return <>{n.toLocaleString("pt-BR")}</>;
}

function Slide({ eyebrow, children, bg = "bg-iron" }: { eyebrow: string; children: ReactNode; bg?: string }) {
  return (
    <div className={`absolute inset-0 flex flex-col justify-center px-6 pb-16 pt-20 sm:px-10 ${bg}`}>
      <div className="slide-in mx-auto w-full max-w-md">
        <p className="eyebrow !text-current opacity-70">{eyebrow}</p>
        {children}
      </div>
    </div>
  );
}

function Bars({ items }: { items: { label: string; value: number; color: string; note?: string }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  return (
    <ul className="mt-6 space-y-3">
      {items.map((it, k) => (
        <li key={it.label}>
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium">{it.label}</span>
            <span className="font-pixel text-[10px] opacity-70">{it.note}</span>
          </div>
          <div className="mt-1 h-3 overflow-hidden rounded-sm bg-black/25">
            <div
              className="h-full origin-left rounded-sm"
              style={{ width: `${(it.value / max) * 100}%`, background: it.color, animation: `story-fill 0.9s ${0.2 + k * 0.12}s cubic-bezier(0.2,0.8,0.2,1) both` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function Stories({ dev, stats, today }: { dev: DevYear; stats: Stats; today: string }) {
  const f = frangoFor(stats.level.index, true);

  const slides: { id: string; node: ReactNode }[] = [
    {
      id: "intro",
      node: (
        <Slide eyebrow={`Retrospectiva ${dev.year}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- avatar do GitHub, já otimizado por eles */}
          <img src={`${dev.avatar}${dev.avatar.includes("?") ? "&" : "?"}s=160`} alt="" className="mt-6 h-20 w-20 rounded-sm border-2 border-chalk/20" />
          <h1 className="mt-5 font-display text-6xl uppercase leading-[0.9]">
            O shape dev
            <br />
            de <span className="text-plate-yellow">@{dev.login}</span>
          </h1>
          <p className="mt-4 text-chalk-soft">Bora ver quanto código você levantou esse ano. Toca pra começar o treino.</p>
          <Pixels rows={f.rows} colors={f.colors} className="anim-bob mt-8 h-16 w-auto" />
        </Slide>
      ),
    },
    {
      id: "carga",
      node: (
        <Slide eyebrow="Carga total do ano" bg="bg-plate-red">
          <p className="mt-4 font-display text-[6.5rem] leading-none sm:text-[8rem]">
            <CountUp value={stats.total} />
          </p>
          <p className="font-display text-3xl uppercase">contribuições levantadas</p>
          <p className="mt-6 text-lg">
            Dá umas <b>{Math.round(stats.perWeek).toLocaleString("pt-BR")} por semana</b>.{" "}
            {stats.total === 0
              ? "Esse ano foi de descanso. Acontece."
              : stats.total < 100
                ? "Aquecimento feito. O ano que vem é projeto verão."
                : stats.total < 1000
                  ? "Treino sério, sem pular série."
                  : "Isso não é treino, é competição."}
          </p>
        </Slide>
      ),
    },
    {
      id: "frequencia",
      node: (
        <Slide eyebrow="Frequência na academia" bg="bg-iron-2">
          <p className="mt-4 font-display text-6xl uppercase leading-none">
            <CountUp value={stats.activeDays} /> dias
          </p>
          <p className="mt-1 text-lg text-chalk-soft">de treino em {stats.daysSoFar} dias do ano.</p>
          <div className="mt-8 overflow-x-auto pb-2">
            <Heatmap days={dev.days} today={today} cell="h-[6px] w-[6px] sm:h-[7px] sm:w-[7px]" />
          </div>
          <p className="mt-4 font-pixel text-[10px] uppercase text-chalk-dim">Cada quadradinho é um dia · verde mais forte = treino mais pesado</p>
        </Slide>
      ),
    },
    {
      id: "sequencia",
      node: (
        <Slide eyebrow="Sem faltar um dia" bg="bg-plate-blue">
          <p className="mt-4 font-display text-[6.5rem] leading-none">
            <CountUp value={stats.longest.length} ms={1000} />
          </p>
          <p className="font-display text-3xl uppercase">dias seguidos de treino</p>
          {stats.longest.length > 0 && (
            <p className="mt-4 text-lg">
              De {formatDate(stats.longest.start)} a {formatDate(stats.longest.end)}.
            </p>
          )}
          <p className="mt-6 rounded-sm bg-black/20 px-4 py-3">
            {stats.current > 1 ? (
              <>
                Agora mesmo você está numa sequência de <b>{stats.current} dias</b>. Não vai quebrar, hein!
              </>
            ) : (
              "Sequência atual zerada. Amanhã é dia de recomeçar a série."
            )}
          </p>
        </Slide>
      ),
    },
    {
      id: "dia",
      node: (
        <Slide eyebrow="Seu dia de treino" bg="bg-iron-2">
          <p className="mt-4 font-display text-6xl uppercase leading-none">
            {stats.total ? WEEKDAYS[stats.favoriteWeekday] : "nenhum"}
            <span className="text-plate-yellow">.</span>
          </p>
          <p className="mt-2 text-lg text-chalk-soft">
            {stats.favoriteWeekday === 0 || stats.favoriteWeekday === 6 ? "Fim de semana é dia de projeto pessoal, né?" : "É o dia que você mais aparece na academia."}
          </p>
          <Bars
            items={WEEKDAYS.map((w, i) => ({
              label: w,
              value: stats.byWeekday[i],
              color: i === stats.favoriteWeekday ? "#f3c13a" : "#3b7be0",
              note: stats.byWeekday[i].toLocaleString("pt-BR"),
            }))}
          />
          {stats.best.count > 0 && (
            <p className="mt-6 text-sm text-chalk-soft">
              Treino mais pesado: <b className="text-chalk">{stats.best.count} contribuições</b> em {formatDate(stats.best.date)}. Mês mais forte:{" "}
              <b className="text-chalk">{MONTHS[stats.bestMonth]}</b>.
            </p>
          )}
        </Slide>
      ),
    },
    ...(stats.langs.length
      ? [
          {
            id: "linguagens",
            node: (
              <Slide eyebrow="Grupos musculares trabalhados" bg="bg-plate-green text-iron">
                <p className="mt-4 font-display text-6xl uppercase leading-none">{stats.langs[0].name}</p>
                <p className="mt-2 text-lg">foi o músculo que você mais treinou.</p>
                <Bars items={stats.langs.map((l) => ({ label: l.name, value: l.share, color: langColor(l.name), note: `${Math.round(l.share * 100)}%` }))} />
                <p className="mt-6 text-sm opacity-80">Pelos repositórios que você mexeu esse ano.</p>
              </Slide>
            ),
          },
        ]
      : []),
    ...(stats.time
      ? [
          {
            id: "horario",
            node: (
              <Slide eyebrow="Horário do treino" bg="bg-iron-2">
                <p className="mt-4 font-display text-6xl uppercase leading-none">{stats.time.favorite.label}</p>
                <p className="mt-2 text-lg text-chalk-soft">
                  é quando você mais commita. Pico às <b className="text-chalk">{stats.time.peakHour}h</b>.
                </p>
                <Bars
                  items={stats.time.list.map((p) => ({
                    label: `${p.label} · ${p.range}`,
                    value: p.value,
                    color: p.id === stats.time!.favorite.id ? "#e5432f" : "#6f6c64",
                    note: `${Math.round(p.share * 100)}%`,
                  }))}
                />
                <p className="mt-6 text-sm text-chalk-dim">Pelos seus pushes públicos mais recentes, no horário de Brasília.</p>
              </Slide>
            ),
          },
        ]
      : []),
    ...(stats.topRepo
      ? [
          {
            id: "repo",
            node: (
              <Slide eyebrow="Seu exercício favorito" bg="bg-plate-yellow text-iron">
                <p className="mt-4 break-words font-display text-5xl uppercase leading-none sm:text-6xl">{stats.topRepo.name}</p>
                {stats.topRepo.description && <p className="mt-3 text-lg">{stats.topRepo.description}</p>}
                <div className="mt-6 flex flex-wrap gap-2 font-pixel text-[10px] uppercase">
                  {stats.topRepo.language && <span className="rounded-sm bg-iron px-2.5 py-1.5 text-chalk">{stats.topRepo.language}</span>}
                  <span className="rounded-sm bg-iron px-2.5 py-1.5 text-chalk">★ {stats.topRepo.stars.toLocaleString("pt-BR")}</span>
                </div>
                <p className="mt-8 text-lg">
                  {stats.reposThisYear ? (
                    <>
                      E você ainda começou <b>{stats.reposThisYear} repositório(s)</b> novo(s) esse ano.
                    </>
                  ) : (
                    "Esse ano foi de evoluir o que já existia."
                  )}{" "}
                  {stats.stars ? `Somando tudo, ${stats.stars.toLocaleString("pt-BR")} estrelas no seu perfil.` : ""}
                </p>
              </Slide>
            ),
          },
        ]
      : []),
    {
      id: "shape",
      node: (
        <Slide eyebrow="Avaliação física final">
          <Pixels rows={f.rows} colors={f.colors} className="anim-bob mt-4 h-24 w-auto" />
          <p className="mt-6 font-pixel text-[10px] uppercase text-chalk-dim">Seu shape em {dev.year}</p>
          <p className="font-display text-7xl uppercase leading-none text-plate-yellow">{stats.level.name}</p>
          <p className="mt-2 text-chalk-soft">“{stats.level.line}”</p>
          <div className="mt-8 rounded-sm border border-line bg-iron-2 p-4">
            <p className="font-pixel text-[10px] uppercase text-plate-red">Tipo de marombeiro</p>
            <p className="mt-1 font-display text-3xl uppercase">{stats.archetype.title}</p>
            <p className="mt-1 text-sm text-chalk-soft">{stats.archetype.text}</p>
          </div>
          {stats.level.next && (
            <p className="mt-4 text-sm text-chalk-dim">
              Faltam {(stats.level.next.min - stats.total).toLocaleString("pt-BR")} contribuições pra virar {stats.level.next.name}.
            </p>
          )}
        </Slide>
      ),
    },
    {
      id: "card",
      node: (
        <div className="absolute inset-0 overflow-y-auto bg-iron px-4 pb-10 pt-20">
          <div className="slide-in mx-auto flex max-w-md flex-col items-center">
            <p className="eyebrow">Posta o seu shape</p>
            <div className="mt-4 w-full">
              <ShareCard dev={dev} stats={stats} today={today} />
            </div>
            <ShareActions dev={dev} stats={stats} />
          </div>
        </div>
      ),
    },
  ];

  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const last = slides.length - 1;
  const go = useCallback((d: number) => setI((v) => Math.max(0, Math.min(last, v + d))), [last]);
  const hold = useRef<ReturnType<typeof setTimeout>>(undefined);
  const held = useRef(false);

  // Avanço automático, exceto no último slide e enquanto segura o dedo.
  useEffect(() => {
    if (i === last || paused) return;
    const t = setTimeout(() => go(1), DURATION);
    return () => clearTimeout(t);
  }, [i, last, paused, go]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        go(1);
      }
      if (e.key === "ArrowLeft") go(-1);
    };
    const onVisibility = () => setPaused(document.hidden);
    addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [go]);

  const slide = slides[i];
  const interactive = slide.id === "card";

  return (
    <main className={`fixed inset-0 overflow-hidden bg-iron ${paused ? "story-paused" : ""}`}>
      <div className="relative mx-auto h-full max-w-xl overflow-hidden sm:my-0 sm:border-x sm:border-line">
        <div key={slide.id} className="absolute inset-0">
          {slide.node}
        </div>

        {/* Toque: direita avança, esquerda volta, segurar pausa. */}
        {!interactive && (
          <div
            className="absolute inset-0 z-10 flex"
            onPointerDown={() => {
              held.current = false;
              hold.current = setTimeout(() => {
                held.current = true;
                setPaused(true);
              }, 220);
            }}
            onPointerUp={(e) => {
              clearTimeout(hold.current);
              setPaused(false);
              if (held.current) return;
              const r = e.currentTarget.getBoundingClientRect();
              go(e.clientX - r.left < r.width * 0.3 ? -1 : 1);
            }}
            onPointerLeave={() => {
              clearTimeout(hold.current);
              setPaused(false);
            }}
          />
        )}

        <div className="absolute inset-x-0 top-0 z-20 px-3 pt-3">
          <div className="flex gap-1" aria-hidden>
            {slides.map((s, k) => (
              <span key={s.id} className="h-1 flex-1 overflow-hidden rounded-full bg-chalk/25">
                {k < i && <span className="block h-full w-full bg-chalk" />}
                {k === i && <span className="story-fill block h-full w-full bg-chalk" style={{ animationDuration: k === last ? "0.3s" : `${DURATION}ms` }} />}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="font-display text-lg uppercase">
              Shape Dev<span className="text-plate-red">.</span>
            </span>
            <div className="flex items-center gap-1">
              {i > 0 && (
                <button type="button" onClick={() => go(-1)} className="rounded-sm px-2 py-1 font-pixel text-[10px] uppercase opacity-80 hover:opacity-100" aria-label="Slide anterior">
                  ←
                </button>
              )}
              {i < last && (
                <button type="button" onClick={() => setI(last)} className="rounded-sm px-2 py-1 font-pixel text-[10px] uppercase opacity-80 hover:opacity-100">
                  Pular pro card
                </button>
              )}
              <Link href="/" className="rounded-sm px-2 py-1 font-pixel text-[10px] uppercase opacity-80 hover:opacity-100" aria-label="Fechar">
                ✕
              </Link>
            </div>
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          Slide {i + 1} de {slides.length}
        </p>
        {dev.limited && i === 0 && (
          <p className="absolute inset-x-4 bottom-4 z-20 rounded-sm bg-black/50 px-3 py-2 text-center text-xs text-chalk-soft">
            O GitHub está limitando consultas agora: linguagens e repositórios podem não aparecer.
          </p>
        )}
      </div>
    </main>
  );
}
