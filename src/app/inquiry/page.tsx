import { InquiryForm } from "@/components/inquiry/InquiryForm";
import { Metadata } from "next";
import { getSiteConfig } from '@/site.config';

export async function generateMetadata(): Promise<Metadata> {
    const siteConfig = await getSiteConfig();
    return {
        title: `Contact | ${siteConfig.name}`,
        description: "お問い合わせ・個別相談のお申し込み",
    };
}

export default async function InquiryPage() {
    const siteConfig = await getSiteConfig();
    return (
        <div className="min-h-screen pt-20 pb-20 bg-[var(--color-background)]">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-10 max-w-2xl mx-auto">
                    <span className="text-[var(--color-accent)] text-sm tracking-widest font-bold block mb-3 uppercase">Strategic Asset Defense & Second Opinion</span>
                    <h1 className="text-3xl md:text-5xl font-display font-bold text-[var(--color-text-main)] mb-10">
                        資産防衛戦略 /<br />セカンドオピニオン申請
                    </h1>

                    <div className="max-w-3xl mx-auto text-center mb-10 px-4">
                        <div className="w-20 h-px bg-[var(--color-accent)]/50 mx-auto mb-6"></div>

                        <h2 className="text-xl md:text-2xl font-serif font-medium text-[var(--color-text-main)] leading-snug mb-4">
                            その物件、本当に適正ですか？<br />
                            あるいは、確かな<span className="text-[var(--color-accent)]">「資産防衛ロードマップ」</span>をお持ちですか？
                        </h2>

                        <p className="text-sm md:text-[15px] text-[var(--color-text-sub)] font-normal leading-relaxed tracking-wide">
                            他社シミュレーションの精査（セカンドオピニオン）から、<br className="hidden md:block" />
                            あなたの属性を最大限に活かす「ゼロからの戦略立案」まで。<br />
                            <span className="block mt-3 md:mt-2">30年の実績を持つプロフェッショナルが、あなただけの正解を導き出します。</span>
                        </p>

                        <div className="w-20 h-px bg-[var(--color-accent)]/50 mx-auto mt-6"></div>
                    </div>
                </div>

                {/* Inquiry Form */}
                <InquiryForm />
            </div>
        </div>
    );
}
