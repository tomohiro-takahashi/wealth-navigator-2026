"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Check, Phone, Mail, MessageSquare, ChevronLeft } from "lucide-react";

export const KominkaInquiryForm = () => {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Form States
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        areas: [] as string[],
        propertyTypes: [] as string[],
        budget: '500〜1,000万円',
        targetYield: '10%以上',
        usage: [] as string[],
        status: '情報収集中',
        message: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const contextMessage = `
【空き家投資 提案依頼】
希望エリア: ${formData.areas.join(', ') || '未選択'}
物件種別: ${formData.propertyTypes.join(', ') || '未選択'}
ご予算: ${formData.budget}
希望利回り: ${formData.targetYield}
活用目的: ${formData.usage.join(', ') || '未選択'}
現在の状況: ${formData.status}
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
                    type: 'KOMINKA_INQUIRY'
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

    const toggleItem = (list: string[], item: string) => {
        return list.includes(item)
            ? list.filter(i => i !== item)
            : [...list, item];
    };

    return (
        <div className="max-w-lg mx-auto pb-24 font-sans text-white">
            {/* Header Style */}
            <div className="px-4 pt-6 pb-2">
                <h2 className="text-[#977e4e] text-xs font-bold tracking-[0.2em] uppercase mb-1 font-manrope">Inquiry Form</h2>
                <h3 className="text-white text-2xl font-bold leading-tight font-serif">お客様情報とご希望条件</h3>
                <p className="text-gray-400 text-sm mt-2">
                    専任のコンサルタントが最適な空き家投資物件をご提案いたします。
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                {/* Section: Personal Information */}
                <section className="px-4 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="h-px w-8 bg-[#977e4e]/40"></span>
                        <span className="text-[10px] font-bold tracking-widest text-[#977e4e] uppercase font-manrope">Personal</span>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-gray-200 text-sm font-semibold flex items-center gap-2">
                            お名前 <span className="text-[10px] bg-[#977e4e]/20 text-[#977e4e] px-1.5 py-0.5 rounded">必須</span>
                        </label>
                        <input 
                            required
                            className="w-full rounded-xl text-white border border-[#977e4e]/30 bg-[#1c1a16] focus:border-[#977e4e] focus:ring-1 focus:ring-[#977e4e] h-14 px-4 text-base transition-all outline-none placeholder:text-gray-600" 
                            placeholder="例：山田 太郎" 
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-gray-200 text-sm font-semibold flex items-center gap-2">
                            メールアドレス <span className="text-[10px] bg-[#977e4e]/20 text-[#977e4e] px-1.5 py-0.5 rounded">必須</span>
                        </label>
                        <input 
                            required
                            className="w-full rounded-xl text-white border border-[#977e4e]/30 bg-[#1c1a16] focus:border-[#977e4e] focus:ring-1 focus:ring-[#977e4e] h-14 px-4 text-base transition-all outline-none placeholder:text-gray-600" 
                            placeholder="example@akiya-renkin.jp" 
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-gray-200 text-sm font-semibold flex items-center gap-2">
                            電話番号 <span className="text-[10px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded uppercase">Optional</span>
                        </label>
                        <input 
                            className="w-full rounded-xl text-white border border-[#977e4e]/30 bg-[#1c1a16] focus:border-[#977e4e] focus:ring-1 focus:ring-[#977e4e] h-14 px-4 text-base transition-all outline-none placeholder:text-gray-600" 
                            placeholder="09012345678" 
                            type="tel"
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                </section>

                {/* Section: Property Criteria */}
                <section className="px-4 space-y-6 pt-4">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="h-px w-8 bg-[#977e4e]/40"></span>
                        <span className="text-[10px] font-bold tracking-widest text-[#977e4e] uppercase font-manrope">Requirements</span>
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-gray-200 text-sm font-semibold">希望エリア (複数選択可)</label>
                        <div className="flex flex-wrap gap-2">
                            {['東京23区', '東京都下', '神奈川県', '千葉県', '埼玉県'].map(area => (
                                <button
                                    key={area}
                                    type="button"
                                    onClick={() => setFormData({...formData, areas: toggleItem(formData.areas, area)})}
                                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                                        formData.areas.includes(area) 
                                            ? 'bg-[#977e4e] border-[#977e4e] text-[#121212]' 
                                            : 'bg-transparent border-[#977e4e]/30 text-gray-400 hover:border-[#977e4e]/60'
                                    }`}
                                >
                                    {area}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-gray-200 text-sm font-semibold">物件種別</label>
                        <div className="flex flex-wrap gap-2">
                            {['戸建て(連棟)', '戸建て(切り離し)', '区分マンション', '一棟アパート'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData({...formData, propertyTypes: toggleItem(formData.propertyTypes, type)})}
                                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                                        formData.propertyTypes.includes(type) 
                                            ? 'bg-[#977e4e] border-[#977e4e] text-[#121212]' 
                                            : 'bg-transparent border-[#977e4e]/30 text-gray-400 hover:border-[#977e4e]/60'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-gray-200 text-sm font-semibold">ご予算</label>
                            <div className="relative">
                                <select 
                                    className="appearance-none w-full rounded-xl text-white border border-[#977e4e]/30 bg-[#1c1a16] focus:border-[#977e4e] focus:ring-1 focus:ring-[#977e4e] h-14 px-4 text-sm outline-none cursor-pointer"
                                    value={formData.budget}
                                    onChange={e => setFormData({...formData, budget: e.target.value})}
                                >
                                    <option>〜500万円</option>
                                    <option>500〜1,000万円</option>
                                    <option>1,000〜2,000万円</option>
                                    <option>2,000万円〜</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-4 text-[#977e4e] pointer-events-none">expand_more</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-gray-200 text-sm font-semibold">希望利回り</label>
                            <div className="relative">
                                <select 
                                    className="appearance-none w-full rounded-xl text-white border border-[#977e4e]/30 bg-[#1c1a16] focus:border-[#977e4e] focus:ring-1 focus:ring-[#977e4e] h-14 px-4 text-sm outline-none cursor-pointer"
                                    value={formData.targetYield}
                                    onChange={e => setFormData({...formData, targetYield: e.target.value})}
                                >
                                    <option>8%以上</option>
                                    <option>10%以上</option>
                                    <option>12%以上</option>
                                    <option>15%以上</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-4 text-[#977e4e] pointer-events-none">expand_more</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="text-gray-200 text-sm font-semibold">活用目的</label>
                        <div className="flex flex-wrap gap-2">
                            {['賃貸運用', '転売目的', '民泊運用', '自己居住'].map(use => (
                                <button
                                    key={use}
                                    type="button"
                                    onClick={() => setFormData({...formData, usage: toggleItem(formData.usage, use)})}
                                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                                        formData.usage.includes(use) 
                                            ? 'bg-[#977e4e] border-[#977e4e] text-[#121212]' 
                                            : 'bg-transparent border-[#977e4e]/30 text-gray-400 hover:border-[#977e4e]/60'
                                    }`}
                                >
                                    {use}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-gray-200 text-sm font-semibold">現在の状況</label>
                        <div className="relative">
                            <select 
                                className="appearance-none w-full rounded-xl text-white border border-[#977e4e]/30 bg-[#1c1a16] focus:border-[#977e4e] focus:ring-1 focus:ring-[#977e4e] h-14 px-4 text-sm outline-none cursor-pointer"
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value})}
                            >
                                <option>情報収集中</option>
                                <option>良い物件があればすぐに購入したい</option>
                                <option>まずは融資の相談をしたい</option>
                                <option>既に数件所有している</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-4 text-[#977e4e] pointer-events-none">expand_more</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-gray-200 text-sm font-semibold">備考・ご要望</label>
                        <textarea 
                            className="w-full rounded-xl text-white border border-[#977e4e]/30 bg-[#1c1a16] focus:border-[#977e4e] focus:ring-1 focus:ring-[#977e4e] h-40 p-4 text-base transition-all outline-none placeholder:text-gray-600 resize-none" 
                            placeholder="その他、具体的なご要望があればご記入ください（例：駅徒歩10分以内希望など）"
                            value={formData.message}
                            onChange={e => setFormData({...formData, message: e.target.value})}
                        />
                    </div>
                </section>

                {/* Bottom Disclaimer & Button */}
                <section className="px-4 pb-12 pt-4">
                    <p className="text-[11px] text-gray-500 text-center mb-6 leading-relaxed">
                        送信前に弊社の<span className="text-[#977e4e] underline cursor-pointer">プライバシーポリシー</span>をご確認ください。<br/>
                        ご入力いただいた情報は、物件提案およびサービスのご案内のために利用させていただきます。
                    </p>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`w-full h-16 rounded-xl shadow-[0_8px_30px_rgb(151,126,78,0.3)] transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
                            isSubmitting ? "opacity-50 cursor-not-allowed bg-gray-600" : "bg-[#977e4e] hover:bg-[#977e4e]/90 text-[#121212] font-black"
                        }`}
                    >
                        <span className="text-lg font-serif tracking-widest uppercase">提案依頼を送信する</span>
                        <Send size={20} className={isSubmitting ? "hidden" : "material-symbols-outlined"} />
                    </button>
                </section>
            </form>
        </div>
    );
};
