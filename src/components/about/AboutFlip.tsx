"use client";

import React from 'react';
import Link from 'next/link';

export const AboutFlip = () => {
    return (
        <div className="bg-[#0b0e14] text-white selection:bg-[#00eeff] selection:text-[#0b0e14] font-sans min-h-screen relative overflow-x-hidden">
            <style jsx global>{`
                @keyframes scanline {
                    0% { top: -100px; }
                    100% { top: 100%; }
                }
                .animate-scanline {
                    animation: scanline 8s linear infinite;
                }
                .grid-bg {
                    background-image: linear-gradient(rgba(0, 238, 255, 0.05) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(0, 238, 255, 0.05) 1px, transparent 1px);
                    background-size: 20px 20px;
                }
            `}</style>

            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden grid-bg">
                {/* Scanline Effect */}
                <div className="fixed top-0 left-0 w-full h-[1px] bg-[#00eeff]/10 z-50 pointer-events-none animate-scanline"></div>

                {/* TopAppBar */}
                <div className="sticky top-0 z-40 flex items-center bg-[#0b0e14]/80 backdrop-blur-md p-4 pb-2 justify-between border-b border-[#00eeff]/20">
                    <Link href="/" className="text-[#00eeff] flex size-12 font-bold shrink-0 items-center justify-start">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <h2 className="text-white text-[10px] font-bold leading-tight tracking-[0.2em] flex-1 text-center uppercase">System.Information // ABOUT US</h2>
                    <div className="flex w-12 items-center justify-end">
                        <button className="flex cursor-pointer items-center justify-center rounded h-12 bg-transparent text-[#00eeff]">
                            <span className="material-symbols-outlined">share</span>
                        </button>
                    </div>
                </div>

                {/* HeroSection */}
                <div className="relative">
                    <div className="flex min-h-[440px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-start justify-end px-6 pb-12 relative overflow-hidden" 
                         style={{ 
                             backgroundImage: `linear-gradient(to bottom, rgba(11, 14, 20, 0.2) 0%, rgba(11, 14, 20, 1) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAk1lCLUWiVdKw99cJkOLz6ajvcI8-zcVNHnYb-735gr6nIVqlBOiRtpRWZU2ol9U1qAqZkLtS3c8pVOsdUe2M4YeZwIfkCJH30yLdx_10xc_19mmCKA8tLKrXJ8vGIbf8oYJ6BmGfMii9HsGdf9CGC5HKStC052cZoVgaYJ8riH-O1DoXgNFehpDhdvXUUx8YM8vQ8AYDGcMbyeXbSM4eMXl8kTCGRliqv6v2OYnErjXx-NEHzwt8sKUJKZOwlFdgMq6YRwC8Qjgo")` 
                         }}>
                        <div className="absolute top-10 right-6 opacity-20 text-[120px] font-black tracking-tighter leading-none select-none pointer-events-none">FLIP</div>
                        <div className="flex flex-col gap-4 text-left relative z-10">
                            <div className="inline-flex items-center gap-2 px-2 py-1 bg-[#00eeff] text-[#0b0e14] text-[10px] font-bold w-fit tracking-widest uppercase">
                                <span className="material-symbols-outlined !text-[12px]">terminal</span> STATUS: ANALYZING
                            </div>
                            <h1 className="text-white text-5xl font-black leading-tight tracking-tight uppercase">
                                Flip<br/><span className="text-[#00eeff]">Logic</span>
                            </h1>
                            <h2 className="text-white text-lg font-bold leading-relaxed border-l-2 border-[#00eeff] pl-4">
                                出口が見えない物件はゴミだ。
                            </h2>
                        </div>
                    </div>
                </div>

                {/* SectionHeader: Mission */}
                <div className="px-6 pt-12 pb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-[1px] w-8 bg-[#00eeff]"></div>
                        <span className="text-[#00eeff] text-[10px] font-bold tracking-[0.3em] uppercase">The Creed</span>
                    </div>
                    <h3 className="text-white text-2xl font-black leading-tight tracking-tight uppercase">MISSION: 数字だけが真実</h3>
                </div>

                {/* Stats / Mission Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                    <div className="flex flex-col gap-3 rounded p-6 bg-[#151921] border-l-4 border-[#00eeff] shadow-[0_0_15px_rgba(0,238,255,0.1)]">
                        <div className="flex justify-between items-start">
                            <p className="text-[#00eeff] text-[10px] font-bold tracking-widest uppercase">01 / REVENUE</p>
                            <span className="material-symbols-outlined text-[#00eeff]/40">trending_up</span>
                        </div>
                        <p className="text-white text-xl font-bold leading-tight">キャッシュフローより<br/>キャピタルゲイン</p>
                        <div className="h-px bg-white/10 w-full my-1"></div>
                        <p className="text-[#00eeff] text-xs font-mono">GAIN_TYPE: MAX_VAL</p>
                    </div>

                    <div className="flex flex-col gap-3 rounded p-6 bg-[#151921] border-l-4 border-[#00eeff] shadow-[0_0_15px_rgba(0,238,255,0.1)]">
                        <div className="flex justify-between items-start">
                            <p className="text-[#00eeff] text-[10px] font-bold tracking-widest uppercase">02 / VELOCITY</p>
                            <span className="material-symbols-outlined text-[#00eeff]/40">speed</span>
                        </div>
                        <p className="text-white text-xl font-bold leading-tight">回転率こそが正義</p>
                        <div className="h-px bg-white/10 w-full my-1"></div>
                        <p className="text-[#00eeff] text-xs font-mono">CYCLE_SPEED: OPTIMIZED</p>
                    </div>

                    <div className="flex flex-col gap-3 rounded p-6 bg-[#151921] border-l-4 border-[#00eeff] shadow-[0_0_15px_rgba(0,238,255,0.1)]">
                        <div className="flex justify-between items-start">
                            <p className="text-[#00eeff] text-[10px] font-bold tracking-widest uppercase">03 / LOGIC</p>
                            <span className="material-symbols-outlined text-[#00eeff]/40">calculate</span>
                        </div>
                        <p className="text-white text-xl font-bold leading-tight">ロジックによる最適化</p>
                        <div className="h-px bg-white/10 w-full my-1"></div>
                        <p className="text-[#00eeff] text-xs font-mono">ALGORITHM: ACTIVE</p>
                    </div>
                </div>

                {/* Content: Comparison Section */}
                <div className="p-6">
                    <div className="bg-[#151921] rounded-xl p-6 border border-white/5">
                        <h4 className="text-[#00eeff] text-sm font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">compare_arrows</span>
                            Flipping vs Rental logic
                        </h4>
                        <div className="space-y-6">
                            <p className="text-sm leading-relaxed text-gray-300">
                                不動産投資における「賃貸」は、時間の切り売りである。我々が提唱する「フリップ（転売）」は、情報の歪みを突くアービトラージだ。
                            </p>
                            <div className="grid grid-cols-2 gap-px bg-white/10 rounded overflow-hidden border border-white/10">
                                <div className="bg-[#0b0e14]/50 p-3 text-[10px] font-bold text-gray-400 uppercase font-mono">Metric</div>
                                <div className="bg-[#0b0e14]/50 p-3 text-[10px] font-bold text-[#00eeff] uppercase font-mono">Flip Logic</div>
                                <div className="bg-[#0b0e14] p-3 text-xs">ROI Period</div>
                                <div className="bg-[#0b0e14] p-3 text-xs text-[#00eeff] font-bold font-mono">3-6 Months</div>
                                <div className="bg-[#0b0e14] p-3 text-xs">Risk Control</div>
                                <div className="bg-[#0b0e14] p-3 text-xs text-[#00eeff] font-bold font-mono">Exit Based</div>
                                <div className="bg-[#0b0e14] p-3 text-xs">Efficiency</div>
                                <div className="bg-[#0b0e14] p-3 text-xs text-[#00eeff] font-bold font-mono">High Tier</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: The 3 Purposes */}
                <div className="p-6 space-y-8">
                    <div className="flex items-center gap-4">
                        <h2 className="text-white text-2xl font-black leading-tight uppercase">Core Purposes</h2>
                        <div className="flex-1 h-px bg-[#00eeff]/20"></div>
                    </div>
                    <div className="space-y-10">
                        <div className="relative pl-8">
                            <div className="absolute left-0 top-0 text-[#00eeff] font-mono text-sm">01</div>
                            <h5 className="text-white font-bold text-lg mb-2">体系化 / Systematization</h5>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                職人の勘を排除し、再現性のあるデータモデルへと不動産売買を昇華させる。
                            </p>
                        </div>
                        <div className="relative pl-8 border-l border-[#00eeff]/20">
                            <div className="absolute left-0 top-0 text-[#00eeff] font-mono text-sm">02</div>
                            <h5 className="text-white font-bold text-lg mb-2">日本版70%ルール / The 70% Rule</h5>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                米国の成功ロジックを日本市場にローカライズ。ARVから逆算する、絶対的な仕入れ基準。
                            </p>
                        </div>
                        <div className="relative pl-8 border-l border-[#00eeff]/20">
                            <div className="absolute left-0 top-0 text-[#00eeff] font-mono text-sm">03</div>
                            <h5 className="text-white font-bold text-lg mb-2">情報格差の正義 / Fair Info</h5>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                不透明な不動産業界のブラックボックスを破壊し、個人がプロと対等に戦える武器を提供する。
                            </p>
                        </div>
                    </div>
                </div>

                {/* Services Section */}
                <div className="bg-[#151921] mt-12 px-6 py-12 border-t border-[#00eeff]/30">
                    <div className="flex flex-col gap-2 mb-8">
                        <span className="text-[#00eeff] font-mono text-xs tracking-widest lowercase">[ DEPLOYED_SERVICES ]</span>
                        <h2 className="text-white text-3xl font-black uppercase">提供サービス</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 border border-white/5 bg-[#0b0e14]/50 rounded flex flex-col gap-4">
                            <span className="material-symbols-outlined text-[#00eeff]">hub</span>
                            <div>
                                <p className="text-white font-bold text-sm">仕入れルート</p>
                                <p className="text-[10px] text-gray-500 uppercase font-mono">Sourcing Hub</p>
                            </div>
                        </div>
                        <div className="p-4 border border-white/5 bg-[#0b0e14]/50 rounded flex flex-col gap-4">
                            <span className="material-symbols-outlined text-[#00eeff]">analytics</span>
                            <div>
                                <p className="text-white font-bold text-sm">ロジック査定</p>
                                <p className="text-[10px] text-gray-500 uppercase font-mono">Data Appraisal</p>
                            </div>
                        </div>
                        <div className="p-4 border border-white/5 bg-[#0b0e14]/50 rounded flex flex-col gap-4">
                            <span className="material-symbols-outlined text-[#00eeff]">handshake</span>
                            <div>
                                <p className="text-white font-bold text-sm">業者紹介</p>
                                <p className="text-[10px] text-gray-500 uppercase font-mono">Pro Network</p>
                            </div>
                        </div>
                        <div className="p-4 border border-white/5 bg-[#0b0e14]/50 rounded flex flex-col gap-4">
                            <span className="material-symbols-outlined text-[#00eeff]">real_estate_agent</span>
                            <div>
                                <p className="text-white font-bold text-sm">売却サポート</p>
                                <p className="text-[10px] text-gray-500 uppercase font-mono">Exit Brokerage</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="p-8 text-center bg-[#0b0e14]">
                    <h6 className="text-gray-500 text-[10px] font-bold tracking-[0.2em] mb-4 uppercase font-mono">Disclaimer // 免責事項</h6>
                    <p className="text-[10px] text-gray-600 leading-relaxed max-w-xs mx-auto">
                        不動産投資にはリスクが伴います。本サービスが提供する情報は投資の助言を目的としたものであり、利益を保証するものではありません。最終的な投資判断は自己責任において行ってください。
                    </p>
                </div>

                {/* CTA Section */}
                <div className="px-6 pb-20 pt-10 text-center relative z-10">
                    <div className="mb-8">
                        <p className="text-[#00eeff] font-mono text-xs mb-2 uppercase tracking-widest">RUN COMMAND: EXECUTE_LOGIC</p>
                        <h2 className="text-white text-2xl font-black leading-tight uppercase tracking-tight">
                            数字は嘘をつかない。<br/>
                            <span className="text-[#00eeff] italic">あとは、実行しろ。</span>
                        </h2>
                    </div>
                    <Link 
                        href="/simulation" 
                        className="w-full bg-[#00eeff] text-[#0b0e14] py-5 text-sm font-black tracking-[0.3em] uppercase rounded flex items-center justify-center gap-2 group transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(0,238,255,0.3)]"
                    >
                        Join the Flip Logic
                        <span className="material-symbols-outlined font-bold">arrow_forward</span>
                    </Link>
                </div>

                {/* Footer / Credits */}
                <div className="p-4 border-t border-white/5 flex justify-between items-center text-[8px] text-gray-600 font-mono tracking-tighter uppercase">
                    <span>© 2024 FLIP LOGIC MEDIA UNIT</span>
                    <span>SYSTEM_BUILD: V.0.8.2-BETA</span>
                </div>
            </div>
        </div>
    );
};
