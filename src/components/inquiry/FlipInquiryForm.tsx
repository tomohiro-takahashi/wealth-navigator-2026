"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

export const FlipInquiryForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        area: "",
        priceRange: "",
        propertyType: "区分マンション",
        status: "",
        remarks: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, brand: 'flip' }),
            });

            if (!response.ok) throw new Error('送信に失敗しました');
            window.location.href = "/inquiry/thanks";
        } catch (error) {
            console.error(error);
            alert("送信中にエラーが発生しました。");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
            {/* Name Field */}
            <div className="px-0 py-2">
                <label className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <p className="text-white text-xs font-bold tracking-widest uppercase">01. Your Name</p>
                        <span className="bg-[#00eeff] text-black text-[9px] font-bold px-2 py-0.5 uppercase">Required</span>
                    </div>
                    <input
                        className="w-full rounded-none text-white focus:outline-none focus:ring-1 focus:ring-[#00eeff] border border-white/10 bg-[#161b22] h-14 placeholder:text-gray-600 px-4 text-base transition-all"
                        placeholder="例：山田 太郎"
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </label>
            </div>

            {/* Email Field */}
            <div className="px-0 py-2">
                <label className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <p className="text-white text-xs font-bold tracking-widest uppercase">02. Email Address</p>
                        <span className="bg-[#00eeff] text-black text-[9px] font-bold px-2 py-0.5 uppercase">Required</span>
                    </div>
                    <input
                        className="w-full rounded-none text-white focus:outline-none focus:ring-1 focus:ring-[#00eeff] border border-white/10 bg-[#161b22] h-14 placeholder:text-gray-600 px-4 text-base transition-all"
                        placeholder="example@fliplogic.jp"
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </label>
            </div>

            {/* Phone Field */}
            <div className="px-0 py-2">
                <label className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <p className="text-white text-xs font-bold tracking-widest uppercase">03. Phone Number</p>
                        <span className="bg-[#00eeff] text-black text-[9px] font-bold px-2 py-0.5 uppercase">Required</span>
                    </div>
                    <input
                        className="w-full rounded-none text-white focus:outline-none focus:ring-1 focus:ring-[#00eeff] border border-white/10 bg-[#161b22] h-14 placeholder:text-gray-600 px-4 text-base transition-all"
                        placeholder="090-0000-0000"
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                </label>
            </div>

            {/* Area Field */}
            <div className="px-0 py-2">
                <label className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <p className="text-white text-xs font-bold tracking-widest uppercase">04. Targeted Area</p>
                        <span className="bg-[#00eeff] text-black text-[9px] font-bold px-2 py-0.5 uppercase">Required</span>
                    </div>
                    <select
                        className="w-full rounded-none text-white focus:outline-none focus:ring-1 focus:ring-[#00eeff] border border-white/10 bg-[#161b22] h-14 px-4 text-base appearance-none transition-all"
                        required
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    >
                        <option value="" disabled>エリアを選択してください</option>
                        <option value="tokyo">東京都</option>
                        <option value="kanagawa">神奈川県</option>
                        <option value="saitama">埼玉県</option>
                        <option value="chiba">千葉県</option>
                        <option value="other">その他</option>
                    </select>
                </label>
            </div>

            {/* Price Range Field */}
            <div className="px-0 py-2">
                <label className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <p className="text-white text-xs font-bold tracking-widest uppercase">05. Budget Range</p>
                        <span className="bg-[#00eeff] text-black text-[9px] font-bold px-2 py-0.5 uppercase">Required</span>
                    </div>
                    <select
                        className="w-full rounded-none text-white focus:outline-none focus:ring-1 focus:ring-[#00eeff] border border-white/10 bg-[#161b22] h-14 px-4 text-base appearance-none transition-all"
                        required
                        value={formData.priceRange}
                        onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
                    >
                        <option value="" disabled>予算を選択してください</option>
                        <option value="30m">3,000万円未満</option>
                        <option value="50m">3,000万〜5,000万円</option>
                        <option value="70m">5,000万〜7,000万円</option>
                        <option value="100m">7,000万〜1億円</option>
                        <option value="over">1億円以上</option>
                    </select>
                </label>
            </div>

            {/* Property Type */}
            <div className="px-0 py-2">
                <p className="text-white text-xs font-bold tracking-widest uppercase mb-3">06. Property Type</p>
                <div className="grid grid-cols-2 gap-2">
                    {["区分マンション", "一棟アパート", "戸建て", "土地"].map((type) => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => setFormData({ ...formData, propertyType: type })}
                            className={`py-3 text-[10px] font-bold transition-all border ${
                                formData.propertyType === type
                                    ? "bg-[#00eeff] text-black border-[#00eeff]"
                                    : "bg-transparent text-white/40 border-white/10 hover:border-white/30"
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>
            </div>

            {/* Status Field */}
            <div className="px-0 py-2">
                <label className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <p className="text-white text-xs font-bold tracking-widest uppercase">07. Current Status</p>
                        <span className="bg-[#00eeff] text-black text-[9px] font-bold px-2 py-0.5 uppercase">Required</span>
                    </div>
                    <select
                        className="w-full rounded-none text-white focus:outline-none focus:ring-1 focus:ring-[#00eeff] border border-white/10 bg-[#161b22] h-14 px-4 text-base appearance-none transition-all"
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <option value="" disabled>状況を選択してください</option>
                        <option value="searching">探し始めたばかり</option>
                        <option value="comparing">具体的に比較検討中</option>
                        <option value="immediate">良いものがあれば即決したい</option>
                    </select>
                </label>
            </div>

            {/* Remarks Field */}
            <div className="px-0 py-2">
                <label className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <p className="text-white text-xs font-bold tracking-widest uppercase">08. Remarks</p>
                        <span className="bg-white/10 text-white/40 text-[9px] font-bold px-2 py-0.5 uppercase">Optional</span>
                    </div>
                    <textarea
                        className="w-full rounded-none text-white focus:outline-none focus:ring-1 focus:ring-[#00eeff] border border-white/10 bg-[#161b22] min-h-[120px] placeholder:text-gray-600 p-4 text-base transition-all"
                        placeholder="ご希望の条件や、特筆事項があれば入力してください。"
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    />
                </label>
            </div>

            {/* Submit Button Section */}
            <div className="pt-8">
                <button
                    className={`w-full bg-[#00eeff] py-5 text-black font-black text-sm tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
                        isSubmitting ? "opacity-50 cursor-not-allowed" : "shadow-[0_0_20px_rgba(0,238,255,0.3)] hover:shadow-[0_0_30px_rgba(0,238,255,0.5)]"
                    }`}
                    type="submit"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <span className="animate-pulse tracking-widest">SENDING...</span>
                    ) : (
                        <>
                            <span>提案依頼を送信する</span>
                            <span className="material-symbols-outlined text-lg">send</span>
                        </>
                    )}
                </button>
                <p className="text-center text-white/30 text-[9px] mt-6 tracking-widest font-mono uppercase opacity-50">
                    Terms & Privacy Policy Applied. Transmission via SSL.
                </p>
            </div>
        </form>
    );
};
