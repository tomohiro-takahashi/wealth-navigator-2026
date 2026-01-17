import { User } from "lucide-react";

type Props = {
    content: string;
};

export const ExpertTip = ({ content }: Props) => {
    return (
        <div className="my-12 relative rounded-xl overflow-hidden bg-[#1f1f20] border border-accent/30 shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <User size={120} className="text-white" />
            </div>

            <div className="relative z-10 p-8">
                <div className="inline-block bg-accent text-primary text-[10px] font-bold px-3 py-1 rounded-sm mb-6 tracking-[0.2em]">
                    専門家の眼 - VERDICT
                </div>

                <div className="flex gap-6">
                    <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-accent to-accent-dark flex items-center justify-center shadow-lg border-2 border-primary">
                            <User className="text-primary w-6 h-6" />
                        </div>
                    </div>
                    <div>
                        <p className="text-white font-serif leading-loose italic text-lg opacity-90">
                            &ldquo;{content}&rdquo;
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                            <div className="h-[1px] w-8 bg-accent"></div>
                            <span className="text-xs text-accent uppercase tracking-widest">Chief Analyst / Real Estate</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
