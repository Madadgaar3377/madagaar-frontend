import { Outfit, Syne } from "next/font/google";
import type { ReactNode } from "react";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-auth-body",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-auth-display",
  display: "swap",
});

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${outfit.variable} ${syne.variable}`}>{children}</div>
  );
}
