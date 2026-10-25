// Busca os dados públicos de um perfil do GitHub. Só roda no servidor.
// O calendário de contribuições vem da página pública (não gasta limite da API);
// perfil, repositórios e eventos vêm da API REST, com GITHUB_TOKEN opcional para ter mais limite.

export type Day = { date: string; count: number };

export type Repo = {
  name: string;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  createdAt: string;
  pushedAt: string;
  fork: boolean;
  description: string | null;
};

export type DevYear = {
  login: string;
  name: string | null;
  avatar: string;
  createdAt: string | null;
  followers: number | null;
  year: number;
  days: Day[];
  repos: Repo[] | null; // null = API indisponível agora (limite)
  hours: number[] | null; // commits por hora (0-23), dos eventos públicos recentes
  limited: boolean;
};

export class NotFoundError extends Error {}

const REVALIDATE = 60 * 60;
const UA = "shape-dev (https://github.com/Bleachless/shape-dev)";

function api<T>(path: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": UA,
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return fetch(`https://api.github.com${path}`, { headers, next: { revalidate: REVALIDATE } }).then(async (res) => {
    if (res.status === 404) throw new NotFoundError(path);
    if (!res.ok) return null; // 403/429 de limite: o resto do app se vira sem isso
    return (await res.json()) as T;
  });
}

// ---------- Calendário ----------

const TOOLTIP_COUNT = /^(\d[\d,.]*)\s+contributions?/i;

export function parseCalendar(html: string): Day[] {
  // Cada dia é um <td> com data-date e id; a contagem está no <tool-tip for="id">.
  const dateById = new Map<string, string>();
  for (const m of html.matchAll(/<td\b[^>]*ContributionCalendar-day[^>]*>/g)) {
    const tag = m[0];
    const date = tag.match(/data-date="(\d{4}-\d{2}-\d{2})"/)?.[1];
    const id = tag.match(/\bid="([^"]+)"/)?.[1];
    if (date && id) dateById.set(id, date);
  }
  const countById = new Map<string, number>();
  for (const m of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)) {
    const n = m[2].trim().match(TOOLTIP_COUNT);
    countById.set(m[1], n ? Number(n[1].replace(/[,.]/g, "")) : 0);
  }
  return [...dateById.entries()]
    .map(([id, date]) => ({ date, count: countById.get(id) ?? 0 }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

async function calendar(login: string, year: number) {
  const res = await fetch(`https://github.com/users/${encodeURIComponent(login)}/contributions?from=${year}-01-01&to=${year}-12-31`, {
    headers: { "User-Agent": UA },
    next: { revalidate: REVALIDATE },
  });
  if (res.status === 404) throw new NotFoundError(login);
  if (!res.ok) return [];
  return parseCalendar(await res.text()).filter((d) => d.date.startsWith(String(year)));
}

// ---------- API REST ----------

type ApiUser = { login: string; name: string | null; avatar_url: string; created_at: string; followers: number; type: string };
type ApiRepo = {
  name: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  created_at: string;
  pushed_at: string;
  fork: boolean;
  description: string | null;
};
type ApiEvent = { type: string; created_at: string; payload?: { size?: number; commits?: unknown[] } };

export const isValidLogin = (s: string) => /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(s);

export async function getDevYear(login: string, year: number, timeZoneOffsetHours = -3): Promise<DevYear> {
  if (!isValidLogin(login)) throw new NotFoundError(login);

  const [days, user, repos, events] = await Promise.all([
    calendar(login, year),
    api<ApiUser>(`/users/${login}`),
    api<ApiRepo[]>(`/users/${login}/repos?per_page=100&sort=pushed&type=owner`),
    api<ApiEvent[]>(`/users/${login}/events/public?per_page=100`),
  ]);

  // Horário dos commits pelos eventos de push recentes, no fuso de Brasília.
  let hours: number[] | null = null;
  if (events) {
    hours = new Array(24).fill(0);
    for (const e of events) {
      if (e.type !== "PushEvent") continue;
      const h = (new Date(e.created_at).getUTCHours() + 24 + timeZoneOffsetHours) % 24;
      hours[h] += Math.max(1, e.payload?.size ?? e.payload?.commits?.length ?? 1);
    }
    if (hours.every((h) => h === 0)) hours = null;
  }

  return {
    login: user?.login ?? login,
    name: user?.name ?? null,
    avatar: user?.avatar_url ?? `https://avatars.githubusercontent.com/${login}`,
    createdAt: user?.created_at ?? null,
    followers: user?.followers ?? null,
    year,
    days,
    repos: repos
      ? repos.map((r) => ({
          name: r.name,
          url: r.html_url,
          stars: r.stargazers_count,
          forks: r.forks_count,
          language: r.language,
          createdAt: r.created_at,
          pushedAt: r.pushed_at,
          fork: r.fork,
          description: r.description,
        }))
      : null,
    hours,
    limited: !user || !repos,
  };
}
