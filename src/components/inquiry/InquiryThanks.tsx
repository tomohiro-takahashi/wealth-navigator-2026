"use client";

import { useEffect, useState } from "react";
import { CheckCircle, QrCode, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

type Props = {
    brandId: string;
};

export const InquiryThanks = ({ brandId }: Props) => {
    const isFlip = brandId === 'flip';

    if (brandId === 'subsidy') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 py-12 text-center bg-[var(--color-background)]">
                <div className="w-full max-w-lg">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-24 h-24 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-8"
                    >
                        <CheckCircle size={48} className="text-[var(--color-primary)]" />
                    </motion.div>
                    <h1 className="text-3xl font-black text-[var(--color-text-main)] mb-6">お申し込み完了</h1>
                    <p className="text-[var(--color-text-sub)] mb-10 leading-relaxed text-lg">
                        この度は「おうちの補助金相談室」へお申し込みいただき、誠にありがとうございます。内容を確認次第、担当アドバイザーより順次ご連絡させていただきます。
                    </p>
                    <Link href="/" className="inline-flex items-center gap-2 bg-[var(--color-primary)] text-white px-10 py-4 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
                        トップページへ戻る
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-[60vh] flex flex-col items-center justify-center px-6 py-12 text-center animate-fade-in`}>
            {brandId === 'flip' ? (
                /* Flip Logic Cyber Thanks */
                <div className="w-full max-w-md">
                    {/* Status Indicator */}
                    <div className="mb-2 flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#00eeff] animate-pulse"></span>
                        <span className="text-[#00eeff] text-[9px] tracking-[0.3em] font-medium uppercase">System Status: Transmission Verified</span>
                    </div>

                    {/* Hero Icon */}
                    <div className="relative mb-10 mt-8 group inline-block">
                        <div className="absolute inset-0 bg-[#00eeff]/20 blur-3xl rounded-full scale-75"></div>
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            {/* Decorative Brackets */}
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#00eeff]"></div>
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#00eeff]"></div>
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#00eeff]"></div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#00eeff]"></div>
                            {/* Main Icon */}
                            <CheckCircle size={64} className="text-[#00eeff] drop-shadow-[0_0_15px_rgba(0,238,255,0.8)]" />
                        </div>
                    </div>

                    <div className="space-y-2 mb-8">
                        <h1 className="text-white tracking-[0.1em] text-4xl font-black italic glow-text uppercase">
                            送信完了
                        </h1>
                        <p className="text-[#00eeff]/60 text-[10px] tracking-[0.5em] font-bold">TRANSMISSION COMPLETE</p>
                    </div>

                    <div className="max-w-xs mx-auto space-y-6">
                        <div className="h-px w-10 bg-[#00eeff]/30 mx-auto"></div>
                        <p className="text-white/80 text-sm font-medium leading-relaxed">
                            お問い合わせありがとうございます。<br />
                            エージェントが内容を確認し、24時間以内に通信を開始します。
                        </p>
                        <div className="h-px w-10 bg-[#00eeff]/30 mx-auto"></div>
                    </div>

                    <div className="mt-10 flex flex-col items-center opacity-30 gap-1">
                        <span className="text-[8px] font-mono uppercase tracking-[0.3em] text-[#00eeff]">Data_Packet: Success</span>
                        <span className="text-[8px] font-mono uppercase tracking-[0.3em] text-[#00eeff]">Encryption: AES-256 Enabled</span>
                    </div>

                    <div className="mt-12 flex flex-col gap-4">
                        <Link href="/" className="group flex items-center justify-center h-14 border border-[#00eeff]/40 bg-transparent text-[#00eeff] text-xs font-bold tracking-[0.2em] transition-all hover:bg-[#00eeff]/10 uppercase">
                            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                            Return to Mission Control
                        </Link>
                        <div className="text-[9px] text-white/20 font-mono tracking-widest uppercase">
                            UID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
                        </div>
                    </div>
                </div>
            ) : (
                /* Standard Premium Thanks */
                <div className="w-full max-w-lg">
                    <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-8 text-accent">
                        <CheckCircle size={40} />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-white mb-6">お問い合わせ完了</h1>
                    <p className="text-gray-400 mb-10 leading-relaxed text-lg">
                        内容を確認の上、担当コンサルタントより<br />
                        24時間以内にご連絡いたします。
                    </p>
                    <div className="p-8 bg-white/5 rounded-2xl border border-white/10 text-left mb-10">
                        <p className="text-xs text-gray-500 mb-3 uppercase tracking-widest font-bold">NEXT ACTION</p>
                        <p className="text-gray-300 leading-relaxed">
                            お急ぎの場合は、自動返信メールに記載の<br />
                            <span className="text-accent font-bold">「プライベート直通LINE」</span>からもご連絡いただけます。
                        </p>
                    </div>
                    <Link href="/" className="inline-flex items-center gap-2 text-accent font-bold hover:underline">
                        <ArrowLeft size={18} /> トップページへ戻る
                    </Link>
                </div>
            )}
        </div>
    );
};
