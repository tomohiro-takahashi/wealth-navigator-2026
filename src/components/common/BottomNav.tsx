
"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const BottomNavContent = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Helper to check if a link is active
    // For home and specific static pages, exact match is usually best
    // For filtered articles, we check category param
    const isActive = (path: string, category?: string) => {
        if (category) {
            return pathname === path && searchParams.get('category') === category;
        }
        return pathname === path && !searchParams.get('category');
    };

    // Special case for 'About Us' since it's a static page
    const isAboutActive = pathname === '/about';

    return (
        <nav className="fixed bottom-0 left-0 z-50 flex h-[80px] w-full items-start justify-around border-t border-white/10 bg-[#161410]/95 px-2 pt-3 backdrop-blur-md pb-6 md:hidden">
            <Link
                href="/"
                className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive("/") ? "text-[#c59f59]" : "text-gray-400 hover:text-white"
                    }`}
            >
                <span className="material-symbols-outlined text-[24px]">home</span>
                <span className="text-[10px] font-medium tracking-wide">HOME</span>
            </Link>

            <Link
                href="/articles?category=domestic"
                className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive("/articles", "domestic") ? "text-[#c59f59]" : "text-gray-400 hover:text-white"
                    }`}
            >
                <span className="material-symbols-outlined text-[24px]">domain</span>
                <span className="text-[10px] font-medium tracking-wide">国内不動産</span>
            </Link>

            <Link
                href="/articles?category=overseas"
                className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive("/articles", "overseas") ? "text-[#c59f59]" : "text-gray-400 hover:text-white"
                    }`}
            >
                <span className="material-symbols-outlined text-[24px]">public</span>
                <span className="text-[10px] font-medium tracking-wide">海外不動産</span>
            </Link>

            <Link
                href="/about"
                className={`flex flex-col items-center gap-1 p-2 transition-colors ${isAboutActive ? "text-[#c59f59]" : "text-gray-400 hover:text-white"
                    }`}
            >
                <span className="material-symbols-outlined text-[24px]">info</span>
                <span className="text-[10px] font-medium tracking-wide">About Us</span>
            </Link>
        </nav>
    );
};

export const BottomNav = () => {
    return (
        <Suspense fallback={null}>
            <BottomNavContent />
        </Suspense>
    )
}
