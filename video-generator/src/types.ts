import { Caption } from './TextAnimations';
import { BrandId } from './brandConfig';

export interface VideoScript {
    project_title: string;
    brand_id: string;
    pattern: string;
    scenes: Scene[];
    metadata?: any;
    production_notes?: {
        overlay_colors?: Record<string, string>;
        text_color_highlight?: string;
    };
}

export interface Scene {
    scene_id: number;
    section_type: string;
    duration_target_sec: number;
    narration_text: string;
    screen_text: string;
    visual_prompt: string;
    narration_duration_sec?: number;
    duration_sec?: number; // V3 compatibility
    captions?: Caption[];
    text_animation?: any; // TextAnimationType
    // Computed props
    startFrame?: number;
    durationFrames?: number;
}

export interface ComputedSceneData {
    scene: Scene;
    sceneIndex: number;
    timeInScene: number; // in sec
}

export function computeSceneFrames(scenes: Scene[], fps: number): Scene[] {
    let currentFrame = 0;
    return scenes.map((scene) => {
        const durationSec =
            scene.narration_duration_sec ||
            scene.duration_sec ||
            scene.duration_target_sec ||
            5;
        const durationFrames = Math.round(durationSec * fps);
        const startFrame = currentFrame;
        currentFrame += durationFrames;
        return {
            ...scene,
            startFrame,
            durationFrames,
        };
    });
}

export function getCurrentScene(
    computedScenes: Scene[],
    frame: number
): ComputedSceneData | null {
    const sceneIndex = computedScenes.findIndex(
        (s) => frame >= (s.startFrame || 0) && frame < (s.startFrame || 0) + (s.durationFrames || 0)
    );

    if (sceneIndex === -1) return null;

    const scene = computedScenes[sceneIndex];
    const timeInFrames = frame - (scene.startFrame || 0);
    const timeInScene = timeInFrames / 30; // Assuming 30fps if not passed, but caller should handle

    return {
        scene,
        sceneIndex,
        timeInScene,
    };
}

export function inferTextAnimation(sectionType: string, brandId: BrandId): string {
    if (brandId === 'flip') return 'typewriter';
    if (brandId === 'kominka') return 'slide_up';
    if (sectionType === 'hook') return 'word_popup';
    if (sectionType === 'cta') return 'count_up';
    return 'fade';
}
