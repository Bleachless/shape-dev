import Link from "next/link";
import { frangoFor, Pixels } from "@/components/pixel";
import { UserForm } from "@/components/user-form";

export default function NotFound() {
  const f = frangoFor(0, true);
  return (
    <main className="mx-auto flex min-h-[100svh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <Pixels rows={f.rows} colors={f.colors} className="anim-bob h-20 w-auto" />
      <p className="eyebrow mt-6">Erro 404</p>
      <h1 className="mt-2 font-display text-5xl uppercase">Esse aluno não está matriculado</h1>
      <p className="mt-3 text-chalk-soft">Não achei esse usuário no GitHub. Confere se digitou certinho:</p>
      <div className="mt-6 w-full">
        <UserForm autoFocus />
      </div>
      <Link href="/" className="mt-6 font-pixel text-[10px] uppercase text-chalk-dim hover:text-plate-yellow">
        ← voltar pro início
      </Link>
    </main>
  );
}
