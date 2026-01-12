import React from 'react';
import { Button } from "@/components/ui/button";

type Props = {
    mode?: 'simulation' | 'line' | 'list' | string[] | undefined;
};

export const DynamicCTA: React.FC<Props> = ({ mode }) => {
    // microCMSのセレクトフィールドは配列で返ってくることがあるため、最初の要素を取得
    const modeValue = Array.isArray(mode) ? mode[0] : mode;

    if (!modeValue) {
        return null;
    }

    const getContent = () => {
        switch (modeValue) {
            case 'line':
                return {
                    title: "Exclusive Intelligence",
                    subtitle: "最新の市場動向と非公開情報を、あなたの手元に。",
                    buttonText: "LINEで最新情報を受け取る",
                    buttonLink: "https://line.me/",
                    buttonColor: "bg-[#06C755] hover:bg-[#05b34c]"
                };
            case 'simulation':
                return {
                    title: "Wealth Simulation",
                    subtitle: "収益性を見える化し、確かな投資判断を。",
                    buttonText: "無料収支シミュレーション",
                    buttonLink: "/simulation",
                    buttonColor: "bg-accent hover:bg-accent-dark"
                };
            case 'list':
            default:
                return {
                    title: "Private Collection",
                    subtitle: "一般公開されない、選ばれた極上の物件リスト。",
                    buttonText: "非公開物件リストを請求",
                    buttonLink: "/inquiry",
                    buttonColor: "bg-primary hover:bg-primary-light"
                };
        }
    };

    const content = getContent();

    return (
        <div className="relative w-full my-16 rounded-sm overflow-hidden shadow-2xl group">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: "url('/images/luxury_banner.png')" }}
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />

            {/* Content */}
            <div className="relative z-10 p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="text-center md:text-left">
                    <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase mb-2 block">
                        Premium Service
                    </span>
                    <h3 className="text-3xl md:text-4xl font-display font-medium text-white mb-3">
                        {content.title}
                    </h3>
                    <p className="text-gray-300 font-serif text-sm md:text-base max-w-lg leading-relaxed">
                        {content.subtitle}
                    </p>
                </div>

                <div className="w-full md:w-auto flex-shrink-0">
                    <a
                        href={content.buttonLink}
                        target={modeValue === 'line' ? "_blank" : undefined}
                        rel={modeValue === 'line' ? "noopener noreferrer" : undefined}
                        className={`
                            block w-full md:w-auto text-center text-white py-4 px-10 
                            font-medium tracking-wide shadow-lg transition-all duration-300 
                            transform hover:-translate-y-1 hover:shadow-xl
                            ${content.buttonColor}
                        `}
                    >
                        {content.buttonText}
                    </a>
                    <p className="mt-3 text-[10px] text-center text-gray-400 font-light">
                        ※ 登録・相談は無料です
                    </p>
                </div>
            </div>
        </div>
    );
};

