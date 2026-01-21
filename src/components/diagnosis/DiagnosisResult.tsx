"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
    Radar as RechartsRadar
} from "recharts";
import { motion } from "framer-motion";
import { Lock, FileText, MessageCircle, Gem, ArrowRight } from "lucide-react";
import Link from "next/link";
import { DiagnosisData } from "@/components/inquiry/MultiStepForm";

export const DiagnosisResult = () => {
    const [data, setData] = useState<DiagnosisData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate reading from local storage and analyzing
        const stored = localStorage.getItem("diagnosis_result");
        if (stored) {
            setData(JSON.parse(stored));
            setTimeout(() => setLoading(false), 2000); // Wait for "Generating..." UI
        } else {
            setLoading(false); // No data, show empty state or redirect
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1A1A1B] flex flex-col items-center justify-center text-white">
                <div className="w-20 h-20 border-4 border-accent border-t-transparent rounded-full animate-spin mb-8"></div>
                <h2 className="text-2xl font-serif font-bold animate-pulse">戦略レポートを生成中...</h2>
                <p className="text-gray-400 mt-4 text-sm tracking-widest">ANALYZING PORTFOLIO DATA</p>
            </div>
        );
    }

    if (!data) {
        return <div className="text-white text-center py-20">データが見つかりません。もう一度診断を行ってください。</div>;
    }

    // --- Logic Generation based on inputs ---
    const incomeVal = Number(data.income);

    // Determine Persona
    let personaTitle = "安定成長重視モデル";
    let advice = "現在の安定した基盤を活かし、国内不動産で着実に資産を拡大すべき時期です。";

    if (data.age === "30代" || data.age === "40代") {
        if (incomeVal >= 20000000) {
            personaTitle = "Strategic Leverage（戦略的・与信最大化モデル）";
            advice = "「45歳の融資限界」というデッドラインまで、貴殿に残された時間はあと僅かです。現在の貴殿の信用力は、日本円の価値毀損に対抗しうる最強の武器です。税引後利益で貯蓄するのではなく、「銀行の資本で資産（RC一棟等）を確保し、インフレを味方につけて債務を実質的に消滅させる」。この逆説的アプローチこそが、貴殿の最適解です。";
        }
    }
    if (data.objective === "税制対策・相続対策") {
        personaTitle = "資産防衛・継承モデル";
        advice = "資産の評価圧縮効果が高い都心不動産と、減価償却メリットのある海外不動産（米国等）を組み合わせたハイブリッド戦略を推奨します。";
    }

    // Radar Chart Data (Dummy Logic)
    const radarData = [
        { subject: '安全性', A: 80, fullMark: 100 },
        { subject: '収益性', A: (incomeVal > 15000000 ? 90 : 70), fullMark: 100 },
        { subject: '流動性', A: 85, fullMark: 100 },
        { subject: '節税効果', A: (data.objective.includes("税") ? 95 : 60), fullMark: 100 },
        { subject: '成長性', A: 75, fullMark: 100 },
    ];

    // Dynamic Total Score Calculation
    const totalScore = Math.round(
        radarData.reduce((acc, curr) => acc + curr.A, 0) / radarData.length
    );

    return (
        <div className="min-h-screen bg-[#1A1A1B] text-white pb-32">
            {/* Header */}
            <header className="py-6 border-b border-white/10 px-4">
                <div className="container mx-auto flex justify-between items-center">
                    <span className="font-display font-bold tracking-widest text-lg">STRATEGY INSIGHT</span>
                    <Gem className="text-accent w-6 h-6" />
                </div>
            </header>

            <main className="container mx-auto px-4 py-10 max-w-lg">
                {/* Verdict Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="inline-block bg-accent/20 text-accent text-xs font-bold px-3 py-1 rounded-full mb-4 border border-accent/50">
                        診断完了
                    </div>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold leading-relaxed mb-2">
                        最適な戦略をご提案します
                    </h1>
                    <p className="text-gray-400 text-xs">Analysis ID: {data.analysisId}</p>
                </motion.div>

                {/* Radar Chart Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#2C2C2E] rounded-2xl p-6 shadow-xl border border-white/5 mb-8"
                >
                    <h3 className="font-bold text-sm tracking-widest mb-4 flex items-center gap-2">
                        <div className="w-1 h-4 bg-accent"></div> 資産ポートフォリオ分析
                    </h3>
                    <div className="h-[250px] w-full flex justify-center items-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#444" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                                <RechartsRadar
                                    name="Your Portfolio"
                                    dataKey="A"
                                    stroke="#C5A059"
                                    strokeWidth={2}
                                    fill="#C5A059"
                                    fillOpacity={0.3}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                        <div className="absolute bottom-0 right-0">
                            <p className="text-xs text-gray-500">総合スコア</p>
                            <p className="text-2xl font-bold text-accent">{totalScore}<span className="text-sm text-gray-400">/100</span></p>
                        </div>
                    </div>
                </motion.div>

                {/* Verdict Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-accent/20 shadow-2xl mb-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <FileText size={100} />
                    </div>
                    <span className="text-accent text-xs font-bold tracking-widest uppercase block mb-2">RECOMMENDED STRATEGY</span>
                    <h2 className="text-2xl font-serif font-bold text-white mb-4 leading-tight">
                        {personaTitle}
                    </h2>
                    <p className="text-gray-300 font-serif leading-relaxed text-sm mb-6">
                        {advice}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        <span className="bg-white/10 px-3 py-1 rounded text-[10px] text-gray-300">#借り入れ活用</span>
                        <span className="bg-white/10 px-3 py-1 rounded text-[10px] text-gray-300">#キャピタルゲイン</span>
                        <span className="bg-white/10 px-3 py-1 rounded text-[10px] text-gray-300">#都市開発</span>
                    </div>
                </motion.div>

                {/* Locked Property Examples (Mosaic Effect) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mb-12 relative"
                >
                    <h3 className="font-bold text-sm tracking-widest mb-4 flex items-center gap-2">
                        <div className="w-1 h-4 bg-accent"></div> あなたの戦略に適合する『非公開物件』実例
                    </h3>

                    <div className="relative overflow-hidden rounded-2xl border border-white/10 group">
                        {/* Blurred Content */}
                        <div className="filter blur-md opacity-60 select-none pointer-events-none bg-[#1f1f20] p-6 space-y-4">
                            {/* Dummy Card 1 */}
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex gap-4 items-center">
                                <div className="w-16 h-16 bg-gray-700 rounded-lg"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-3/4 bg-gray-600 rounded"></div>
                                    <div className="h-3 w-1/2 bg-gray-700 rounded"></div>
                                </div>
                            </div>
                            {/* Dummy Card 2 */}
                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex gap-4 items-center">
                                <div className="w-16 h-16 bg-gray-700 rounded-lg"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-2/3 bg-gray-600 rounded"></div>
                                    <div className="h-3 w-1/2 bg-gray-700 rounded"></div>
                                </div>
                            </div>
                            {/* Dummy Text content */}
                            <div className="space-y-2 pt-2">
                                <p className="text-sm">【東京都港区】 築浅RCマンション / 利回り X.X%</p>
                                <p className="text-sm">【米国テキサス州】 集合住宅プロジェクト / IRR XX%</p>
                            </div>
                        </div>

                        {/* Lock Overlay */}
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                            <Link href="https://line.me/" className="transform transition-transform hover:scale-105">
                                <div className="bg-accent text-[#1A1A1B] px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-xl shadow-accent/20">
                                    <Lock size={18} />
                                    <span className="text-sm">LINE登録で物件情報を取得</span>
                                </div>
                            </Link>
                            <p className="text-white/70 text-[10px] mt-2 tracking-wider">※ 適合する非公開物件を自動抽出中...</p>
                        </div>
                    </div>
                </motion.div>

                {/* CTA Section (Refined Copy) */}
                <div className="space-y-4">
                    <h3 className="text-center font-display text-accent tracking-widest text-sm mb-6 uppercase">
                        Next Action<span className="text-xs text-gray-500 ml-2 normal-case tracking-normal">(この戦略を実行する)</span>
                    </h3>

                    <Link href="https://line.me/" className="block group">
                        <div className="bg-[#1f1f20] hover:bg-[#2a2a2c] transition-colors border border-white/10 rounded-xl p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                <Lock size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm text-white mb-1">情報収集する (インサイダー情報の購読)</h4>
                                <p className="text-xs text-gray-400">銀行員が決して口にしない『不動産投資の裏話』や『非公開情報』を受け取る。</p>
                            </div>
                            <ArrowRight size={16} className="text-gray-500 group-hover:text-accent transition-colors" />
                        </div>
                    </Link>

                    <Link href="/inquiry" className="block group">
                        <div className="bg-[#1f1f20] hover:bg-[#2a2a2c] transition-colors border border-white/10 rounded-xl p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                <MessageCircle size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm text-white mb-1">専門家に相談する (具体的プランの作成)</h4>
                                <p className="text-xs text-gray-400">あなたの借入余力を100%活かす『個別シミュレーション』を作成する。</p>
                            </div>
                            <ArrowRight size={16} className="text-gray-500 group-hover:text-accent transition-colors" />
                        </div>
                    </Link>
                </div>
            </main>

            {/* Floating Bottom CTA */}
            {/* Floating Bottom CTA (Capsule Style) */}
            <div className="fixed bottom-6 left-0 w-full z-50 mb-[env(safe-area-inset-bottom)] px-4 flex justify-center pointer-events-none">
                <Link
                    href="https://line.me/"
                    className="pointer-events-auto w-full max-w-md bg-accent hover:bg-accent-light text-[#1A1A1B] font-bold py-4 rounded-full shadow-2xl shadow-accent/20 flex items-center justify-center gap-3 h-auto min-h-[56px] transition-all transform hover:scale-105"
                >
                    <Lock size={20} className="shrink-0" />
                    <span>「非公開物件リスト」を解錠する</span>
                </Link>
            </div>
        </div>
    );
};
