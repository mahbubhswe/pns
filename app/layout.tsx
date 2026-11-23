import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeModeProvider } from "@/contexts/ThemeContext";
import { getPublicSettings } from "@/features/settings";
import { Hind_Siliguri, Plus_Jakarta_Sans } from "next/font/google";

// Served from our own domain and preloaded: no extra request to Google before text shows.
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], style: ["normal", "italic"], display: "swap", variable: "--font-jakarta" });
const hind = Hind_Siliguri({ subsets: ["bengali", "latin"], weight: ["400", "500", "600", "700"], display: "swap", variable: "--font-hind" });

/** Site name and tagline come from the database (dashboard → Settings). */
export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getPublicSettings();
  return {
    title: { default: site.name, template: `%s | ${site.shortName}` },
    description: site.tagline,
    icons: { icon: { url: "/brand-mark.svg", type: "image/svg+xml" } },
  };
}

export const viewport: Viewport = { themeColor: "#0F6E56" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${jakarta.variable} ${hind.variable}`}>
      {/* Browser extensions (e.g. ColorZilla's cz-shortcut-listen) add attributes to <body>. */}
      <body suppressHydrationWarning>
        <AppRouterCacheProvider options={{ enableCssLayer: false }}>
          <ThemeModeProvider>{children}</ThemeModeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
