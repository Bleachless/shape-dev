import { cache } from "react";
import { getDevYear } from "./github";
import { computeStats } from "./stats";

// Hoje no fuso de Brasília, como "aaaa-mm-dd".
export const todayInBrazil = () => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

// A página e a imagem de compartilhamento pedem os mesmos dados: busca uma vez por requisição.
export const loadShape = cache(async (login: string) => {
  const today = todayInBrazil();
  const year = Number(today.slice(0, 4));
  const dev = await getDevYear(login, year);
  return { dev, stats: computeStats(dev, today), today };
});
