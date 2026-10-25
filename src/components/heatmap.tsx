import type { Day } from "@/lib/github";

const TONES = ["bg-iron-3", "bg-plate-green/35", "bg-plate-green/60", "bg-plate-green/85", "bg-plate-green"];

// Mapa do ano no formato do GitHub: colunas são semanas (domingo em cima), cor pela intensidade do dia.
export function Heatmap({
  days,
  today,
  animate = true,
  cell = "h-[9px] w-[9px]",
  gap = "gap-[3px]",
}: {
  days: Day[];
  today: string;
  animate?: boolean;
  cell?: string;
  gap?: string;
}) {
  if (days.length === 0) return null;
  // Faixas pelos quartis dos dias com treino, como o GitHub: um dia monstro não apaga o resto do ano.
  const sorted = days.map((d) => d.count).filter((n) => n > 0).sort((a, b) => a - b);
  const q = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] ?? 1;
  const [q1, q2, q3] = [q(0.25), q(0.5), q(0.75)];
  const lead = new Date(`${days[0].date}T12:00:00Z`).getUTCDay();
  const cells: (Day | null)[] = [...Array(lead).fill(null), ...days];
  const weeks: (Day | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const tone = (d: Day) => (d.count === 0 ? 0 : d.count > q3 ? 4 : d.count > q2 ? 3 : d.count > q1 ? 2 : 1);

  return (
    <div className={`flex ${gap}`} aria-label="Mapa de contribuições do ano">
      {weeks.map((w, wi) => (
        <div key={wi} className={`flex flex-col ${gap}`}>
          {w.map((d, di) =>
            d ? (
              <span
                key={d.date}
                title={`${d.date}: ${d.count}`}
                className={`${cell} rounded-[2px] ${d.date > today ? "bg-iron-2" : TONES[tone(d)]} ${animate ? "cell-pop" : ""}`}
                style={animate ? { animationDelay: `${wi * 18 + di * 6}ms` } : undefined}
              />
            ) : (
              <span key={`v${di}`} className={cell} />
            ),
          )}
        </div>
      ))}
    </div>
  );
}
