// TextAnimations.tsx
// テキスト表示のアニメーションバリエーション

import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';

// アニメーションタイプ
export type TextAnimationType = 'fade' | 'typewriter' | 'word_popup' | 'count_up' | 'slide_up';

// キャプション（タイムスタンプ付き）
export interface Caption {
  text: string;
  start_sec: number;
  end_sec: number;
}

// ============================
// フェードイン/アウト（デフォルト）
// ============================
interface FadeTextProps {
  text: string;
  durationFrames: number;
  style?: React.CSSProperties;
}

export const FadeText: React.FC<FadeTextProps> = ({ text, durationFrames, style }) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(
    frame,
    [0, 20, durationFrames - 20, durationFrames],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  
  const translateY = interpolate(
    frame,
    [0, 25],
    [25, 0],
    { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
  );
  
  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        ...style,
      }}
    >
      {text.split('\n').map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );
};

// ============================
// タイプライター効果
// ============================
interface TypewriterTextProps {
  text: string;
  durationFrames: number;
  style?: React.CSSProperties;
}

export const TypewriterText: React.FC<TypewriterTextProps> = ({ text, durationFrames, style }) => {
  const frame = useCurrentFrame();
  
  // 全体の60%の時間で文字を表示し終える
  const charsToShow = Math.floor(
    interpolate(
      frame,
      [0, durationFrames * 0.6],
      [0, text.length],
      { extrapolateRight: 'clamp' }
    )
  );
  
  const opacity = interpolate(
    frame,
    [0, 10, durationFrames - 15, durationFrames],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  
  const displayText = text.slice(0, charsToShow);
  const cursor = frame % 30 < 15 ? '|' : '';
  
  return (
    <div style={{ opacity, ...style }}>
      {displayText.split('\n').map((line, i) => (
        <div key={i}>
          {line}
          {i === displayText.split('\n').length - 1 && charsToShow < text.length && cursor}
        </div>
      ))}
    </div>
  );
};

// ============================
// 単語ごとのポップアップ
// ============================
interface WordPopupTextProps {
  text: string;
  durationFrames: number;
  style?: React.CSSProperties;
}

export const WordPopupText: React.FC<WordPopupTextProps> = ({ text, durationFrames, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // 改行で分割してから単語に分割
  const lines = text.split('\n');
  const allWords: { word: string; lineIndex: number }[] = [];
  
  lines.forEach((line, lineIndex) => {
    const words = line.split(/(\s+)/).filter(w => w.trim());
    words.forEach(word => {
      allWords.push({ word, lineIndex });
    });
  });
  
  const wordsPerFrame = allWords.length / (durationFrames * 0.5);
  
  // 全体のフェードアウト
  const globalOpacity = interpolate(
    frame,
    [durationFrames - 20, durationFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  // 行ごとにグループ化
  const groupedByLine: { word: string; index: number }[][] = [];
  allWords.forEach((item, index) => {
    if (!groupedByLine[item.lineIndex]) {
      groupedByLine[item.lineIndex] = [];
    }
    groupedByLine[item.lineIndex].push({ word: item.word, index });
  });
  
  return (
    <div style={{ opacity: globalOpacity, ...style }}>
      {groupedByLine.map((lineWords, lineIndex) => (
        <div key={lineIndex} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          {lineWords.map(({ word, index }) => {
            const wordAppearFrame = index / wordsPerFrame;
            const progress = interpolate(
              frame,
              [wordAppearFrame, wordAppearFrame + 12],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.5)) }
            );
            
            return (
              <span
                key={index}
                style={{
                  opacity: progress,
                  transform: `translateY(${(1 - progress) * 30}px) scale(${0.7 + progress * 0.3})`,
                  display: 'inline-block',
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ============================
// 数字カウントアップ（数字部分のみ）
// ============================
interface CountUpTextProps {
  text: string;
  durationFrames: number;
  style?: React.CSSProperties;
}

export const CountUpText: React.FC<CountUpTextProps> = ({ text, durationFrames, style }) => {
  const frame = useCurrentFrame();
  
  const opacity = interpolate(
    frame,
    [0, 15, durationFrames - 15, durationFrames],
    [0, 1, 1, 0],
    { extrapolateRight: 'clamp' }
  );
  
  // 数字を検出してカウントアップ
  const renderTextWithCountUp = (inputText: string) => {
    // 数字パターン: 数字とカンマ
    const parts = inputText.split(/(\d[\d,]*)/g);
    
    return parts.map((part, i) => {
      const match = part.match(/^(\d[\d,]*)$/);
      if (match) {
        const targetNum = parseInt(part.replace(/,/g, ''), 10);
        const currentNum = Math.floor(
          interpolate(
            frame,
            [0, durationFrames * 0.5],
            [0, targetNum],
            { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
          )
        );
        return (
          <span key={i} style={{ fontWeight: 'bold', color: 'inherit' }}>
            {currentNum.toLocaleString()}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };
  
  return (
    <div style={{ opacity, ...style }}>
      {text.split('\n').map((line, i) => (
        <div key={i}>{renderTextWithCountUp(line)}</div>
      ))}
    </div>
  );
};

// ============================
// スライドアップ
// ============================
interface SlideUpTextProps {
  text: string;
  durationFrames: number;
  style?: React.CSSProperties;
}

export const SlideUpText: React.FC<SlideUpTextProps> = ({ text, durationFrames, style }) => {
  const frame = useCurrentFrame();
  
  const lines = text.split('\n');
  
  const globalOpacity = interpolate(
    frame,
    [durationFrames - 20, durationFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  
  return (
    <div style={{ opacity: globalOpacity, ...style }}>
      {lines.map((line, i) => {
        const lineDelay = i * 8;
        const lineOpacity = interpolate(
          frame,
          [lineDelay, lineDelay + 18],
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        const lineY = interpolate(
          frame,
          [lineDelay, lineDelay + 18],
          [40, 0],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
        );
        
        return (
          <div
            key={i}
            style={{
              opacity: lineOpacity,
              transform: `translateY(${lineY}px)`,
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};

// ============================
// テロップアニメーションスタイル
// ============================
export type CaptionAnimationStyle = 
  | 'fade'           // シンプルなフェード
  | 'slide_up'       // 下からスライドイン
  | 'slide_left'     // 左からスライドイン
  | 'typewriter'     // タイプライター風
  | 'pop'            // ポップイン
  | 'highlight'      // ハイライト（単語ごと）
  | 'karaoke';       // カラオケ風（読み上げ中の部分をハイライト）

// ============================
// タイムスタンプ同期キャプション（テロップ）
// ============================
interface SyncedCaptionProps {
  captions: Caption[];
  sceneStartFrame: number;
  animationStyle?: CaptionAnimationStyle;
  style?: React.CSSProperties;
}

export const SyncedCaption: React.FC<SyncedCaptionProps> = ({ 
  captions, 
  sceneStartFrame, 
  animationStyle = 'fade',
  style 
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // シーン内での相対時間（秒）を計算
  const timeInSceneSec = (frame - sceneStartFrame) / fps;
  
  // 現在時刻に該当するキャプションを取得
  const activeCaptionIndex = captions.findIndex(
    cap => timeInSceneSec >= cap.start_sec && timeInSceneSec < cap.end_sec
  );
  
  if (activeCaptionIndex === -1) return null;
  
  const activeCaption = captions[activeCaptionIndex];
  
  // キャプション内での進行度 (0〜1)
  const captionDuration = activeCaption.end_sec - activeCaption.start_sec;
  const captionProgress = (timeInSceneSec - activeCaption.start_sec) / captionDuration;
  
  // アニメーションスタイルに応じた値を計算
  const animationValues = calculateCaptionAnimation(animationStyle, captionProgress, frame);
  
  return (
    <div
      style={{
        opacity: animationValues.opacity,
        transform: `
          translateY(${animationValues.translateY}px) 
          translateX(${animationValues.translateX}px) 
          scale(${animationValues.scale})
        `,
        ...style,
      }}
    >
      {animationStyle === 'karaoke' ? (
        <KaraokeText 
          text={activeCaption.text} 
          progress={captionProgress} 
        />
      ) : animationStyle === 'typewriter' ? (
        <TypewriterCaption 
          text={activeCaption.text} 
          progress={captionProgress} 
        />
      ) : (
        activeCaption.text
      )}
    </div>
  );
};

// ============================
// アニメーション値の計算
// ============================
function calculateCaptionAnimation(
  style: CaptionAnimationStyle,
  progress: number,
  frame: number
): { opacity: number; translateY: number; translateX: number; scale: number } {
  
  // 共通のフェードイン/アウト
  const fadeIn = interpolate(progress, [0, 0.1], [0, 1], { extrapolateRight: 'clamp' });
  const fadeOut = interpolate(progress, [0.85, 1], [1, 0], { extrapolateLeft: 'clamp' });
  const baseOpacity = Math.min(fadeIn, fadeOut);
  
  switch (style) {
    case 'slide_up':
      return {
        opacity: baseOpacity,
        translateY: interpolate(
          progress, 
          [0, 0.15, 0.85, 1], 
          [30, 0, 0, -20],
          { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
        ),
        translateX: 0,
        scale: 1,
      };
      
    case 'slide_left':
      return {
        opacity: baseOpacity,
        translateY: 0,
        translateX: interpolate(
          progress, 
          [0, 0.15, 0.85, 1], 
          [50, 0, 0, -30],
          { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) }
        ),
        scale: 1,
      };
      
    case 'pop':
      const popScale = interpolate(
        progress,
        [0, 0.08, 0.15, 0.85, 1],
        [0.3, 1.15, 1, 1, 0.9],
        { extrapolateRight: 'clamp', easing: Easing.out(Easing.back(1.5)) }
      );
      return {
        opacity: baseOpacity,
        translateY: 0,
        translateX: 0,
        scale: popScale,
      };
      
    case 'highlight':
    case 'karaoke':
    case 'typewriter':
      // これらは特殊なレンダリングを使用
      return {
        opacity: baseOpacity,
        translateY: 0,
        translateX: 0,
        scale: 1,
      };
      
    case 'fade':
    default:
      return {
        opacity: baseOpacity,
        translateY: interpolate(
          progress,
          [0, 0.1],
          [10, 0],
          { extrapolateRight: 'clamp' }
        ),
        translateX: 0,
        scale: 1,
      };
  }
}

// ============================
// カラオケ風テキスト（読み上げ部分をハイライト）
// ============================
interface KaraokeTextProps {
  text: string;
  progress: number;
}

const KaraokeText: React.FC<KaraokeTextProps> = ({ text, progress }) => {
  // 進行度に応じて文字をハイライト
  const highlightedChars = Math.floor(text.length * progress);
  
  return (
    <span>
      <span style={{ color: '#FFD700', textShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}>
        {text.slice(0, highlightedChars)}
      </span>
      <span style={{ opacity: 0.7 }}>
        {text.slice(highlightedChars)}
      </span>
    </span>
  );
};

// ============================
// タイプライター風キャプション
// ============================
interface TypewriterCaptionProps {
  text: string;
  progress: number;
}

const TypewriterCaption: React.FC<TypewriterCaptionProps> = ({ text, progress }) => {
  // 進行度80%までに全文字を表示
  const visibleChars = Math.floor(text.length * Math.min(progress / 0.8, 1));
  const displayText = text.slice(0, visibleChars);
  
  // カーソルの点滅
  const showCursor = visibleChars < text.length && Math.floor(progress * 30) % 2 === 0;
  
  return (
    <span>
      {displayText}
      {showCursor && <span style={{ opacity: 0.8 }}>|</span>}
    </span>
  );
};

// ============================
// アニメーションタイプに応じたコンポーネント選択
// ============================
interface AnimatedTextProps {
  text: string;
  animationType: TextAnimationType;
  durationFrames: number;
  style?: React.CSSProperties;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  animationType,
  durationFrames,
  style,
}) => {
  switch (animationType) {
    case 'typewriter':
      return <TypewriterText text={text} durationFrames={durationFrames} style={style} />;
    case 'word_popup':
      return <WordPopupText text={text} durationFrames={durationFrames} style={style} />;
    case 'count_up':
      return <CountUpText text={text} durationFrames={durationFrames} style={style} />;
    case 'slide_up':
      return <SlideUpText text={text} durationFrames={durationFrames} style={style} />;
    case 'fade':
    default:
      return <FadeText text={text} durationFrames={durationFrames} style={style} />;
  }
};
