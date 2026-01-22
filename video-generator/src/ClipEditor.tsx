// ClipEditor.tsx (Ver 4.1)
// Veo生成動画クリップ編集・結合用

import React from 'react';
import {
    AbsoluteFill,
    useCurrentFrame,
    useVideoConfig,
    Video,
    staticFile,
    getInputProps,
    Series,
    Audio,
} from 'remotion';

import { BrandId, getBrandConfig, getOverlayColor, getTextColor } from './brandConfig';
import { SyncedCaption, CaptionAnimationStyle } from './TextAnimations';

interface ProjectConfig {
    project_id: string;
    project_name: string;
    brand_id: BrandId;
    clips: {
        scene_id: number;
        file: string;
        duration_sec: number;
    }[];
    captions: {
        scene_id: number;
        entries: {
            text: string;
            start_sec: number;
            end_sec: number;
        }[];
    }[];
    audio?: {
        bgm?: {
            enabled: boolean;
            file: string;
            volume: number;
        };
    };
}

export const ClipEditor: React.FC = () => {
    const { fps } = useVideoConfig();
    const inputProps = getInputProps();
    
    // プロジェクト設定を読み込み
    // 手動レンダリング時は inputProps.configJson を渡す想定
    const config: ProjectConfig = inputProps.config 
        ? (inputProps.config as ProjectConfig)
        : require('./video-script.json'); // フォールバック

    const brandId = config.brand_id || 'wealth';
    const brandConfig = getBrandConfig(brandId);
    const textColor = getTextColor(brandId, 'solution');
    const baseFontSize = brandConfig.id === 'subsidy' ? 72 : 64;

    return (
        <AbsoluteFill style={{ backgroundColor: '#000' }}>
            {/* BGMレイヤー */}
            {config.audio?.bgm?.enabled && (
                <Audio 
                    src={staticFile(config.audio.bgm.file)} 
                    volume={config.audio.bgm.volume || 0.2} 
                />
            )}

            <Series>
                {config.clips.map((clip, index) => {
                    const sceneCaptions = config.captions.find(c => c.scene_id === clip.scene_id)?.entries || [];
                    
                    return (
                        <Series.Sequence 
                            key={clip.scene_id} 
                            durationInFrames={Math.round(clip.duration_sec * fps)}
                        >
                            <AbsoluteFill>
                                {/* 動画クリップ */}
                                <Video 
                                    src={staticFile(clip.file)} 
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                    }}
                                />

                                {/* オーバーレイ（必要に応じて） */}
                                <AbsoluteFill style={{ 
                                    backgroundColor: getOverlayColor(brandId, 'solution') 
                                }} />

                                {/* テロップレイヤー */}
                                {sceneCaptions.length > 0 && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            bottom: 120,
                                            left: 0,
                                            right: 0,
                                            display: 'flex',
                                            justifyContent: 'center',
                                            padding: '0 40px',
                                        }}
                                    >
                                        <SyncedCaption
                                            captions={sceneCaptions}
                                            sceneStartFrame={0} // Series内なので0固定
                                            sceneDurationSec={clip.duration_sec}
                                            fallbackText=""
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
                        </Series.Sequence>
                    );
                })}
            </Series>
        </AbsoluteFill>
    );
};
