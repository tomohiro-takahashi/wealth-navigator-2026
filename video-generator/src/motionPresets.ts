import { interpolate, Easing } from 'remotion';
import { BrandId, getBrandConfig } from './brandConfig';

export interface MotionValues {
    scale: number;
    translateX: number;
    translateY: number;
    rotation: number;
    opacity: number;
}

export function calculateMotion(
    brandId: BrandId,
    sectionType: string,
    timeInScene: number, // sec
    durationFrames: number,
    fps: number
): MotionValues {
    const config = getBrandConfig(brandId);
    const progress = timeInScene / (durationFrames / fps); // 0 to 1

    // Default values
    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let rotation = 0;
    let opacity = 1;

    // Fade In/Out
    if (progress < 0.1) {
        opacity = interpolate(progress, [0, 0.1], [0, 1], { extrapolateRight: 'clamp' });
    } else if (progress > 0.9) {
        opacity = interpolate(progress, [0.9, 1], [1, 0], { extrapolateLeft: 'clamp' });
    }

    // Motion Style Logic
    switch (config.motion.style) {
        case 'elegant': // Ken Burns (Zoom In)
            scale = interpolate(progress, [0, 1], [1, 1.15]);
            break;

        case 'dynamic': // Zoom Out + Rotation
            scale = interpolate(progress, [0, 1], [1.2, 1]);
            rotation = interpolate(progress, [0, 1], [0, 1]);
            break;

        case 'gentle': // Slow Pan
            scale = 1.1;
            translateX = interpolate(progress, [0, 1], [-20, 20]);
            break;

        case 'sharp': // Fast Zoom + Cut
            scale = interpolate(progress, [0, 1], [1, 1.25], { easing: Easing.bezier(0.2, 0, 0.2, 1) });
            break;

        case 'friendly': // Bounce? Or just standard zoom
            scale = interpolate(progress, [0, 1], [1.05, 1.15]);
            break;

        default:
            scale = interpolate(progress, [0, 1], [1, 1.1]);
    }

    // Section Type Adjustments
    if (sectionType === 'hook') {
        scale *= 1.1; // Hook: Emphasize motion
    } else if (sectionType === 'cta') {
        scale = 1; // CTA: Keep it static/readable
        translateX = 0;
        translateY = 0;
        rotation = 0;
    }

    return {
        scale,
        translateX,
        translateY,
        rotation,
        opacity,
    };
}
