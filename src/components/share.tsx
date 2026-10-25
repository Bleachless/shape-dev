"use client";

import { toPng } from "html-to-image";
import { useRef, useState } from "react";
import { Heatmap } from "./heatmap";
import { frangoFor, Pixels } from "./pixel";
import { UserForm } from "./user-form";
import type { DevYear } from "@/lib/github";
import { langColor } from "@/lib/langs";
import { WEEKDAYS, type Stats } from "@/lib/stats";

const avatarOf = (dev: DevYear) => `${dev.avatar}${dev.avatar.includes("?") ? "&" : "?"}s=200`;

// O card fica no DOM para poder virar imagem; o tamanho de tudo é relativo à largura dele (cqw).
export function ShareCard({ dev, stats, today }: { dev: DevYear; stats: Stats; today: string }) {
  const f = frangoFor(stats.level.index, true);
  const facts = [
    { label: "contribuições", value: stats.total.toLocaleString("pt-BR") },
    { label: "dias de treino", value: stats.activeDays.toLocaleString("pt-BR") },
    { label: "dias seguidos", value: stats.longest.length.toLocaleString("pt-BR") },
    { label: "dia favorito", value: stats.total ? WEEKDAYS[stats.favoriteWeekday] : "—" },
  ];
  return (
    <div id="share-card" className="@container relative aspect-[4/5] w-full overflow-hidden rounded-sm border border-line bg-iron">
      <div className="flex h-[1.4cqw]">
        <span className="flex-1 bg-plate-red" />
        <span className="flex-1 bg-plate-blue" />
        <span className="flex-1 bg-plate-yellow" />
        <span className="flex-1 bg-plate-green" />
      </div>
      <div className="flex h-full flex-col p-[6cqw] pt-[5cqw]">
        <div className="flex items-center justify-between">
          <span className="font-display text-[5.5cqw] uppercase leading-none">
            Shape Dev {dev.year}
            <span className="text-plate-red">.</span>
          </span>
          <span className="flex items-center gap-[2cqw]">
            <span className="font-pixel text-[2.6cqw] text-chalk-soft">@{dev.login}</span>
            {/* eslint-disable-next-line @next/next/no-img-element -- precisa ser <img> comum para virar PNG */}
            <img src={avatarOf(dev)} alt="" crossOrigin="anonymous" className="h-[9cqw] w-[9cqw] rounded-[1cqw] border border-chalk/20" />
          </span>
        </div>

        <div className="mt-[6cqw] flex items-end justify-between gap-[3cqw]">
          <div className="min-w-0">
            <p className="font-pixel text-[2.6cqw] uppercase text-chalk-dim">nível de shape</p>
            <p className="font-display text-[15cqw] uppercase leading-[0.85] text-plate-yellow">{stats.level.name}</p>
            <p className="mt-[2cqw] font-display text-[5cqw] uppercase leading-none">{stats.archetype.title}</p>
          </div>
          <Pixels rows={f.rows} colors={f.colors} className="h-[20cqw] w-auto shrink-0" />
        </div>

        <div className="mt-[6cqw] grid grid-cols-2 gap-[2.5cqw]">
          {facts.map((x) => (
            <div key={x.label} className="rounded-[1cqw] bg-iron-2 px-[3cqw] py-[2.5cqw]">
              <p className="font-display text-[7.5cqw] uppercase leading-none">{x.value}</p>
              <p className="mt-[1cqw] font-pixel text-[2.3cqw] uppercase text-chalk-dim">{x.label}</p>
            </div>
          ))}
        </div>

        {stats.langs.length > 0 && (
          <div className="mt-[4cqw] flex flex-wrap gap-[1.6cqw]">
            {stats.langs.slice(0, 3).map((l) => (
              <span key={l.name} className="flex items-center gap-[1.2cqw] rounded-full border border-line px-[2.4cqw] py-[1cqw] text-[2.8cqw]">
                <span className="h-[2cqw] w-[2cqw] rounded-full" style={{ background: langColor(l.name) }} />
                {l.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto">
          {/* 53 semanas cabem em 88cqw: 1,2 de quadrado + 0,45 de espaço por coluna. */}
          <Heatmap days={dev.days} today={today} animate={false} cell="h-[1.2cqw] w-[1.2cqw]" gap="gap-[0.45cqw]" />
          <p className="mt-[3cqw] flex justify-between font-pixel text-[2.3cqw] uppercase text-chalk-dim">
            <span>quanto código você levantou?</span>
            <span className="text-chalk">shape dev</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export function ShareActions({ dev, stats }: { dev: DevYear; stats: Stats }) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const blob = useRef<Blob | null>(null);

  const pageUrl = typeof window === "undefined" ? "" : `${location.origin}/${dev.login}`;
  const text = `Meu shape de dev em ${dev.year}: ${stats.level.name} 💪
${stats.total.toLocaleString("pt-BR")} contribuições, ${stats.longest.length} dias seguidos de treino${stats.langs[0] ? ` e muito ${stats.langs[0].name} no braço` : ""}.
Tipo de marombeiro: ${stats.archetype.title}.

Quanto código você levantou esse ano? ${pageUrl}`;

  const render = async () => {
    const node = document.getElementById("share-card");
    if (!node) return null;
    // Tamanho exato de post (1080x1350), sem depender de arredondamento do navegador.
    const width = node.offsetWidth;
    const url = await toPng(node, {
      width,
      height: Math.round(width * 1.25),
      canvasWidth: 1080,
      canvasHeight: 1350,
      pixelRatio: 1,
      cacheBust: true,
      backgroundColor: "#0d0e0c",
    });
    blob.current = await (await fetch(url)).blob();
    return url;
  };

  const download = async () => {
    setBusy(true);
    try {
      const url = await render();
      if (!url) return;
      const a = document.createElement("a");
      a.href = url;
      a.download = `shape-dev-${dev.year}-${dev.login}.png`;
      a.click();
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    setBusy(true);
    try {
      await render();
      const file = blob.current && new File([blob.current], `shape-dev-${dev.login}.png`, { type: "image/png" });
      if (file && navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text });
      else await navigator.share?.({ text, url: pageUrl });
    } catch {
      // Cancelou o compartilhamento: tudo bem.
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Sem permissão de área de transferência.
    }
  };

  const canShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <div className="mt-5 w-full space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={download}
          disabled={busy}
          className="rounded-sm bg-plate-red px-4 py-3 font-pixel text-xs uppercase text-chalk shadow-[0_4px_0_#9c2a1c] active:translate-y-1 active:shadow-none disabled:opacity-60"
        >
          {busy ? "Gerando..." : "Baixar imagem"}
        </button>
        {canShare ? (
          <button type="button" onClick={share} disabled={busy} className="rounded-sm border border-chalk-dim px-4 py-3 font-pixel text-xs uppercase hover:border-plate-yellow">
            Compartilhar
          </button>
        ) : (
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-sm border border-chalk-dim px-4 py-3 text-center font-pixel text-xs uppercase hover:border-plate-yellow"
          >
            Postar no LinkedIn
          </a>
        )}
      </div>
      <button type="button" onClick={copy} className="w-full rounded-sm border border-line px-4 py-3 font-pixel text-[10px] uppercase text-chalk-soft hover:text-chalk">
        {copied ? "Texto copiado! Cola no post" : "Copiar texto pro post"}
      </button>
      <div className="border-t border-line pt-4">
        <p className="mb-2 font-pixel text-[10px] uppercase text-chalk-dim">Ver o shape de outra pessoa</p>
        <UserForm compact />
      </div>
    </div>
  );
}
