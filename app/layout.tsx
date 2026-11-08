import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ThemeModeProvider } from "@/contexts/ThemeContext";
import { getPublicSettings } from "@/features/settings";

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

const FONTS =
  "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,500&display=swap";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: false }}>
          <ThemeModeProvider>{children}</ThemeModeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
