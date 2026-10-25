import { describe, expect, it } from "vitest";
import { parseCalendar, type DevYear } from "./github";
import { archetypeOf, computeStats, languages, levelOf, periods, streaks } from "./stats";

const day = (date: string, count: number) => ({ date, count });

describe("parseCalendar", () => {
  it("junta a data do <td> com a contagem do <tool-tip>", () => {
    const html = `
      <td tabindex="0" data-ix="0" data-date="2026-01-04" id="contribution-day-component-0-1" data-level="1" class="ContributionCalendar-day"></td>
      <td tabindex="0" data-date="2026-01-05" id="contribution-day-component-1-1" data-level="0" class="ContributionCalendar-day"></td>
      <td data-date="2026-01-06" id="contribution-day-component-2-1" data-level="4" class="ContributionCalendar-day"></td>
      <tool-tip id="t1" for="contribution-day-component-0-1" class="sr-only">7 contributions on January 4th.</tool-tip>
      <tool-tip id="t2" for="contribution-day-component-1-1" class="sr-only">No contributions on January 5th.</tool-tip>
      <tool-tip id="t3" for="contribution-day-component-2-1" class="sr-only">1,204 contributions on January 6th.</tool-tip>`;
    expect(parseCalendar(html)).toEqual([day("2026-01-04", 7), day("2026-01-05", 0), day("2026-01-06", 1204)]);
  });
});

describe("streaks", () => {
  const days = [day("2026-01-01", 1), day("2026-01-02", 2), day("2026-01-03", 0), day("2026-01-04", 1), day("2026-01-05", 1), day("2026-01-06", 1), day("2026-01-07", 0)];

  it("acha a maior sequência com início e fim", () => {
    expect(streaks(days, "2026-01-07").longest).toEqual({ length: 3, start: "2026-01-04", end: "2026-01-06" });
  });

  it("a sequência atual não quebra só porque hoje ainda não teve commit", () => {
    expect(streaks(days, "2026-01-07").current).toBe(3);
  });

  it("ignora dias futuros", () => {
    expect(streaks([...days, day("2026-01-08", 5)], "2026-01-07").longest.length).toBe(3);
  });
});

describe("levelOf", () => {
  it.each([
    [0, "Frango"],
    [150, "Frango Fit"],
    [600, "Marombeiro"],
    [1200, "Monstro"],
    [3000, "Bambam"],
  ])("%i contribuições = %s", (n, name) => expect(levelOf(n).name).toBe(name));
});

describe("archetypeOf", () => {
  const base = { total: 500, longest: 5, weekendShare: 0.1, nightShare: 0.1, morningShare: 0.2, languages: 2, bestDay: 10, activeDays: 100 };
  it("coruja quando commita muito de madrugada", () => expect(archetypeOf({ ...base, nightShare: 0.5 }).id).toBe("coruja"));
  it("rato de academia com sequência longa", () => expect(archetypeOf({ ...base, longest: 45 }).id).toBe("rato"));
  it("fim de semana quando o sábado e o domingo pesam", () => expect(archetypeOf({ ...base, weekendShare: 0.5 }).id).toBe("fds"));
  it("constante quando nada se destaca", () => expect(archetypeOf(base).id).toBe("constante"));
  it("sofá quando não teve nada", () => expect(archetypeOf({ ...base, total: 0 }).id).toBe("sofa"));
});

describe("languages e periods", () => {
  it("dá mais peso pra linguagens dos repositórios mexidos no ano", () => {
    const repo = (language: string, pushedAt: string) => ({ name: language, url: "", stars: 0, forks: 0, language, createdAt: "2020-01-01", pushedAt, fork: false, description: null });
    const langs = languages([repo("TypeScript", "2026-05-01"), repo("TypeScript", "2026-06-01"), repo("Python", "2026-02-01"), repo("Java", "2019-01-01")], 2026);
    expect(langs.map((l) => l.name)).toEqual(["TypeScript", "Python"]);
  });

  it("agrupa horas em períodos do dia", () => {
    const hours = new Array(24).fill(0);
    hours[2] = 6;
    hours[20] = 2;
    const p = periods(hours);
    expect(p.favorite.id).toBe("madrugada");
    expect(p.peakHour).toBe(2);
  });
});

describe("computeStats", () => {
  it("só conta até hoje e calcula dia favorito e melhor dia", () => {
    const dev: DevYear = {
      login: "x",
      name: null,
      avatar: "",
      createdAt: null,
      followers: null,
      year: 2026,
      days: [day("2026-01-02", 3), day("2026-01-09", 5), day("2026-01-10", 1), day("2026-12-31", 99)],
      repos: null,
      hours: null,
      limited: true,
    };
    const s = computeStats(dev, "2026-10-25");
    expect(s.total).toBe(9);
    expect(s.favoriteWeekday).toBe(5); // sexta
    expect(s.best).toEqual(day("2026-01-09", 5));
    expect(s.langs).toEqual([]);
  });
});
