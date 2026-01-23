
import React from 'react';
import { Metadata } from 'next';
import { getSiteConfig } from '@/site.config';

export async function generateMetadata(): Promise<Metadata> {
    const siteConfig = await getSiteConfig();
    return {
        title: `Privacy Policy | ${siteConfig.name}`,
        description: 'プライバシーポリシー',
    };
}

export default async function PrivacyPolicy() {
    const siteConfig = await getSiteConfig();
    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-sub)] py-20 px-4 pt-32">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-serif text-[var(--color-text-main)] mb-10 text-center">プライバシーポリシー</h1>

                <div className="space-y-8 leading-relaxed font-sans text-sm md:text-base">
                    <p>
                        {siteConfig.name}運営事務局（以下「当事務局」といいます）は、本ウェブサイト「{siteConfig.name}」（以下「本サイト」といいます）をご利用いただくユーザーの皆様の個人情報の保護に関し、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定め、適切な取り扱いと保護に努めます。
                    </p>

                    <section>
                        <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-4 border-b border-[var(--color-border)] pb-2">1. 個人情報の定義</h2>
                        <p>本ポリシーにおいて「個人情報」とは、個人情報の保護に関する法律（以下「個人情報保護法」といいます）に定める個人情報を指し、生存する個人に関する情報であって、氏名、メールアドレス、電話番号、その他の記述等により特定の個人を識別できる情報、または個人識別符号が含まれる情報をいいます。</p>
                    </section>
                    
                    {/* ... (rest of the content remains same, just replacing hardcoded colors/siteConfig) ... */}
                    <section>
                        <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-4 border-b border-[var(--color-border)] pb-2">2. 個人情報の取得方法</h2>
                        <p>本サイトのお問い合わせフォーム、資料請求フォーム、無料相談申込フォーム等を通じて、ユーザーご自身が入力・送信された情報を取得します。</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-4 border-b border-[var(--color-border)] pb-2">3. 個人情報の利用目的</h2>
                        <p>当事務局は、取得した個人情報を、お問い合わせへの回答、資料の送付、提携パートナーへの紹介等の目的で利用いたします。</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-[var(--color-text-main)] mb-4 border-b border-[var(--color-border)] pb-2">8. お問い合わせ窓口</h2>
                        <p>本ポリシーに関するお問い合わせは、以下の窓口までご連絡ください。</p>
                        <div className="mt-4 p-4 bg-[var(--color-primary)]/5 rounded-lg border border-[var(--color-border)]">
                            <p className="font-bold text-[var(--color-text-main)]">{siteConfig.name} 運営事務局</p>
                            <p className="mt-2">メールアドレス：<a href={`mailto:${siteConfig.email}`} className="text-[var(--color-link)] hover:underline">{siteConfig.email}</a></p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
