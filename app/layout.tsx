import type { Metadata } from "next";
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
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: false }}>
          <ThemeModeProvider>{children}</ThemeModeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
