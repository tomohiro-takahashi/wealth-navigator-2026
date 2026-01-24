"use client";

import { motion } from "framer-motion";
import { Check, SupportAgent, Chat, ArrowBack } from "@mui/icons-material"; // Wait, I should use lucide or material symbols as in project
import { CheckCircle, SupportAgent as SupportAgentIcon, MessageSquare, ArrowLeft, X } from "lucide-react";
import Link from "next/link";

export const KominkaThanks = () => {
    return (
        <div className="flex flex-col items-center px-6 py-4 max-w-lg mx-auto w-full font-sans text-white">
            {/* Animated Success Icon Area */}
            <div className="mb-8 flex items-center justify-center pt-10">
                <div className="relative flex items-center justify-center">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.2, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute w-24 h-24 rounded-full border-2 border-[#977e4e]/30"
                    ></motion.div>
                    <div className="w-20 h-20 rounded-full border border-[#977e4e] flex items-center justify-center bg-[#977e4e]/10">
                        <CheckCircle size={40} className="text-[#977e4e]" />
                    </div>
                </div>
            </div>

            {/* Headline & Body Text */}
            <div className="text-center mb-10">
                <h1 className="text-white tracking-wider text-[32px] font-bold leading-tight pb-4 font-serif uppercase">送信完了</h1>
                <p className="text-white/80 text-base font-normal leading-relaxed font-serif">
                    お問い合わせいただき、<br/>誠にありがとうございます。
                </p>
            </div>

            {/* EmptyState Style Content Block (Consultant Message) */}
            <div className="w-full bg-white/5 border border-white/10 rounded-xl p-6 mb-10">
                <div className="flex flex-col items-center gap-4">
                    <div className="bg-[#977e4e]/20 p-3 rounded-full">
                        <span className="material-symbols-outlined text-[#977e4e] text-2xl">support_agent</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <p className="font-serif text-white text-lg font-bold leading-tight tracking-wide text-center">専門コンサルタントが確認中</p>
                        <p className="text-white/60 text-sm font-normal leading-normal text-center">
                            通常2〜3営業日以内に、担当者より折り返しご連絡を差し上げます。今しばらくお待ちください。
                        </p>
                    </div>
                </div>
            </div>

            {/* Promotion Card (LINE) */}
            <div className="w-full mb-10">
                <div className="flex items-stretch justify-between gap-4 rounded-xl bg-gradient-to-br from-[#27241c] to-[#1a1814] border border-[#977e4e]/20 p-5 shadow-2xl relative overflow-hidden group">
                    {/* Decorative Gold Sparkle */}
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#977e4e]/10 blur-3xl rounded-full"></div>
                    <div className="flex flex-[3_3_0px] flex-col gap-4 z-10">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] bg-[#977e4e] text-black px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Exclusive</span>
                                <p className="font-serif text-[#977e4e] text-xs font-bold uppercase">公式LINE限定</p>
                            </div>
                            <p className="font-serif text-white text-base font-bold leading-tight">非公開物件のご案内</p>
                            <p className="text-white/60 text-[11px] font-normal leading-normal">
                                市場に出回らない「空き家錬金術」独自の優良物件情報をいち早くお届けします。
                            </p>
                        </div>
                        <Link 
                            href="https://line.me/R/ti/p/@kominka"
                            className="flex min-w-[120px] max-w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#06C755] text-white gap-2 text-sm font-bold leading-normal w-fit hover:brightness-110 transition-all"
                        >
                            <span className="material-symbols-outlined text-white text-lg">chat</span>
                            <span className="truncate underline font-bold">友だち追加する</span>
                        </Link>
                    </div>
                    <div className="flex-1 flex items-center justify-center z-10">
                        <div className="w-full aspect-square bg-center bg-no-repeat bg-cover rounded-lg border border-white/10 shadow-lg" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBre_6en273keHILpD2mjeWY7z6nalUZZ1c8BiqoQ5lY48Zf-4hDwSol8kcAj0JDZffdJDrCvJjt4EMH2TAb5rz-_vyN-EC_jmRH8VhtnJZ0IhfLsMeq9_juV-7u7IbShsk9_qqQFRbeCt712k7y-IbEPZ1aP7EJ8vX0g4F4jFsLk0fs8S8qjlLus7JV6Xc7nny3uiUIQgFrO14ENiDxhiux3SRxLTrM1MpigFs9H1VEndLtOrWx0Vq735KDUPCUmIWJ1iaMlIGgHw')" }}>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Action */}
            <div className="w-full mt-auto">
                <Link href="/" className="w-full py-4 border border-[#977e4e] text-[#977e4e] rounded-xl font-bold font-serif hover:bg-[#977e4e]/10 transition-colors flex items-center justify-center gap-2 uppercase">
                    <ArrowLeft size={16} />
                    トップページへ戻る
                </Link>
            </div>

            {/* Footer Logo/Brand */}
            <div className="mt-12 opacity-30 flex flex-col items-center grayscale">
                <p className="font-serif text-[10px] tracking-[0.3em] font-light uppercase">AKIYA RENKINJUTSU</p>
                <div className="w-8 h-[1px] bg-white mt-2"></div>
            </div>
        </div>
    );
};
