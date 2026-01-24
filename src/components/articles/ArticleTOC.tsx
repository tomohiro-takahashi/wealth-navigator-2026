"use client";

import { useEffect, useState } from "react";
import { TOCItem } from "@/lib/html-utils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const ArticleTOC = ({ toc }: { toc: TOCItem[] }) => {
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "-100px 0px -60% 0px" }
        );

        toc.forEach((item) => {
            const element = document.getElementById(item.id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [toc]);

    if (toc.length === 0) return null;

    return (
        <div className="hidden lg:block sticky top-24 ml-8 w-64 p-6 bg-primary/95 border border-white/10 rounded-xl backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-2 mb-6">
                <span className="text-accent">📑</span>
                <h4 className="text-white font-serif font-bold tracking-widest text-sm uppercase">Contents</h4>
            </div>
            <ul className="space-y-4 relative">
                {/* Active Indicator Line */}
                <div className="absolute left-0 w-[1px] bg-white/10 h-full" />

                {toc.map((item, index) => (
                    <li key={item.id} className={cn("relative pl-4 transition-all duration-300", item.level === 3 && "pl-8")}>
                        <a
                            href={`#${item.id}`}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" });
                                setActiveId(item.id);
                            }}
                            className={cn(
                                "text-xs font-medium leading-relaxed block transition-colors",
                                activeId === item.id ? "text-white font-bold scale-105" : "text-white/70 hover:text-white"
                            )}
                        >
                            <span className="mr-2 opacity-60 text-[10px]">{(index + 1).toString().padStart(2, '0')}.</span>
                            {item.text}
                        </a>
                        {activeId === item.id && (
                            <motion.div
                                layoutId="toc-indicator"
                                className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent"
                            />
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};
