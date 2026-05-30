import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import Header from "@/components/Header";
import OnboardingFlow from "@/components/OnboardingFlow";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-heading",
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Легендариум",
  description: "Интерактивная платформа для изучения фольклора народов России",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${manrope.variable} ${playfair.variable}`}>
        <Header />
        {children}
        <OnboardingFlow />
      </body>
    </html>
  );
}
