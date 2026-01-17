"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
    return (
        <section className="relative h-[85vh] w-full overflow-hidden bg-primary">
            {/* Background Image with Ken Burns Effect */}
            <div className="absolute inset-0 z-0">
                <motion.div
                    initial={{ scale: 1.0 }}
                    animate={{ scale: 1.1 }}
                    transition={{ duration: 20, ease: "linear", repeat: Infinity, repeatType: "mirror" }}
                    className="relative w-full h-full"
                >
                    <Image
                        src="/luxury-apartment.png"
                        alt="Luxury Asset"
                        fill
                        className="object-cover opacity-60"
                        priority
                    />
                </motion.div>
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent z-10" />
            </div>

            {/* Main Content */}
            <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-8"
                >
                    <h1 className="text-4xl md:text-6xl font-serif text-white leading-tight tracking-wide mb-6">
                        一流を、<br className="md:hidden" />再定義する。
                    </h1>
                    <p className="text-gray-200 text-sm md:text-lg tracking-[0.2em] font-light">
                        現代のビジョナリーへ贈る、<br className="md:hidden" />
                        至高のインサイト。
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <Link
                        href="/simulation"
                        className="flex items-center gap-2 bg-accent hover:bg-accent-dark text-white text-sm md:text-base px-8 py-4 rounded-full font-medium tracking-wider shadow-xl transition-all hover:scale-105"
                    >
                        資産ポートフォリオを診断する
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>

            {/* Stacked Category Navigation (Bottom Overlay) */}
            <div className="absolute bottom-10 left-0 right-0 z-30 px-4">
                <div className="max-w-md mx-auto flex flex-col gap-3 bg-primary/80 backdrop-blur-md p-4 rounded-lg border border-white/10 shadow-2xl">
                    <Link href="/properties?category=domestic" className="flex items-center justify-between group p-2 hover:bg-white/5 rounded-md transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="text-accent">🏢</span>
                            <span className="text-white font-serif tracking-widest text-sm">国内不動産投資</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-accent transition-colors" />
                    </Link>
                    <div className="h-[1px] bg-white/10 w-full" />
                    <Link href="/properties?category=overseas" className="flex items-center justify-between group p-2 hover:bg-white/5 rounded-md transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="text-accent">🌏</span>
                            <span className="text-white font-serif tracking-widest text-sm">海外不動産投資</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-accent transition-colors" />
                    </Link>
                    <div className="h-[1px] bg-white/10 w-full" />
                    <Link href="/articles" className="flex items-center justify-between group p-2 hover:bg-white/5 rounded-md transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="text-accent">🏛️</span>
                            <span className="text-white font-serif tracking-widest text-sm">資産形成コラム</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-accent transition-colors" />
                    </Link>
                </div>
            </div>
        </section>
    );
};
