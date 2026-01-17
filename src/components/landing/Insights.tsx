"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Article } from "@/types";
import { ArrowRight, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InsightsProps {
    articles: Article[];
}

export const Insights = ({ articles }: InsightsProps) => {
    const [activeTab, setActiveTab] = useState<"domestic" | "overseas" | "column">("domestic");

    const filteredArticles = articles.filter(article =>
        article.category?.includes(activeTab)
    );

    // Find Featured article within the active tab, or just take the first one if none featured
    const featuredArticle = filteredArticles.find(a => a.is_featured) || filteredArticles[0];
    const standardArticles = filteredArticles.filter(a => a.id !== featuredArticle?.id);

    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <span className="text-accent text-sm tracking-[0.2em] font-bold block mb-2 uppercase">
                        Guest Lounge
                    </span>
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-primary">
                        至高のインサイト
                    </h2>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-12 border-b border-gray-200">
                    {([
                        { id: "domestic", label: "国内不動産" },
                        { id: "overseas", label: "海外不動産" },
                        { id: "column", label: "資産コラム" }
                    ] as const).map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-8 py-4 text-sm tracking-widest transition-all relative ${activeTab === tab.id
                                    ? "text-primary font-bold"
                                    : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent"
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Featured Article */}
                        {featuredArticle && (
                            <div className="mb-12">
                                <Link href={`/articles/${featuredArticle.slug}`} className="group block relative rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                                    <div className="grid grid-cols-1 md:grid-cols-2">
                                        <div className="relative h-[300px] md:h-auto overflow-hidden">
                                            <Image
                                                src={featuredArticle.eyecatch?.url || "/luxury-apartment.png"}
                                                alt={featuredArticle.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute top-4 left-4 bg-accent text-white text-xs font-bold px-3 py-1 tracking-widest uppercase">
                                                {featuredArticle.badge_text || "ESSENTIAL / 必読"}
                                            </div>
                                        </div>
                                        <div className="bg-primary text-white p-8 md:p-12 flex flex-col justify-center">
                                            <div className="flex items-center gap-4 text-gray-400 text-xs mb-4">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(featuredArticle.publishedAt).toLocaleDateString()}</span>
                                                <span>{featuredArticle.category?.join(", ")}</span>
                                            </div>
                                            <h3 className="text-2xl md:text-3xl font-serif font-bold leading-relaxed mb-6 group-hover:text-accent transition-colors">
                                                {featuredArticle.title}
                                            </h3>
                                            <span className="flex items-center gap-2 text-sm tracking-widest text-accent uppercase font-medium">
                                                Read Article <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )}

                        {/* Standard Articles Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {standardArticles.slice(0, 6).map((article) => (
                                <Link key={article.id} href={`/articles/${article.slug}`} className="group block">
                                    <div className="relative h-[200px] overflow-hidden rounded-md mb-4 shadow-md group-hover:shadow-xl transition-all duration-500">
                                        <Image
                                            src={article.eyecatch?.url || "/luxury-apartment.png"}
                                            alt={article.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(article.publishedAt).toLocaleDateString()}</span>
                                    </div>
                                    <h4 className="text-lg font-serif font-bold text-primary leading-relaxed group-hover:text-accent transition-colors">
                                        {article.title}
                                    </h4>
                                </Link>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                <div className="text-center mt-12">
                    <Link href="/articles" className="inline-block border-b border-primary pb-1 text-sm tracking-widest hover:text-accent hover:border-accent transition-colors">
                        VIEW ALL ARTICLES &rarr;
                    </Link>
                </div>
            </div>
        </section>
    );
};
