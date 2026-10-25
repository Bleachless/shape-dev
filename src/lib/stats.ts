import type { Day, DevYear, Repo } from "./github";

export const WEEKDAYS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
export const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

const weekdayOf = (date: string) => new Date(`${date}T12:00:00Z`).getUTCDay();

// ---------- Sequências ----------

export function streaks(days: Day[], today: string) {
  const past = days.filter((d) => d.date <= today);
  let longest = { length: 0, start: "", end: "" };
  let run = 0;
  let start = "";
  for (const d of past) {
    if (d.count > 0) {
      if (run === 0) start = d.date;
      run++;
      if (run > longest.length) longest = { length: run, start, end: d.date };
    } else run = 0;
  }
  // Sequência atual: termina hoje, ou ontem se hoje ainda não teve nada.
  let current = 0;
  for (let i = past.length - 1; i >= 0; i--) {
    if (past[i].count > 0) current++;
    else if (i === past.length - 1 && past[i].date === today) continue;
    else break;
  }
  return { longest, current };
}

// ---------- Linguagens ----------

export function languages(repos: Repo[], year: number) {
  const since = `${year}-01-01`;
  const active = repos.filter((r) => !r.fork && r.language && r.pushedAt >= since);
  const pool = active.length ? active : repos.filter((r) => !r.fork && r.language);
  const count = new Map<string, number>();
  for (const r of pool) count.set(r.language!, (count.get(r.language!) ?? 0) + 1 + Math.min(r.stars, 50) / 50);
  const total = [...count.values()].reduce((a, b) => a + b, 0);
  return [...count.entries()]
    .map(([name, v]) => ({ name, share: v / total }))
    .sort((a, b) => b.share - a.share)
    .slice(0, 5);
}

// ---------- Horário ----------

export function periods(hours: number[]) {
  const sum = (a: number, b: number) => hours.slice(a, b).reduce((s, n) => s + n, 0);
  const total = hours.reduce((s, n) => s + n, 0) || 1;
  const list = [
    { id: "madrugada", label: "Madrugada", range: "0h às 6h", value: sum(0, 6) },
    { id: "manha", label: "Manhã", range: "6h às 12h", value: sum(6, 12) },
    { id: "tarde", label: "Tarde", range: "12h às 18h", value: sum(12, 18) },
    { id: "noite", label: "Noite", range: "18h às 24h", value: sum(18, 24) },
  ].map((p) => ({ ...p, share: p.value / total }));
  const peakHour = hours.indexOf(Math.max(...hours));
  return { list, favorite: [...list].sort((a, b) => b.value - a.value)[0], peakHour };
}

// ---------- Nível de shape ----------

export const LEVELS = [
  { min: 0, name: "Frango", line: "Todo monstro já foi frango um dia. Bora começar?" },
  { min: 100, name: "Frango Fit", line: "Ganhou a faixa. Já dá pra sentir o pump." },
  { min: 400, name: "Marombeiro", line: "Já pede foto no espelho do terminal." },
  { min: 1000, name: "Monstro", line: "Saindo da jaula, o monstro do commit!" },
  { min: 2500, name: "Bambam", line: "Ajuda o maluco que tá codando! Isso aqui é treino de monstro." },
] as const;

export function levelOf(total: number) {
  let i = 0;
  while (i + 1 < LEVELS.length && total >= LEVELS[i + 1].min) i++;
  return { index: i, ...LEVELS[i], next: LEVELS[i + 1] ?? null };
}

// ---------- Arquétipo ----------

export type Archetype = { id: string; title: string; text: string };

export function archetypeOf(s: {
  total: number;
  longest: number;
  weekendShare: number;
  nightShare: number | null;
  morningShare: number | null;
  languages: number;
  bestDay: number;
  activeDays: number;
}): Archetype {
  const avg = s.activeDays ? s.total / s.activeDays : 0;
  if (s.total === 0) return { id: "sofa", title: "Atleta de sofá", text: "Esse ano o treino foi descanso. Ano que vem é projeto verão." };
  if (s.nightShare !== null && s.nightShare >= 0.35)
    return { id: "coruja", title: "Coruja do commit", text: "Treina quando a academia tá vazia: de madrugada, só você e o terminal." };
  if (s.morningShare !== null && s.morningShare >= 0.45)
    return { id: "madrugador", title: "Treino das 6h", text: "Chega antes do professor. Commit com café e cara de sono." };
  if (s.longest >= 30) return { id: "rato", title: "Rato de academia", text: `Não falta um dia. ${s.longest} dias seguidos de treino não é pra qualquer um.` };
  if (s.weekendShare >= 0.35) return { id: "fds", title: "Atleta de fim de semana", text: "Durante a semana é trabalho; sábado e domingo é treino de projeto pessoal." };
  if (s.languages >= 5) return { id: "funcional", title: "Treino funcional", text: "Trabalha todos os grupos musculares: uma linguagem pra cada dia." };
  if (avg > 0 && s.bestDay >= avg * 6) return { id: "explosivo", title: "Explosivo", text: "Some uns dias e volta destruindo: treino de tiro, intensidade máxima." };
  return { id: "constante", title: "Feijão com arroz", text: "Sem drama, sem pular treino: constância é o segredo do shape." };
}

// ---------- Tudo junto ----------

export type Stats = ReturnType<typeof computeStats>;

export function computeStats(dev: DevYear, today: string) {
  const days = dev.days.filter((d) => d.date <= today);
  const total = days.reduce((s, d) => s + d.count, 0);
  const active = days.filter((d) => d.count > 0);
  const { longest, current } = streaks(dev.days, today);

  const byWeekday = new Array(7).fill(0);
  const byMonth = new Array(12).fill(0);
  for (const d of days) {
    byWeekday[weekdayOf(d.date)] += d.count;
    byMonth[Number(d.date.slice(5, 7)) - 1] += d.count;
  }
  const favoriteWeekday = byWeekday.indexOf(Math.max(...byWeekday));
  const bestMonth = byMonth.indexOf(Math.max(...byMonth));
  const best = days.reduce((a, b) => (b.count > a.count ? b : a), { date: "", count: 0 });
  const weekendShare = total ? (byWeekday[0] + byWeekday[6]) / total : 0;

  const langs = dev.repos ? languages(dev.repos, dev.year) : [];
  const yearStart = `${dev.year}-01-01`;
  const reposThisYear = dev.repos?.filter((r) => !r.fork && r.createdAt >= yearStart).length ?? null;
  const stars = dev.repos?.filter((r) => !r.fork).reduce((s, r) => s + r.stars, 0) ?? null;
  const topRepo =
    dev.repos
      ?.filter((r) => !r.fork && r.pushedAt >= yearStart)
      .sort((a, b) => b.stars - a.stars || b.pushedAt.localeCompare(a.pushedAt))[0] ?? null;

  const time = dev.hours ? periods(dev.hours) : null;
  const share = (id: string) => time?.list.find((p) => p.id === id)?.share ?? null;

  const level = levelOf(total);
  const archetype = archetypeOf({
    total,
    longest: longest.length,
    weekendShare,
    nightShare: share("madrugada"),
    morningShare: share("manha"),
    languages: langs.length,
    bestDay: best.count,
    activeDays: active.length,
  });

  const weeksSoFar = Math.max(1, days.length / 7);
  return {
    total,
    perWeek: total / weeksSoFar,
    activeDays: active.length,
    daysSoFar: days.length,
    longest,
    current,
    byWeekday,
    favoriteWeekday,
    byMonth,
    bestMonth,
    best,
    weekendShare,
    langs,
    reposThisYear,
    stars,
    topRepo,
    time,
    level,
    archetype,
  };
}

export function formatDate(date: string) {
  const [, m, d] = date.split("-").map(Number);
  return `${d} de ${MONTHS[m - 1]}`;
}
