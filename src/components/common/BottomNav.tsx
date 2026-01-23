"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { SiteConfig } from "@/types/site";

const BottomNavContent = ({ config }: { config: SiteConfig }) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isActive = (path: string, category?: string) => {
        if (category) {
            return pathname === path && searchParams.get('category') === category;
        }
        return pathname === path && !searchParams.get('category');
    };

    if (pathname === '/diagnosis/result') {
        return null;
    }

    // Use categories from config, limiting to first 2 to keep space for HOME and ABOUT
    const navItems = config.categoryNav.slice(0, 2);

    return (
        <nav className="fixed bottom-0 left-0 z-50 flex h-[80px] w-full items-start justify-around border-t border-[var(--color-border)]/20 bg-[var(--color-primary)] px-2 pt-3 backdrop-blur-md pb-6 md:hidden">
            <Link
                href="/"
                className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive("/") ? "text-[var(--color-accent)]" : "text-gray-400 hover:text-white"
                    }`}
            >
                <span className="material-symbols-outlined text-[24px]">home</span>
                <span className="text-[10px] font-medium tracking-wide">HOME</span>
            </Link>

            {navItems.map((item) => (
                <Link
                    key={item.id}
                    href={`/articles?category=${item.id}`}
                    className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive("/articles", item.id) ? "text-[var(--color-accent)]" : "text-gray-400 hover:text-white"
                        }`}
                >
                    <span className="material-symbols-outlined text-[24px]">{item.icon}</span>
                    <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                </Link>
            ))}

            <Link
                href="/about"
                className={`flex flex-col items-center gap-1 p-2 transition-colors ${pathname === '/about' ? "text-[var(--color-accent)]" : "text-gray-400 hover:text-white"
                    }`}
            >
                <span className="material-symbols-outlined text-[24px]">info</span>
                <span className="text-[10px] font-medium tracking-wide">About</span>
            </Link>
        </nav>
    );
};

export const BottomNav = ({ config }: { config: SiteConfig }) => {
    return (
        <Suspense fallback={null}>
            <BottomNavContent config={config} />
        </Suspense>
    )
}
