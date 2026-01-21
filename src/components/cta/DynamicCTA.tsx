import React from 'react';
import { Button } from "@/components/ui/button";

type Props = {
    mode?: 'simulation' | 'line' | 'list' | string[] | undefined;
};

// The user has requested to fix the CTA to the LINE flow for all articles with a specific design.
// We will ignore the passed 'mode' prop for now to enforce this new "Inside Information" CTA.
export const DynamicCTA: React.FC<Props> = ({ mode }) => {

    return (
        <div className="relative py-16 px-4 overflow-hidden rounded-xl w-full my-16 shadow-2xl">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
                style={{ backgroundImage: "url('/images/wealth_lounge.jpg')" }}
            ></div>

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/80 z-0"></div>

            {/* Content */}
            <div className="relative z-10 text-center max-w-2xl mx-auto">
                <p className="text-[#D4AF37] text-xs font-bold tracking-[0.2em] uppercase mb-4">
                    Members Only Intelligence
                </p>

                <h2 className="text-2xl md:text-3xl font-serif text-white mb-6 leading-snug">
                    Webでは書けない<br />「裏情報」がある。
                </h2>

                <p className="text-gray-300 text-sm leading-relaxed mb-8">
                    この記事で公開したのは、氷山の一角です。<br className="hidden md:block" />
                    具体的な金融機関名、市場に出ない非公開物件、税務の核心...<br />
                    不特定多数には公開できない「資産防衛の真実」を、<br className="hidden md:block" />
                    LINEメンバー限定で配信します。
                </p>

                <a
                    href="https://line.me/R/ti/p/@wealth-navigator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 w-full max-w-sm mx-auto bg-[#06C755] hover:bg-[#05b54d] text-white font-bold py-4 px-8 rounded-md transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-[#06C755]/30"
                >
                    {/* LINE Icon (SVG) */}
                    <svg className="w-6 h-6 fill-current flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2.5C6.6 2.5 2.5 6.2 2.5 10.7c0 4.2 3.4 7.6 8 8.1 0.4 0.1 0.9 0.3 1 0.7 0.1 0.8-0.3 3.1-0.3 3.3 0 0-0.1 0.3 0.1 0.4 0.2 0.1 0.5 0 0.8-0.3 4.2-3.8 4.2-4.1 4.5-4.4 3.7-0.7 7.5-3.3 7.5-7.7C24 6.2 18.6 2.5 12 2.5zM12 17.1c-0.6 0-1.2 0.1-1.8 0.2 -0.9 0.2-2 1.3-3.6 2.7 0.3-1.6 0.4-2.2 0.4-2.5 -2.7-1.1-4.9-3.4-4.9-6.9 0-3.8 4.5-6.9 10-6.9 5.5 0 10 3.1 10 6.9C22 14 17.5 17.1 12 17.1z" />
                        <path d="M12 2.5C6.6 2.5 2.5 6.2 2.5 10.7c0 4.2 3.4 7.6 8 8.1 0.4 0.1 0.9 0.3 1 0.7 0.1 0.8-0.3 3.1-0.3 3.3 0 0-0.1 0.3 0.1 0.4 0.2 0.1 0.5 0 0.8-0.3 4.2-3.8 4.2-4.1 4.5-4.4 3.7-0.7 7.5-3.3 7.5-7.7C24 6.2 18.6 2.5 12 2.5z" />
                    </svg>
                    <span>LINEで「極秘情報」を受け取る</span>
                </a>

                <p className="text-xs text-gray-500 mt-4 tracking-wide">
                    ※ 登録無料・いつでもブロック可能
                </p>
            </div>
        </div>
    );
};

