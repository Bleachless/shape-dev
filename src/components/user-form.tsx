"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const VALID = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

// Campo do usuário do GitHub. Aceita "@fulano" e link do perfil também.
export function UserForm({ autoFocus = false, compact = false }: { autoFocus?: boolean; compact?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const login = value
      .trim()
      .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
      .replace(/^@/, "")
      .split(/[/?#]/)[0];
    if (!VALID.test(login)) {
      setError("Esse não parece um usuário do GitHub.");
      return;
    }
    setError("");
    setLoading(true);
    router.push(`/${login}`);
  };

  return (
    <form onSubmit={submit} className="w-full">
      <div className={`flex w-full gap-2 ${compact ? "" : "flex-col sm:flex-row"}`}>
        <label className="relative flex-1">
          <span className="sr-only">Usuário do GitHub</span>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-pixel text-sm text-chalk-dim">github.com/</span>
          <input
            autoFocus={autoFocus}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="seu-usuario"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="h-14 w-full rounded-sm border-2 border-line bg-iron-2 pl-[8.6rem] pr-4 text-lg text-chalk outline-none transition placeholder:text-chalk-dim focus:border-plate-yellow"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="h-14 shrink-0 rounded-sm bg-plate-red px-6 font-pixel text-sm uppercase text-chalk shadow-[0_4px_0_#9c2a1c] transition active:translate-y-1 active:shadow-none disabled:opacity-60"
        >
          {loading ? "Pesando..." : "Ver meu shape"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-plate-red">{error}</p>}
    </form>
  );
}
