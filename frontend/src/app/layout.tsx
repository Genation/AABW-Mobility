import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { THEME_STORAGE_KEY } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "vietnamese"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tasco — AI-Powered Urban Intelligence",
  description:
    "Tasco hackathon dashboard featuring live AI-powered urban mobility services: RouteMate route-aware discovery and AI Search — a three-model Vietnamese search workspace.",
  keywords: ["Tasco", "Mobility", "AI", "Hackathon", "Dashboard", "AI Search"],
};

/**
 * Inline script to set theme from localStorage BEFORE hydration.
 * Prevents flash of unstyled content (FOUC).
 */
const themeInitScript = `
  (function() {
    try {
      var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
      if (stored === "light" || stored === "dark") {
        document.documentElement.setAttribute("data-theme", stored);
      } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
        document.documentElement.setAttribute("data-theme", "light");
      } else {
        document.documentElement.setAttribute("data-theme", "dark");
      }
    } catch(e) {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
