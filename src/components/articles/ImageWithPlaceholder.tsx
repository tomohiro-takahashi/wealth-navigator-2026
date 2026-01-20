'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageWithPlaceholderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
    hideOnError?: boolean;
}

export const ImageWithPlaceholder = ({ src, alt, className, width, height, hideOnError = false, ...props }: ImageWithPlaceholderProps) => {
    const [error, setError] = useState(false);

    if (error) {
        // DEBUG MODE: Show Red Border and Path
        return (
            <div className={cn(
                "w-full p-4 my-8 border-4 border-red-600 bg-black/80 rounded-xl",
                className
            )}>
                <p className="text-red-500 font-bold text-xl mb-2">⚠ IMAGE LOAD FAILED</p>
                <p className="text-white font-mono text-sm break-all">SRC: {src}</p>
                <p className="text-gray-400 text-xs mt-2">Alt: {alt}</p>
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
