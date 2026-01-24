"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, ArrowLeft, Home, FileText, Heart, User, Check, Smartphone, Mail, MapPin } from "lucide-react";

export const LegacyInquiryForm = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        location: '',
        types: [] as string[],
        message: ''
    });

    const consultationTypes = [
        "売却査定 (いくらで売れるか)",
        "賃貸活用 (家賃収入)",
        "リフォーム・解体見積もり",
        "遺品整理・管理",
        "その他"
    ];

    const toggleType = (type: string) => {
        setFormData(prev => ({
            ...prev,
            types: prev.types.includes(type)
                ? prev.types.filter(t => t !== type)
                : [...prev.types, type]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.types.length === 0) {
            alert("ご相談の種別を少なくとも1つ選択してください。");
            return;
        }

        setIsSubmitting(true);
        
        try {
            const contextMessage = `
【相続・実家相談 提案依頼】
物件所在地: ${formData.location}
相談種別: ${formData.types.join(', ')}
備考: ${formData.message}
            `.trim();

            const response = await fetch('/api/inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    message: contextMessage,
                    type: 'LEGACY_INQUIRY'
                })
            });

            if (response.ok) {
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

    return (
        <div className="flex flex-col min-h-screen bg-[#1c1916] text-white font-sans max-w-md mx-auto border-x border-white/5 shadow-2xl pb-32">
            {/* Header Section */}
            <div className="px-6 py-8">
                <p className="text-[#a68a68] text-sm font-semibold tracking-widest uppercase mb-1">Inquiry Form</p>
                <h1 className="text-2xl font-bold text-white mb-2">詳細なご相談</h1>
                <p className="text-white/60 text-sm leading-relaxed">
                    専門のスタッフがお客様の物件に合わせた最適なプランをご提案いたします。必要事項をご記入の上、送信してください。
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 px-6">
                {/* 1. お名前 */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <label className="text-white text-sm font-medium">お名前</label>
                        <span className="bg-[#a68a68]/20 text-[#a68a68] text-[10px] px-2 py-0.5 rounded font-bold">必須</span>
                    </div>
                    <input 
                        required
                        className="w-full rounded-lg text-white border border-white/10 bg-white/5 focus:border-[#a68a68] focus:ring-1 focus:ring-[#a68a68] h-14 placeholder:text-white/30 px-4 text-base transition-all outline-none" 
                        placeholder="例：山田 太郎" 
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>

                {/* 2. お電話番号 */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <label className="text-white text-sm font-medium">お電話番号</label>
                        <span className="bg-[#a68a68]/20 text-[#a68a68] text-[10px] px-2 py-0.5 rounded font-bold">必須</span>
                    </div>
                    <input 
                        required
                        className="w-full rounded-lg text-white border border-white/10 bg-white/5 focus:border-[#a68a68] focus:ring-1 focus:ring-[#a68a68] h-14 placeholder:text-white/30 px-4 text-base transition-all outline-none" 
                        placeholder="090-0000-0000" 
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                </div>

                {/* 3. メールアドレス */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <label className="text-white text-sm font-medium">メールアドレス</label>
                        <span className="bg-[#a68a68]/20 text-[#a68a68] text-[10px] px-2 py-0.5 rounded font-bold">必須</span>
                    </div>
                    <input 
                        required
                        className="w-full rounded-lg text-white border border-white/10 bg-white/5 focus:border-[#a68a68] focus:ring-1 focus:ring-[#a68a68] h-14 placeholder:text-white/30 px-4 text-base transition-all outline-none" 
                        placeholder="example@mail.com" 
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                </div>

                {/* 4. 実家の所在地 */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <label className="text-white text-sm font-medium">実家の所在地</label>
                        <span className="bg-[#a68a68]/20 text-[#a68a68] text-[10px] px-2 py-0.5 rounded font-bold">必須</span>
                    </div>
                    <input 
                        required
                        className="w-full rounded-lg text-white border border-white/10 bg-white/5 focus:border-[#a68a68] focus:ring-1 focus:ring-[#a68a68] h-14 placeholder:text-white/30 px-4 text-base transition-all outline-none" 
                        placeholder="市区町村・番地（査定に必要です）" 
                        type="text"
                        value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                </div>

                {/* 5. ご相談の種別 */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <label className="text-white text-sm font-medium">ご相談の種別</label>
                        <span className="bg-[#a68a68]/20 text-[#a68a68] text-[10px] px-2 py-0.5 rounded font-bold">必須</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {consultationTypes.map(type => (
                            <button 
                                key={type}
                                type="button"
                                onClick={() => toggleType(type)}
                                className={`px-4 py-2 rounded-full border text-xs font-semibold transition-all ${
                                    formData.types.includes(type)
                                    ? 'border-[#a68a68] bg-[#a68a68] text-[#1c1916]'
                                    : 'border-white/10 bg-white/5 text-white/70 hover:border-[#a68a68]/50'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 6. 詳細・ご要望 */}
                <div className="flex flex-col gap-2 text-white">
                    <label className="text-white text-sm font-medium">詳細・ご要望</label>
                    <textarea 
                        className="w-full rounded-lg text-white border border-white/10 bg-white/5 focus:border-[#a68a68] focus:ring-1 focus:ring-[#a68a68] min-h-[140px] placeholder:text-white/30 p-4 text-base transition-all outline-none resize-none" 
                        placeholder="その他気になることや、ご希望の連絡時間帯などがございましたらご記入ください。"
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                    />
                </div>

                {/* Submit Area */}
                <div className="pt-8">
                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full bg-[#a68a68] hover:bg-[#a68a68]/90 text-[#1c1916] font-extrabold py-5 rounded-xl shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 group ${isSubmitting ? 'opacity-50' : ''}`}
                    >
                        <span>{isSubmitting ? '送信中...' : '相談を申し込む'}</span>
                        <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                </div>
            </form>

            <div className="mt-12 opacity-20 flex flex-col items-center pb-12 grayscale">
                <p className="text-[10px] tracking-[0.3em] font-light uppercase tracking-widest">Heritage & Strategy Consulting</p>
                <div className="w-8 h-[1px] bg-white mt-2"></div>
            </div>

            {/* Mobile Nav Mockup for design match */}
            <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-[#1c1916]/95 border-t border-white/10 px-8 py-2 pb-6 flex justify-between items-center z-40 backdrop-blur-md">
                <div className="flex flex-col items-center gap-1 opacity-40">
                    <Home size={20} />
                    <span className="text-[10px]">ホーム</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-[#a68a68]">
                    <FileText size={20} className="fill-[#a68a68]" />
                    <span className="text-[10px]">ご相談</span>
                </div>
                <div className="flex flex-col items-center gap-1 opacity-40">
                    <Heart size={20} />
                    <span className="text-[10px]">お気に入り</span>
                </div>
                <div className="flex flex-col items-center gap-1 opacity-40">
                    <User size={20} />
                    <span className="text-[10px]">マイページ</span>
                </div>
            </nav>
        </div>
    );
};
