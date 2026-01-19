'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageWithPlaceholderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
}

export const ImageWithPlaceholder = ({ src, alt, className, width, height, ...props }: ImageWithPlaceholderProps) => {
    const [error, setError] = useState(false);

    if (error) {
        return (
            <div className={cn(
                "w-full h-64 bg-neutral-800 border-2 border-dashed border-neutral-600 rounded-xl flex items-center justify-center my-8",
                className
            )}>
                <p className="text-white font-serif tracking-wider">画像生成待ち...</p>
            </div>
        );
    }

    // Attempt to parse width/height if they are strings, or use defaults
    const imgWidth = width ? parseInt(width.toString()) : 1200;
    const imgHeight = height ? parseInt(height.toString()) : 630;

    return (
        <img
            src={src}
            alt={alt}
            width={imgWidth}
            height={imgHeight}
            className={cn("w-full h-auto rounded-xl shadow-lg my-8", className)}
            onError={() => setError(true)}
            {...props}
        />
    );
};
