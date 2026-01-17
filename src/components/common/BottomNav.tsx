"use client";

import Link from "next/link";
import { Home, TrendingUp, Gem, User } from "lucide-react";
import { usePathname } from "next/navigation";

export const BottomNav = () => {
    const pathname = usePathname();

    const navItems = [
        { label: "ホーム", href: "/", icon: Home },
        { label: "投資", href: "/properties", icon: TrendingUp },
        { label: "コンシェルジュ", href: "/simulation", icon: Gem },
        { label: "マイページ", href: "/mypage", icon: User },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? "text-primary" : "text-gray-400"
                                }`}
                        >
                            <Icon className={`w-6 h-6 ${isActive ? "fill-primary" : ""}`} strokeWidth={1.5} />
                            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};
