import { InquiryForm } from "@/components/inquiry/InquiryForm";
import { Metadata } from "next";
import { siteConfig } from '@/site.config';



export const metadata: Metadata = {
    title: `Contact | ${siteConfig.name}`,
    description: "お問い合わせ・個別相談のお申し込み",
};

export default function InquiryPage() {
    return (
        <div className="min-h-screen pt-20 pb-20 bg-[#1A1A1B]">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-10 max-w-2xl mx-auto">
                    <span className="text-accent text-sm tracking-widest font-bold block mb-3 animate-fade-in-up uppercase">Strategic Asset Defense & Second Opinion</span>
                    <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-10 animate-fade-in-up delay-100">
                        資産防衛戦略 /<br />セカンドオピニオン申請
                    </h1>

                    <div className="max-w-3xl mx-auto text-center mb-10 px-4 animate-fade-in-up delay-200">
                        {/* Top Separator (Maintained) */}
                        <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mx-auto mb-6"></div>

                        {/* Question (Tightened) */}
                        <h2 className="text-xl md:text-2xl font-serif font-medium text-white leading-snug mb-4 drop-shadow-sm">
                            その物件、本当に適正ですか？<br />
                            あるいは、確かな<span className="text-[#D4AF37]">「資産防衛ロードマップ」</span>をお持ちですか？
                        </h2>

                        {/* Explanation (Tightened) */}
                        <p className="text-sm md:text-[15px] text-gray-400 font-normal leading-relaxed tracking-wide">
                            他社シミュレーションの精査（セカンドオピニオン）から、<br className="hidden md:block" />
                            あなたの属性を最大限に活かす「ゼロからの戦略立案」まで。<br />
                            <span className="block mt-3 md:mt-2">30年の実績を持つプロフェッショナルが、あなただけの正解を導き出します。</span>
                        </p>

                        {/* Bottom Separator (Maintained) */}
                        <div className="w-20 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent mx-auto mt-6"></div>
                    </div>
                </div>

                {/* Inquiry Form */}
                <InquiryForm />
            </div>
        </div>
    );
}
