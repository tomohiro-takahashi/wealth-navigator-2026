
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const BottomNav = () => {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="fixed bottom-0 left-0 z-50 flex h-[80px] w-full items-start justify-around border-t border-white/10 bg-[#161410]/95 px-2 pt-3 backdrop-blur-md pb-6 md:hidden">
            <Link
                href="/"
                className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive("/") ? "text-[#c59f59]" : "text-gray-400 hover:text-white"
                    }`}
            >
                <span className="material-symbols-outlined text-[24px]">home</span>
                <span className="text-[10px] font-medium tracking-wide">ホーム</span>
            </Link>

            <Link
                href="/articles"
                className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive("/articles") ? "text-[#c59f59]" : "text-gray-400 hover:text-white"
                    }`}
            >
                <span className="material-symbols-outlined text-[24px]">trending_up</span>
                <span className="text-[10px] font-medium tracking-wide">投資記事</span>
            </Link>

            <Link
                href="/properties"
                className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive("/properties") ? "text-[#c59f59]" : "text-gray-400 hover:text-white"
                    }`}
            >
                <span className="material-symbols-outlined text-[24px]">apartment</span>
                <span className="text-[10px] font-medium tracking-wide">厳選物件</span>
            </Link>

            <Link
                href="/about"
                className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive("/about") ? "text-[#c59f59]" : "text-gray-400 hover:text-white"
                    }`}
            >
                <span className="material-symbols-outlined text-[24px]">person</span>
                <span className="text-[10px] font-medium tracking-wide">私たち</span>
            </Link>
        </nav>
    );
};
