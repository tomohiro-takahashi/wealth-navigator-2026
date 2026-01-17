import { MicroCMSImage } from "microcms-js-sdk";
import Image from "next/image";

type Props = {
    image?: MicroCMSImage;
    title: string;
};

export const ArticleEyecatch = ({ image, title }: Props) => {
    // 画像がない場合のデフォルト画像
    const imageUrl = image?.url || '/luxury-apartment.png';
    const isDefault = !image?.url;

    return (
        <div className="mb-10 rounded-xl overflow-hidden shadow-xl aspect-video relative group">
            <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover transform transition-transform duration-700 group-hover:scale-105"
            />
            {/* Overlay for default image to ensure text contrast if we overlay text, 
                or just to add premium feel */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent pointer-events-none" />

            {isDefault && (
                <div className="absolute bottom-4 right-4 text-white/50 text-xs font-serif tracking-widest uppercase">
                    Wealth Navigator Original
                </div>
            )}
        </div>
    );
};
