"use client";

import { motion } from "framer-motion";
import { CheckCircle, ArrowLeft, Heart, MessageSquare, ClipboardCheck } from "lucide-react";
import Link from "next/link";

export const LegacyThanks = () => {
    return (
        <div className="flex flex-col items-center px-6 py-4 max-w-lg mx-auto w-full font-sans text-white">
            {/* Success Icon Area */}
            <div className="mb-8 flex items-center justify-center pt-10">
                <div className="relative flex items-center justify-center">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.1, opacity: 0.1 }}
                        transition={{ repeat: Infinity, duration: 2.5 }}
                        className="absolute w-24 h-24 rounded-full border-2 border-[#a68a68]/30"
                    ></motion.div>
                    <div className="w-20 h-20 rounded-full border border-[#a68a68]/30 flex items-center justify-center bg-[#a68a68]/5">
                        <CheckCircle size={40} className="text-[#a68a68]" />
                    </div>
                </div>
            </div>

            {/* Headline & Body Text */}
            <div className="text-center mb-10">
                <h1 className="text-white tracking-wider text-[28px] font-bold leading-tight pb-4">お問い合わせが完了しました</h1>
                <p className="text-white/60 text-base font-normal leading-relaxed">
                    大切なお家の将来について、<br/>ご相談いただきありがとうございます。
                </p>
            </div>

            {/* Support Message Box */}
            <div className="w-full bg-[#23211f] border border-white/5 rounded-2xl p-6 mb-10 shadow-xl">
                <div className="flex flex-col items-center gap-4">
                    <div className="bg-[#a68a68]/10 p-4 rounded-full">
                        <motion.div
                            animate={{ y: [0, -2, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                        >
                            <Heart className="text-[#a68a68]" size={28} />
                        </motion.div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-white text-lg font-bold leading-tight tracking-wide text-center">コンサルタントが内容を確認いたします</p>
                        <p className="text-white/50 text-sm font-normal leading-relaxed text-center">
                            ご家族のご意向や物件の状況を丁寧に精査し、24時間以内に専門スタッフよりご連絡させていただきます。
                        </p>
                    </div>
                </div>
            </div>

            {/* LINE Promotion Card */}
            <div className="w-full mb-10">
                <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-br from-[#1c1a16] to-[#12110f] border border-[#a68a68]/10 p-6 shadow-2xl relative overflow-hidden group">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-[#06C755]/10 rounded-lg">
                            <MessageSquare className="text-[#06C755]" size={20} />
                        </div>
                        <p className="text-[#06C755] text-sm font-bold tracking-wider">公式LINEで気軽に相談</p>
                    </div>
                    <p className="text-white text-base font-bold">専門コーディネーターが対応します</p>
                    <p className="text-white/50 text-xs font-normal leading-normal">
                        「何から始めればいいか分からない」といった漠然としたお悩みも、LINEでチャット相談いただけます。
                    </p>
                    <Link 
                        href="https://line.me/R/ti/p/@legacy"
                        className="flex items-center justify-center rounded-xl h-12 bg-[#06C755] text-white gap-2 text-sm font-bold w-full hover:brightness-110 transition-all mt-2"
                    >
                        <span>LINEで相談を継続する</span>
                    </Link>
                </div>
            </div>

            {/* Navigation Action */}
            <div className="w-full mt-auto">
                <Link href="/" className="w-full py-4 border border-white/10 text-white/60 rounded-xl font-bold hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                    <ArrowLeft size={16} />
                    トップページへ戻る
                </Link>
            </div>

            {/* Footer Brand */}
            <div className="mt-12 opacity-10 flex flex-col items-center">
                <p className="text-[10px] tracking-[0.5em] font-light uppercase">Heritage & Strategy</p>
            </div>
        </div>
    );
};
