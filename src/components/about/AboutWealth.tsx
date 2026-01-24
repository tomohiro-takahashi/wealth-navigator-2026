
import React from 'react';
import Link from 'next/link';
import { SiteConfig } from '@/types/site';

interface AboutWealthProps {
    siteConfig: SiteConfig;
}

export const AboutWealth = ({ siteConfig }: AboutWealthProps) => {
    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-main)]">
            {/* Hero Section */}
            <div className="relative py-24 px-6 md:py-32 text-center bg-[var(--color-primary)]">
                <h1 className="text-4xl md:text-5xl font-serif tracking-widest text-[var(--color-text-inverse)] mb-6">
                    ABOUT US
                </h1>
                <p className="text-[var(--color-text-sub)] text-sm md:text-base tracking-widest opacity-70">
                    私たちについて
                </p>
            </div>

            {/* Philosophy Section */}
            <section className="py-20 px-6 max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <span className="text-[var(--color-accent)] text-xs tracking-widest uppercase border-b border-[var(--color-accent)] pb-2">Our Philosophy</span>
                    <h2 className="text-3xl md:text-4xl font-serif mt-8 mb-8 leading-relaxed text-[var(--color-text-main)]">
                        資産は、<br className="md:hidden" />自由の翼である。
                    </h2>
                </div>

                <div className="space-y-8 text-[var(--color-text-sub)] leading-loose font-light text-justify md:text-left">
                    <p>
                        資産とは、数字の羅列ではない。それは、選択肢である。望む場所に住み、望む時間を生き、望む人々と過ごす。その自由を手にするための、静かなる力である。
                    </p>
                    <p>
                        しかし今、その翼を脅かす風が吹いている。円の構造的弱体化、金利のある世界への回帰、および巷に溢れる「錬金術」という名の幻想。30年以上、不動産市場の最前線に立ち続けてきた私たちは知っている。バブル崩壊で資産を失った者、リーマンショックで退場を余儀なくされた者、およびコロナ禍でも揺るがなかった者。その差は、情報の質と、判断の速度にあった。
                    </p>
                    <p>
                        {siteConfig.name}は、煽らない。甘言を弄さない。私たちが届けるのは、嵐の中でも進路を見失わないための「羅針盤」——厳選されたインテリジェンスと、本質を見抜く視座である。
                    </p>
                    <p className="text-[var(--color-text-main)] text-lg font-medium text-center mt-12">
                        知識こそが、最強の防衛策。<br />
                        および、真の自由への最短距離である。
                    </p>
                </div>
            </section>

            {/* About Us Section */}
            <section className="py-20 px-6 bg-[var(--color-primary)]/5">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-12 items-start">
                        <div className="md:w/1/3">
                            <h3 className="text-2xl font-serif text-[var(--color-text-main)] mb-2">About Us</h3>
                            <p className="text-[var(--color-accent)] text-sm">私たちについて</p>
                            <div className="w-12 h-0.5 bg-[var(--color-accent)] mt-6"></div>
                        </div>

                        <div className="md:w-2/3 space-y-6 text-[var(--color-text-sub)] leading-relaxed">
                            <p>
                                {siteConfig.name}は、特定の不動産会社に属さない独立したメディアである。私たちは売主ではない。だからこそ、一切のポジショントークがない。業界にとって都合の悪い真実も、あなたにとって耳の痛い現実も、中立的な立場で伝える。私たちは、あなたの味方である。
                            </p>
                            <p>
                                年収800万円を超えたあなたは、日本の給与所得者の上位数%に位置する。選ばれた人間には、それに相応しい教養と判断力が求められる。しかし、高い報酬を得る者ほど、巧みなセールストークの標的になりやすいのもまた事実である。
                            </p>
                            <p>
                                運営するのは、不動産・金融・メディアの領域で実績を重ねたプロフェッショナルによる少数精鋭のチーム。大組織の論理に縛られない機動力と、現場で培った知見を武器に、富裕層の「影の参謀」として機能する。
                            </p>
                            <p>
                                これからの時代、金利は上昇し、円の価値は揺らぎ、かつての常識は通用しなくなる。その荒波を乗り越えるために必要なのは、正しい知識と、信頼できる羅針盤である。{siteConfig.name}は、あなたの傍らに置いていただける「資産防衛のバイブル」として、更新を続けていく。
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-20 px-6 text-center">
                <h3 className="text-2xl font-serif mb-6 text-[var(--color-text-main)]">個別のご相談はこちら</h3>
                <p className="text-[var(--color-text-sub)] mb-8">あなたの状況に合わせた最適なポートフォリオを診断いたします。</p>
                <Link href="/inquiry" className="inline-block border border-[var(--color-accent)] px-10 py-3 text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors duration-300 tracking-widest uppercase font-bold">
                    Contact
                </Link>
            </section>
        </div>
    );
};
