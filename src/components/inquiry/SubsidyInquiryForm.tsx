'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, Check, Send, Phone, Mail, MessageSquare } from 'lucide-react';

export default function SubsidyInquiryForm() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form States
    const [formData, setFormData] = useState({
        lastName: '',
        firstName: '',
        address: '',
        phone: '',
        email: '',
        consultations: [] as string[],
        preference: 'phone'
    });

    // Handle pre-filling from simulation
    React.useEffect(() => {
        const stored = localStorage.getItem("subsidy_result");
        if (stored) {
            try {
                const result = JSON.parse(stored);
                const parts = result.applicableSubsidies?.map((s: any) => s.name).join(', ') || '';
                const maxAmount = result.totalMaxAmount?.toLocaleString() || '';
                
                setFormData(prev => ({
                    ...prev,
                    consultations: ['補助金について詳しく知りたい'],
                    // Store detailed context in a hidden or message field if needed
                    // For now, let's just pre-fill the name or message
                }));
                
                console.log("[Form] Detected simulation result. Pre-filling context.");
            } catch (e) {
                console.error("Failed to parse stored result", e);
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const message = `
【補助金相談】
住所: ${formData.address}
相談内容: ${formData.consultations.join(', ')}
希望連絡方法: ${formData.preference}

※シミュレーション結果がある場合はここに詳細を付記することも可能
            `.trim();

            const response = await fetch('/api/inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${formData.lastName} ${formData.firstName}`,
                    email: formData.email || 'no-email@provided.com',
                    phone: formData.phone,
                    message: message,
                    type: 'SUBSIDY_INQUIRY'
                })
            });

            if (response.ok) {
                console.log("Subsidy Inquiry Submitted Successfully");
                router.push("/inquiry/thanks");
            } else {
                alert("送信に失敗しました。時間をおいて再度お試しください。");
            }
        } catch (error) {
            console.error("Submission error:", error);
            alert("通信エラーが発生しました。");
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleConsultation = (item: string) => {
        setFormData(prev => ({
            ...prev,
            consultations: prev.consultations.includes(item)
                ? prev.consultations.filter(c => c !== item)
                : [...prev.consultations, item]
        }));
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
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
                                    value={formData.lastName}
                                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full px-6 py-4 rounded-2xl border-2 border-[#EEE] focus:border-[#FF9D2E] focus:outline-none bg-[#FFFBF7] transition-all"
                                />
                                <input
                                    required
                                    type="text"
                                    placeholder="名"
                                    value={formData.firstName}
                                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
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
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
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
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
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
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
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
                                    <label key={item} 
                                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                            formData.consultations.includes(item) ? 'border-[#FF9D2E] bg-[#FFFBF7]' : 'border-[#EEE] bg-white'
                                        }`}
                                    >
                                        <input 
                                            type="checkbox" 
                                            className="hidden" 
                                            checked={formData.consultations.includes(item)}
                                            onChange={() => toggleConsultation(item)}
                                        />
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                            formData.consultations.includes(item) ? 'bg-[#FF9D2E] border-[#FF9D2E]' : 'border-[#DDD]'
                                        }`}>
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
                                    <label key={item.id} 
                                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                                            formData.preference === item.id ? 'border-[#FF9D2E] bg-[#FFFBF7]' : 'border-[#EEE] bg-white'
                                        }`}
                                    >
                                        <input 
                                            type="radio" 
                                            name="preference" 
                                            className="hidden" 
                                            checked={formData.preference === item.id}
                                            onChange={() => setFormData({ ...formData, preference: item.id })}
                                        />
                                        <item.icon size={20} className={formData.preference === item.id ? 'text-[#E87A00]' : 'text-[#888]'} />
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
