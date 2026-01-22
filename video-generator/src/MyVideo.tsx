// MyVideo.tsx (Ver 4.0)
// マルチブランド対応・モーション強化版

import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    Audio,
    staticFile,
    getInputProps,
    Img,
} from 'remotion';

// 新規インポート
import { BrandId, getBrandConfig, getOverlayColor, getTextColor } from './brandConfig';
import { calculateMotion } from './motionPresets';
import { AnimatedText, SyncedCaption, TextAnimationType, CaptionAnimationStyle } from './TextAnimations';
import {
    VideoScript,
    Scene,
    computeSceneFrames,
    getCurrentScene,
    inferTextAnimation,
} from './types';

// JSONデータのインポート（ビルド時）
import scriptData from './video-script.json';

// シーン画像のマッピング（動的に生成される想定）
const getSceneImage = (sceneId: number, brandId: BrandId): string => {
    // 実際の実装では、シーンIDとブランドIDに基づいて画像パスを返す
    // ここではフォールバックロジックを含む
    const imagePath = `scenes/scene_${sceneId}.png`;

    // 画像が存在しない場合のフォールバック
    try {
        return staticFile(imagePath);
    } catch {
        // ブランド別のデフォルト画像
        const defaultImages: Record<BrandId, string> = {
            wealth: 'defaults/wealth_default.png',
            kominka: 'defaults/kominka_default.png',
            legacy: 'defaults/legacy_default.png',
            flip: 'defaults/flip_default.png',
            subsidy: 'defaults/subsidy_default.png',
        };
        return staticFile(defaultImages[brandId] || 'defaults/default.png');
    }
};

// メインコンポーネント
export const MyVideo: React.FC = () => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // 入力プロパティからスクリプトを取得（またはバンドル済みを使用）
    const inputProps = getInputProps();
    let script: VideoScript = scriptData as VideoScript;

    if (inputProps.scriptJson) {
        try {
            script = JSON.parse(inputProps.scriptJson as string);
        } catch (e) {
            console.error('Failed to parse scriptJson prop, using bundled.', e);
        }
    }

    // ブランドID（デフォルト: wealth）
    const brandId: BrandId = (script.brand_id as BrandId) || 'wealth';
    const brandConfig = getBrandConfig(brandId);

    // シーンフレームを計算
    const computedScenes = computeSceneFrames(script.scenes, fps);

    // 現在のシーンを取得
    const currentSceneData = getCurrentScene(computedScenes, frame);

    if (!currentSceneData) {
        return <AbsoluteFill style={{ backgroundColor: '#000' }} />;
    }

    const { scene, sceneIndex, timeInScene } = currentSceneData;

    // モーション値を計算
    const motion = calculateMotion(
        brandId,
        scene.section_type,
        timeInScene,
        scene.durationFrames || 0,
        fps
    );

    // テキストアニメーションタイプを決定
    const textAnimation: TextAnimationType =
        scene.text_animation || inferTextAnimation(scene.section_type, brandId);

    // オーバーレイカラー
    const overlayColor = script.production_notes?.overlay_colors?.[scene.section_type]
        || getOverlayColor(brandId, scene.section_type);

    // テキストカラー
    const textColor = getTextColor(brandId, scene.section_type);
    const highlightColor = script.production_notes?.text_color_highlight
        || brandConfig.colors.textHighlight;

    // 背景画像
    const bgImage = getSceneImage(scene.scene_id, brandId);

    // 音声ファイル
    const audioFile = staticFile('audio.mp3');

    return (
        <AbsoluteFill style={{ backgroundColor: brandConfig.colors.background, overflow: 'hidden' }}>
            {/* 音声 */}
            <Audio src={audioFile} />

            {/* 背景画像レイヤー */}
            <BackgroundLayer
                src={bgImage}
                scale={motion.scale}
                translateX={motion.translateX}
                translateY={motion.translateY}
                rotation={motion.rotation}
            />

            {/* オーバーレイレイヤー */}
            <AbsoluteFill style={{ backgroundColor: overlayColor }} />

            {/* コンテンツレイヤー */}
            <ContentLayer
                scene={scene}
                sceneStartFrame={scene.startFrame || 0}
                brandConfig={brandConfig}
                textColor={textColor}
                highlightColor={highlightColor}
                textAnimation={textAnimation}
                opacity={motion.opacity}
                durationFrames={scene.durationFrames || 0}
            />

            {/* セクションラベル（デバッグ用、本番では削除可） */}
            {process.env.NODE_ENV === 'development' && (
                <SectionLabel sectionType={scene.section_type} brandId={brandId} />
            )}
        </AbsoluteFill>
    );
};

// ============================
// 背景画像レイヤー
// ============================
interface BackgroundLayerProps {
    src: string;
    scale: number;
    translateX: number;
    translateY: number;
    rotation: number;
}

const BackgroundLayer: React.FC<BackgroundLayerProps> = ({
    src,
    scale,
    translateX,
    translateY,
    rotation,
}) => {
    return (
        <AbsoluteFill
            style={{
                transform: `scale(${scale}) translate(${translateX}px, ${translateY}px) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
            }}
        >
            <Img
                src={src}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
            />
        </AbsoluteFill>
    );
};

// ============================
// コンテンツレイヤー
// ============================
interface ContentLayerProps {
    scene: Scene;
    sceneStartFrame: number;  // シーンの開始フレーム
    brandConfig: ReturnType<typeof getBrandConfig>;
    textColor: string;
    highlightColor: string;
    textAnimation: TextAnimationType;
    opacity: number;
    durationFrames: number;
}

const ContentLayer: React.FC<ContentLayerProps> = ({
    scene,
    sceneStartFrame,
    brandConfig,
    textColor,
    highlightColor,
    textAnimation,
    opacity,
    durationFrames,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // フォントサイズ（ブランドに応じて調整）
    const baseFontSize = brandConfig.id === 'subsidy' ? 72 : 64;

    // テキストスタイル
    const textStyle: React.CSSProperties = {
        fontFamily: brandConfig.fonts.heading,
        color: textColor,
        fontWeight: 'bold',
        textAlign: 'center',
        lineHeight: 1.4,
        fontSize: baseFontSize,
        letterSpacing: '0.03em',
        textShadow: scene.section_type !== 'cta'
            ? '0px 4px 25px rgba(0, 0, 0, 0.9), 0px 2px 10px rgba(0, 0, 0, 0.8)'
            : 'none',
    };

    return (
        <AbsoluteFill
            style={{
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0 50px',
                opacity,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '30px',
                    width: '100%',
                    maxWidth: '950px',
                    height: '100%',
                    position: 'relative',
                }}
            >
                {/* メインテキスト（画面中央） */}
                <AnimatedText
                    text={scene.screen_text}
                    animationType={textAnimation}
                    durationFrames={durationFrames}
                    sceneStartFrame={sceneStartFrame}
                    style={textStyle}
                />
            </div>

            {/* テロップ（画面下部に固定） */}
            {scene.captions && scene.captions.length > 0 && (
                <div
                    style={{
                        position: 'absolute',
                        bottom: brandConfig.captionStyle.position === 'bottom' ? 120 :
                            brandConfig.captionStyle.position === 'center' ? '50%' : 80,
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        padding: '0 40px',
                        transform: brandConfig.captionStyle.position === 'center' ? 'translateY(-50%)' : 'none',
                    }}
                >
                    <SyncedCaption
                        captions={scene.captions}
                        sceneStartFrame={sceneStartFrame}
                        sceneDurationSec={scene.narration_duration_sec || scene.duration_target_sec || durationFrames / 30}
                        fallbackText={scene.captions[scene.captions.length - 1]?.text || ''}
                        animationStyle={brandConfig.captionStyle.animation as CaptionAnimationStyle}
                        style={{
                            fontFamily: brandConfig.fonts.body,
                            fontSize: baseFontSize * 0.55,
                            fontWeight: '500',
                            color: brandConfig.captionStyle.textColor,
                            textAlign: 'center',
                            lineHeight: 1.5,
                            padding: '18px 32px',
                            backgroundColor: brandConfig.captionStyle.backgroundColor,
                            borderRadius: '12px',
                            maxWidth: '90%',
                            textShadow: '0px 2px 8px rgba(0, 0, 0, 0.5)',
                        }}
                    />
                </div>
            )}
        </AbsoluteFill>
    );
};

// ============================
// セクションラベル（デバッグ用）
// ============================
interface SectionLabelProps {
    sectionType: string;
    brandId: BrandId;
}

const SectionLabel: React.FC<SectionLabelProps> = ({ sectionType, brandId }) => {
    return (
        <div
            style={{
                position: 'absolute',
                top: 40,
                left: 40,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '4px',
                fontSize: '14px',
                fontFamily: 'monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
            }}
        >
            {brandId} / {sectionType}
        </div>
    );
};

export default MyVideo;
