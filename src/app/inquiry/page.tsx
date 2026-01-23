import { InquiryForm } from "@/components/inquiry/InquiryForm";
import { FlipInquiryForm } from "@/components/inquiry/FlipInquiryForm";
import { Metadata } from "next";
import { getSiteConfig } from '@/site.config';
import { getBrandId } from "@/lib/brand";

export async function generateMetadata(): Promise<Metadata> {
    const siteConfig = await getSiteConfig();
    return {
        title: `Contact | ${siteConfig.name}`,
        description: "お問い合わせ・個別相談のお申し込み",
    };
}

export default async function InquiryPage() {
    const siteConfig = await getSiteConfig();
    const brandId = await getBrandId();
    const isFlip = brandId === 'flip';

    return (
        <div className={`min-h-screen pt-20 pb-20 transition-colors duration-500 ${isFlip ? 'bg-[#0B0E14]' : 'bg-[var(--color-background)]'}`}>
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-10 max-w-2xl mx-auto">
                    {isFlip ? (
                        <>
                            <div className="inline-block px-2 py-0.5 mb-4 bg-[#00eeff]/10 border border-[#00eeff]/30 text-[#00eeff] text-[10px] uppercase tracking-[0.2em] font-bold">
                                Proposal Request
                            </div>
                            <h1 className="text-white tracking-tight text-[32px] md:text-5xl font-black italic mt-2 tracking-tighter uppercase mb-6">
                                仕入れ提案の依頼
                            </h1>
                            <p className="text-gray-400 text-sm leading-relaxed border-l-2 border-[#00eeff] pl-6 max-w-md mx-auto text-left">
                                Flip Logicの専門エージェントが非公開案件から貴殿の基準にマッチする物件を抽出・提案します。
                            </p>
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>

                {/* Inquiry Form */}
                <div className="max-w-xl mx-auto">
                    {isFlip ? <FlipInquiryForm /> : <InquiryForm />}
                </div>
            </div>

            {/* Flip specific background overlay */}
            {isFlip && (
                <div className="fixed inset-0 pointer-events-none opacity-5 overflow-hidden -z-10">
                    <div className="absolute top-20 -right-20 w-80 h-80 rounded-full bg-[#00eeff] blur-[100px]"></div>
                    <div className="absolute bottom-40 -left-20 w-60 h-60 rounded-full bg-[#00eeff] blur-[80px]"></div>
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(0, 238, 255, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                </div>
            )}
        </div>
    );
}
