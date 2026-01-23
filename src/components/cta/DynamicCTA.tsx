import React from 'react';
import { Button } from "@/components/ui/button";
import { SiteConfig } from '@/types/site';

type Props = {
    mode?: 'simulation' | 'line' | 'list' | string[] | undefined;
    config: SiteConfig;
};

// The user has requested to fix the CTA to the LINE flow for all articles with a specific design.
// We will ignore the passed 'mode' prop for now to enforce this new "Inside Information" CTA.
export const DynamicCTA: React.FC<Props> = ({ mode, config }) => {
    const cta = config.cta;
    const isLine = cta.type === 'line_quiz' || cta.type === 'line_simple' || cta.description.includes('LINE');
    const linkUrl = cta.lineUrl || cta.assetUrl || "https://line.me/R/ti/p/@wealth-navigator"; // Fallback

    return (
        <div className="relative py-16 px-4 overflow-hidden rounded-xl w-full my-16 shadow-2xl group">
            {/* Background - Use primary color gradient if no image */}
            {/* Background - Use image if available, otherwise gradient */}
            {cta.image ? (
                <>
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url('${cta.image}')` }}
                    ></div>
                    <div className="absolute inset-0 bg-black/60"></div>
                </>
            ) : (
                <div
                    className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] opacity-90 transition-transform duration-700 group-hover:scale-105"
                ></div>
            )}

            {/* Texture/Image Overlay if available (omitted for now as new config has no asset except assetUrl which is for download) */}

            {/* Content */}
            <div className="relative z-10 text-center max-w-2xl mx-auto">
                <p className="text-[var(--color-background)] opacity-90 text-xs font-bold tracking-[0.2em] uppercase mb-4">
                    {config.name} Limit
                </p>

                <h2
                    className="text-2xl md:text-3xl font-serif text-[var(--color-background)] mb-6 leading-snug"
                    dangerouslySetInnerHTML={{ __html: cta.title.replace(/\n/g, '<br/>') }}
                />

                <div
                    className="text-[var(--color-background)] opacity-90 text-sm leading-relaxed mb-8"
                    dangerouslySetInnerHTML={{ __html: cta.description.replace(/\n/g, '<br/>') }}
                />

                <a
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-3 w-full max-w-sm mx-auto bg-white hover:bg-gray-100 text-[var(--color-primary)] font-bold py-4 px-8 rounded-md transition-all transform hover:-translate-y-1 shadow-lg"
                >
                    {isLine && (
                        <svg className="w-6 h-6 flex-shrink-0 fill-[#06C755]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2.5C6.6 2.5 2.5 6.2 2.5 10.7c0 4.2 3.4 7.6 8 8.1 0.4 0.1 0.9 0.3 1 0.7 0.1 0.8-0.3 3.1-0.3 3.3 0 0-0.1 0.3 0.1 0.4 0.2 0.1 0.5 0 0.8-0.3 4.2-3.8 4.2-4.1 4.5-4.4 3.7-0.7 7.5-3.3 7.5-7.7C24 6.2 18.6 2.5 12 2.5zM12 17.1c-0.6 0-1.2 0.1-1.8 0.2 -0.9 0.2-2 1.3-3.6 2.7 0.3-1.6 0.4-2.2 0.4-2.5 -2.7-1.1-4.9-3.4-4.9-6.9 0-3.8 4.5-6.9 10-6.9 5.5 0 10 3.1 10 6.9C22 14 17.5 17.1 12 17.1z" />
                            <path d="M12 2.5C6.6 2.5 2.5 6.2 2.5 10.7c0 4.2 3.4 7.6 8 8.1 0.4 0.1 0.9 0.3 1 0.7 0.1 0.8-0.3 3.1-0.3 3.3 0 0-0.1 0.3 0.1 0.4 0.2 0.1 0.5 0 0.8-0.3 4.2-3.8 4.2-4.1 4.5-4.4 3.7-0.7 7.5-3.3 7.5-7.7C24 6.2 18.6 2.5 12 2.5z" />
                        </svg>
                    )}
                    <span>{cta.buttonText}</span>
                </a>

                {isLine && (
                    <p className="text-xs text-[var(--color-background)] opacity-70 mt-4 tracking-wide">
                        ※ 登録無料・いつでもブロック可能
                    </p>
                )}
            </div>
        </div>
    );
};

