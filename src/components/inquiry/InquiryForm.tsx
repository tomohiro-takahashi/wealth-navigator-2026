"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Send, CheckCircle } from "lucide-react";

export const InquiryForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
        type: "general" // general | second-opinion | trouble
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [agreed, setAgreed] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/inquiry', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('送信に失敗しました');
            }

            console.log("Form Submitted Successfully");
            window.location.href = "/inquiry/thanks";
        } catch (error) {
            console.error("Submission Error:", error);
            alert("送信中にエラーが発生しました。時間をおいて再度お試しください。");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8 bg-[#1f1f20] p-8 md:p-10 rounded-2xl border border-white/10 shadow-2xl">

                {/* Limited Availability Warning (Dark Premium Style) */}
                <div className="mb-8 p-6 bg-white/5 border-l-4 border-[#C5A059] rounded-r-lg shadow-lg backdrop-blur-sm">
                    <h3 className="text-lg font-serif text-[#C5A059] mb-3 flex items-center gap-2">
                        <span>✦</span> 申請にあたってのお願い
                    </h3>
                    <p className="text-sm text-gray-300 leading-7">
                        実戦経験豊富なプロフェッショナルが一人ひとりの資産状況を分析し、オーダーメイドの戦略を立案しています。そのため、
                        <span className="text-white font-bold decoration-[#C5A059] underline underline-offset-4 decoration-2 mx-1">
                            「毎月10名様限定」
                        </span>
                        の対応とさせていただいております。本気で資産を守り、戦略的に資産を運用されたい方以外の「情報収集のみ」の申請はご遠慮ください。
                    </p>
                </div>

                {/* Context Selector */}
                <div className="space-y-4">
                    <Label className="text-gray-400 text-xs uppercase tracking-widest">ご相談内容の種別</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: "second-opinion" })}
                            className={`p-4 rounded-xl border text-left transition-all ${formData.type === "second-opinion"
                                ? "bg-accent/20 border-accent text-white"
                                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                }`}
                        >
                            <span className="block font-bold text-sm mb-1">セカンドオピニオン</span>
                            <span className="text-xs opacity-70">他社提案の診断・比較</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, type: "trouble" })}
                            className={`p-4 rounded-xl border text-left transition-all ${formData.type === "trouble"
                                ? "bg-red-500/20 border-red-500 text-white"
                                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                }`}
                        >
                            <span className="block font-bold text-sm mb-1">緊急トラブル相談</span>
                            <span className="text-xs opacity-70">空室・税務・管理など</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">お名前 <span className="text-accent text-xs ml-1">*Required</span></Label>
                        <Input
                            id="name"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="山田 太郎"
                            className="bg-white/5 border-white/10 text-white h-12 focus:border-accent"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">メールアドレス <span className="text-accent text-xs ml-1">*Required</span></Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="taro.yamada@example.com"
                            className="bg-white/5 border-white/10 text-white h-12 focus:border-accent"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-white">お電話番号 <span className="text-accent text-xs ml-1">*Required</span></Label>
                        <Input
                            id="phone"
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="090-1234-5678"
                            className="bg-white/5 border-white/10 text-white h-12 focus:border-accent"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message" className="text-white">ご相談詳細</Label>
                        <Textarea
                            id="message"
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="検討中の物件URLや、具体的にお困りの内容をご記入ください。"
                            className="bg-white/5 border-white/10 text-white min-h-[120px] focus:border-accent"
                        />
                    </div>
                </div>

                {/* Legal Disclaimer & Agreement */}
                <div className="space-y-4 pt-4 border-t border-white/10">
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="agreement"
                            required
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="mt-1 w-5 h-5 rounded border-gray-500 bg-white/5 text-accent focus:ring-accent"
                        />
                        <label htmlFor="agreement" className="text-sm text-gray-300 leading-relaxed cursor-pointer">
                            <span className="font-bold text-white">以下の免責事項と方針に同意し、真剣に相談を希望します。</span>
                            <ul className="list-disc list-outside pl-4 mt-2 space-y-1 text-xs text-gray-400">
                                <li>投資の結果を保証するものではありません。</li>
                                <li>冷やかしや不動産会社による調査目的ではありません。</li>
                                <li>本サイト運営者は宅地建物取引業法に基づく『媒介』業務は行いません。具体的な物件紹介や契約業務は、提携する適正な免許を有する不動産会社が行うことに同意します。</li>
                            </ul>
                        </label>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting || !agreed}
                        className="w-full bg-accent hover:bg-accent-dark text-white font-bold py-4 rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                    >
                        {isSubmitting ? (
                            <span className="animate-pulse">送信中...</span>
                        ) : (
                            <>
                                診断審査に申し込む (無料) <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-4">
                        ※ 強引な営業は一切行いません。安心してご相談ください。
                    </p>
                </div>
            </form>
        </div>
    );
};
