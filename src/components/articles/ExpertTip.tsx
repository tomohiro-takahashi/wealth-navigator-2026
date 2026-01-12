import { LucideQuote } from "lucide-react";

type Props = {
    content: string;
};

export const ExpertTip = ({ content }: Props) => {
    return (
        <div className="my-10 relative overflow-hidden rounded-lg bg-[#FDFBF7] border border-accent/20 shadow-md">
            {/* Header / Accent Bar */}
            <div className="bg-gradient-to-r from-primary to-primary-light text-white py-3 px-6 flex items-center justify-between">
                <h3 className="font-serif font-bold text-lg tracking-wider flex items-center gap-2">
                    <span className="text-accent text-xl">✦</span>
                    Expert&apos;s Eye
                </h3>
                <span className="text-xs uppercase tracking-widest text-gray-300 font-sans">Professional Commentary</span>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 relative">
                {/* Background Icon */}
                <LucideQuote className="absolute top-4 right-6 text-accent/5 w-24 h-24 transform rotate-180" />

                <div className="flex gap-4">
                    <div className="hidden md:block flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center border border-accent/30 text-accent">
                            <LucideQuote className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <p className="font-serif text-gray-800 leading-relaxed text-base md:text-lg">
                            {content}
                        </p>
                    </div>
                </div>

                {/* Footer Signature */}
                <div className="mt-6 pt-4 border-t border-accent/10 flex justify-end">
                    <div className="text-right">
                        <p className="text-xs text-gray-500 font-sans mb-1">Wealth Navigator Editorial Team</p>
                    </div>
                </div>
            </div>

            {/* Decorative Golden Line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-accent-light to-accent"></div>
        </div>
    );
};
