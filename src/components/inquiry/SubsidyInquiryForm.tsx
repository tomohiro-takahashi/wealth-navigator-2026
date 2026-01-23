'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Check, Send, Phone, Mail, MessageSquare } from 'lucide-react';

export default function SubsidyInquiryForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log("Subsidy Inquiry Submitted");
        router.push("/inquiry/thanks");
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-[#FEF2E4]">
                {/* Decoration Header */}
                <div className="h-4 bg-gradient-to-r from-[#FF9D2E] to-[#E87A00]" />
                
                <div className="p-6 md:p-12">
                    <div className="text-center mb-12">
                        <h1 className="text-2xl md:text-3xl font-black text-[#4A3F35] mb-4">
                            無料サポートのお申し込み
                        </h1>
                        <p className="text-[#888] text-sm md:text-base leading-relaxed">
                            住宅診断のプロが、あなたにぴったりの補助金活用法を<br className="hidden md:block" />
                            アドバイスいたします。無理な営業は一切ありませんのでご安心ください。
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Name Section */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 font-bold text-[#4A3F35]">
                                <span>お名前</span>
                                <span className="bg-[#E87A00] text-white text-[10px] px-1.5 py-0.5 rounded leading-none">必須</span>
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    required
                                    type="text"
                                    placeholder="姓"
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-[#EEE] focus:border-[#FF9D2E] focus:outline-none bg-[#FFFBF7] transition-all"
                                />
                                <input
                                    required
                                    type="text"
                                    placeholder="名"
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-[#EEE] focus:border-[#FF9D2E] focus:outline-none bg-[#FFFBF7] transition-all"
                                />
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 font-bold text-[#4A3F35]">
                                <span>ご住所</span>
                                <span className="bg-[#E87A00] text-white text-[10px] px-1.5 py-0.5 rounded leading-none">必須</span>
                            </label>
                            <input
                                required
                                type="text"
                                placeholder="例：東京都渋谷区1-2-3"
                                className="w-full px-6 py-4 rounded-2xl border-2 border-[#EEE] focus:border-[#FF9D2E] focus:outline-none bg-[#FFFBF7] transition-all"
                            />
                        </div>

                        {/* Tel Section */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 font-bold text-[#4A3F35]">
                                <span>電話番号</span>
                                <span className="bg-[#E87A00] text-white text-[10px] px-1.5 py-0.5 rounded leading-none">必須</span>
                            </label>
                            <input
                                required
                                type="tel"
                                placeholder="例：090-1234-5678"
                                className="w-full px-6 py-4 rounded-2xl border-2 border-[#EEE] focus:border-[#FF9D2E] focus:outline-none bg-[#FFFBF7] transition-all"
                            />
                        </div>

                        {/* Email Section */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 font-bold text-[#4A3F35]">
                                <span>メールアドレス</span>
                                <span className="bg-[#CCC] text-white text-[10px] px-1.5 py-0.5 rounded leading-none">任意</span>
                            </label>
                            <input
                                type="email"
                                placeholder="例：example@mail.com"
                                className="w-full px-6 py-4 rounded-2xl border-2 border-[#EEE] focus:border-[#FF9D2E] focus:outline-none bg-[#FFFBF7] transition-all"
                            />
                        </div>

                        {/* Consultation Section */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 font-bold text-[#4A3F35]">
                                <span>ご相談内容</span>
                                <span className="bg-[#CCC] text-white text-[10px] px-1.5 py-0.5 rounded leading-none">任意</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    '補助金について詳しく知りたい',
                                    'リフォームの計画を立てたい',
                                    '概算の見積もりが欲しい',
                                    'その他のお問い合わせ',
                                ].map(item => (
                                    <label key={item} className="flex items-center gap-3 p-4 rounded-2xl border-2 border-[#EEE] bg-[#FFFBF7] cursor-pointer hover:border-[#FF9D2E] transition-all group">
                                        <input type="checkbox" className="hidden peer" />
                                        <div className="w-5 h-5 rounded border-2 border-[#DDD] peer-checked:bg-[#FF9D2E] peer-checked:border-[#FF9D2E] flex items-center justify-center transition-colors">
                                            <Check size={14} className="text-white" />
                                        </div>
                                        <span className="text-sm text-[#4A3F35] font-medium">{item}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Preference Section */}
                        <div className="space-y-4">
                            <label className="flex items-center gap-2 font-bold text-[#4A3F35]">
                                <span>希望の連絡方法</span>
                                <span className="bg-[#CCC] text-white text-[10px] px-1.5 py-0.5 rounded leading-none">任意</span>
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'phone', label: '電話', icon: Phone },
                                    { id: 'email', label: 'メール', icon: Mail },
                                    { id: 'line', label: 'LINE', icon: MessageSquare },
                                ].map(item => (
                                    <label key={item.id} className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-[#EEE] bg-[#FFFBF7] cursor-pointer hover:border-[#FF9D2E] transition-all">
                                        <input type="radio" name="preference" className="hidden peer" />
                                        <item.icon size={20} className="text-[#888] peer-checked:text-[#E87A00]" />
                                        <span className="text-xs font-bold text-[#4A3F35]">{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Agreement */}
                        <div className="pt-6 border-t border-[#EEE]">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input required type="checkbox" className="hidden peer" />
                                <div className="mt-1 w-6 h-6 rounded border-2 border-[#DDD] peer-checked:bg-[#FF9D2E] peer-checked:border-[#FF9D2E] flex items-center justify-center transition-colors flex-shrink-0">
                                    <Check size={16} className="text-white" />
                                </div>
                                <span className="text-sm text-[#888] leading-relaxed group-hover:text-[#4A3F35] transition-colors">
                                    個人情報の取り扱いに関する規約、およびプライバシーポリシーに同意して申し込む。
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-8">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-6 rounded-full text-white font-black text-xl shadow-xl transition-all flex items-center justify-center gap-3 relative overflow-hidden group ${
                                    isSubmitting ? 'bg-gray-400' : 'bg-gradient-to-r from-[#FF9D2E] to-[#E87A00] hover:scale-[1.02] active:scale-95'
                                }`}
                            >
                                {isSubmitting ? (
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        送信する
                                        <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer Security Badge */}
                <div className="bg-[#FEF2E4] p-6 flex flex-col md:flex-row items-center justify-center gap-4 text-[#888]">
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={20} className="text-[#E87A00]" />
                        <span className="text-xs font-bold uppercase tracking-widest">SSL Secure Connection</span>
                    </div>
                    <div className="h-px w-12 bg-[#DDD] hidden md:block" />
                    <p className="text-[10px] text-center md:text-left">
                        お送りいただいた情報はSSL暗号化通信により保護され、安全に送信されます。<br />
                        また、入力された個人情報は本人の許可なく第三者に提供されることはありません。
                    </p>
                </div>
            </div>
            
            <div className="mt-12 text-center">
                <button
                    onClick={() => router.back()}
                    className="text-[#888] text-sm font-bold flex items-center gap-2 mx-auto hover:text-[#4A3F35] transition-colors"
                >
                    戻る
                </button>
            </div>
        </div>
    );
}
