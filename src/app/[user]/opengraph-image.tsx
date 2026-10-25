import { ImageResponse } from "next/og";
import { frangoFor, PALETTE } from "@/components/pixel";
import { loadShape } from "@/lib/load";
import { WEEKDAYS } from "@/lib/stats";

export const alt = "Shape Dev: seu ano no GitHub como se fosse um treino";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Baixa só os caracteres usados, em TTF, que é o formato que o ImageResponse aceita.
async function font(family: string, text: string) {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

// O Frango em SVG para entrar como imagem.
function frangoSvg(level: number) {
  const f = frangoFor(level, true);
  const colors: Record<string, string> = { ...PALETTE, ...f.colors };
  const rects = f.rows
    .flatMap((row, y) => [...row].map((c, x) => (c !== "." && colors[c] ? `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${colors[c]}"/>` : "")))
    .join("");
  return `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 16" shape-rendering="crispEdges">${rects}</svg>`).toString("base64")}`;
}

export default async function Image({ params }: { params: Promise<{ user: string }> }) {
  const { user } = await params;
  let data: Awaited<ReturnType<typeof loadShape>> | null = null;
  try {
    data = await loadShape(user);
  } catch {
    data = null;
  }

  const title = data ? data.stats.level.name : "Shape Dev";
  const facts = data
    ? [
        [data.stats.total.toLocaleString("pt-BR"), "contribuições"],
        [String(data.stats.longest.length), "dias seguidos"],
        [data.stats.total ? WEEKDAYS[data.stats.favoriteWeekday] : "—", "dia favorito"],
      ]
    : [];
  const text = `SHAPE DEV ${data?.dev.year ?? ""} ${title} ${facts.flat().join(" ")} @${user} QUANTO CÓDIGO VOCÊ LEVANTOU? .0123456789`;
  const [anton, pixel] = await Promise.all([font("Anton", text.toUpperCase() + text), font("Silkscreen", text + text.toUpperCase())]);
  const fonts = [
    ...(anton ? [{ name: "Anton", data: anton, style: "normal" as const, weight: 400 as const }] : []),
    ...(pixel ? [{ name: "Silkscreen", data: pixel, style: "normal" as const, weight: 400 as const }] : []),
  ];
  const display = anton ? "Anton" : "sans-serif";
  const mono = pixel ? "Silkscreen" : "monospace";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0d0e0c", color: "#ece7dc" }}>
        <div style={{ display: "flex", height: 12 }}>
          {["#e5432f", "#3b7be0", "#f3c13a", "#3fae6d"].map((c) => (
            <div key={c} style={{ flex: 1, background: c }} />
          ))}
        </div>
        <div style={{ display: "flex", flex: 1, padding: "48px 64px", alignItems: "center", gap: 48 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              {data && (
                // eslint-disable-next-line @next/next/no-img-element -- ImageResponse só entende <img>
                <img src={`${data.dev.avatar}${data.dev.avatar.includes("?") ? "&" : "?"}s=120`} width={72} height={72} style={{ borderRadius: 8 }} alt="" />
              )}
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontFamily: display, fontSize: 34, letterSpacing: 1 }}>SHAPE DEV {data?.dev.year ?? ""}</span>
                <span style={{ fontFamily: mono, fontSize: 22, color: "#a9a59a" }}>@{data?.dev.login ?? user}</span>
              </div>
            </div>
            <span style={{ fontFamily: display, fontSize: 150, lineHeight: 1, color: "#f3c13a", marginTop: 28 }}>{title.toUpperCase()}</span>
            <div style={{ display: "flex", gap: 20, marginTop: 28 }}>
              {facts.map(([v, l]) => (
                <div key={l} style={{ display: "flex", flexDirection: "column", background: "#151613", borderRadius: 8, padding: "14px 22px" }}>
                  <span style={{ fontFamily: display, fontSize: 48 }}>{v.toUpperCase()}</span>
                  <span style={{ fontFamily: mono, fontSize: 16, color: "#6f6c64" }}>{l.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse só entende <img> */}
          <img src={frangoSvg(data?.stats.level.index ?? 0)} width={300} height={240} alt="" />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "0 64px 36px", fontFamily: mono, fontSize: 20, color: "#6f6c64" }}>
          <span>QUANTO CÓDIGO VOCÊ LEVANTOU?</span>
          <span style={{ color: "#ece7dc" }}>SHAPE DEV</span>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
