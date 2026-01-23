import type { Metadata } from "next";
import { Noto_Sans_JP, Shippori_Mincho } from "next/font/google"; // Removed Geist as per new design
export const dynamic = 'force-dynamic';
import "./styles.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const shipporiMincho = Shippori_Mincho({
  variable: "--font-shippori-mincho", // Correct variable name for serif
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { BottomNav } from "@/components/common/BottomNav";
import { MenuProvider } from "@/context/MenuContext";
import { getSiteConfig } from "@/site.config";
import { getBrandIdFromHost } from "@/lib/brand";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host');
  const brandId = getBrandIdFromHost(host);
  const config = await getSiteConfig(brandId);
  
  return {
    title: config.name,
    description: config.description,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const host = headersList.get('host');
  const brandId = getBrandIdFromHost(host);
  const siteConfig = await getSiteConfig(brandId);

  return (
    <html lang="ja">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>

      <body
        className={`${notoSansJP.variable} ${shipporiMincho.variable} antialiased bg-[var(--color-background)] text-[var(--color-text-main)] pt-0 flex flex-col min-h-screen font-sans`}
        style={
          {
            '--color-primary': siteConfig.theme.colors.primary,
            '--color-background': siteConfig.theme.colors.background,
            '--color-accent': siteConfig.theme.colors.accent,
            '--color-text-main': siteConfig.theme.colors.text.main,
            '--color-text-sub': siteConfig.theme.colors.text.sub,
            '--color-text-inverse': siteConfig.theme.colors.text.inverse,
            '--color-link': siteConfig.theme.colors.link,
            '--color-border': siteConfig.theme.colors.border,
            '--font-radius': siteConfig.theme.rounded === 'none' ? '0px' : siteConfig.theme.rounded === 'sm' ? '0.125rem' : siteConfig.theme.rounded === 'md' ? '0.375rem' : siteConfig.theme.rounded === 'lg' ? '0.5rem' : '1rem',
          } as React.CSSProperties
        }
        data-theme-font={siteConfig.theme.typography.fontFamily}
        data-theme-rounded={siteConfig.theme.rounded}
      >
        <MenuProvider>
          {/* pt-0 because Hero often goes under header or handles its own spacing. Resetting default top padding. */}
          <Header config={siteConfig} />
          <main className="flex-grow grow pb-24 md:pb-0">
            {children}
          </main>
          <Footer config={siteConfig} />
          <BottomNav />
        </MenuProvider>
      </body>
    </html>
  );
}
