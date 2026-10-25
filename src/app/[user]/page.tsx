import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Stories } from "@/components/stories";
import { NotFoundError } from "@/lib/github";
import { loadShape } from "@/lib/load";

async function load(user: string) {
  try {
    return await loadShape(user);
  } catch (e) {
    if (e instanceof NotFoundError) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: PageProps<"/[user]">): Promise<Metadata> {
  const { user } = await params;
  try {
    const { dev, stats } = await loadShape(user);
    const title = `Shape Dev ${dev.year} de @${dev.login}: ${stats.level.name}`;
    const description = `${stats.total.toLocaleString("pt-BR")} contribuições, ${stats.longest.length} dias seguidos de treino. Quanto código você levantou esse ano?`;
    return { title, description, openGraph: { title, description }, twitter: { card: "summary_large_image", title, description } };
  } catch {
    return { title: "Shape Dev" };
  }
}

export default async function UserPage({ params }: PageProps<"/[user]">) {
  const { user } = await params;
  const { dev, stats, today } = await load(user);
  return <Stories dev={dev} stats={stats} today={today} />;
}
