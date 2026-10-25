import type { Metadata, Viewport } from "next";
import { Anton, Silkscreen, Space_Grotesk } from "next/font/google";
import "./globals.css";

const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"] });
const grotesk = Space_Grotesk({ variable: "--font-grotesk", subsets: ["latin"] });
const silk = Silkscreen({ variable: "--font-silk", weight: ["400", "700"], subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Shape Dev · seu ano no GitHub como se fosse um treino",
  description: "Quanto código você levantou esse ano? Digite seu usuário do GitHub e veja seu shape de dev: carga, frequência, grupos musculares e nível.",
};

export const viewport: Viewport = { themeColor: "#0d0e0c", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${anton.variable} ${grotesk.variable} ${silk.variable} antialiased`}>
      <body className="min-h-screen overflow-x-hidden font-sans text-chalk">{children}</body>
    </html>
  );
}
