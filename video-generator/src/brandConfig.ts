// brandConfig.ts
// 5ブランド（Wealth Navigator + 4派生メディア）の設定

export type BrandId = 'wealth' | 'kominka' | 'legacy' | 'flip' | 'subsidy';

// テロップアニメーションスタイル（TextAnimations.tsxと同期）
export type CaptionAnimationStyle =
  | 'fade'           // シンプルなフェード
  | 'slide_up'       // 下からスライドイン
  | 'slide_left'     // 左からスライドイン
  | 'typewriter'     // タイプライター風
  | 'pop'            // ポップイン
  | 'karaoke';       // カラオケ風

export interface BrandConfig {
  id: BrandId;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    textHighlight: string;
  };
  overlays: {
    hook: string;
    truth: string;
    solution: string;
    cta: string;
    [key: string]: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  motion: {
    speed: 'slow' | 'normal' | 'fast';
    style: 'elegant' | 'dynamic' | 'gentle' | 'sharp' | 'friendly';
  };
  captionStyle: {
    animation: CaptionAnimationStyle;
    position: 'bottom' | 'center' | 'top';
    backgroundColor: string;
    textColor: string;
  };
}

export const BRAND_CONFIGS: Record<BrandId, BrandConfig> = {
  // マザーシップ: Wealth Navigator
  wealth: {
    id: 'wealth',
    name: 'Wealth Navigator',
    colors: {
      primary: '#0A1628',
      secondary: '#1A2A4A',
      accent: '#D4AF37',
      background: '#000000',
      text: '#FFFFFF',
      textHighlight: '#D4AF37',
    },
    overlays: {
      hook: 'rgba(60, 0, 0, 0.75)',
      truth: 'rgba(10, 22, 40, 0.85)',
      solution: 'rgba(0, 20, 50, 0.75)',
      cta: 'rgba(255, 255, 255, 0.95)',
    },
    fonts: {
      heading: '"Shippori Mincho", "Times New Roman", serif',
      body: '"Noto Sans JP", sans-serif',
    },
    motion: {
      speed: 'normal',
      style: 'elegant',
    },
    captionStyle: {
      animation: 'fade',
      position: 'bottom',
      backgroundColor: 'rgba(10, 22, 40, 0.85)',
      textColor: '#FFFFFF',
    },
  },

  // 空き家錬金術
  kominka: {
    id: 'kominka',
    name: '空き家錬金術',
    colors: {
      primary: '#0A1628',
      secondary: '#2D1810',
      accent: '#D4AF37',
      background: '#0D0D0D',
      text: '#FFFFFF',
      textHighlight: '#D4AF37',
    },
    overlays: {
      hook: 'rgba(80, 20, 10, 0.75)',
      truth: 'rgba(10, 22, 40, 0.80)',
      solution: 'rgba(0, 30, 60, 0.70)',
      cta: 'rgba(255, 255, 255, 0.92)',
    },
    fonts: {
      heading: '"Shippori Mincho", "Times New Roman", serif',
      body: '"Noto Sans JP", sans-serif',
    },
    motion: {
      speed: 'fast',
      style: 'dynamic',
    },
    captionStyle: {
      animation: 'slide_up',
      position: 'bottom',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      textColor: '#FFFFFF',
    },
  },

  // 親の家、どうする？
  legacy: {
    id: 'legacy',
    name: '親の家、どうする？',
    colors: {
      primary: '#2D4A3E',
      secondary: '#8B7355',
      accent: '#5C8A6B',
      background: '#F5F1EB',
      text: '#333333',
      textHighlight: '#2D4A3E',
    },
    overlays: {
      hook: 'rgba(45, 74, 62, 0.70)',
      truth: 'rgba(139, 115, 85, 0.65)',
      conflict: 'rgba(80, 60, 40, 0.75)',
      turnaround: 'rgba(45, 74, 62, 0.65)',
      solution: 'rgba(92, 138, 107, 0.60)',
      cta: 'rgba(245, 241, 235, 0.95)',
    },
    fonts: {
      heading: '"Rounded Mplus 1c", "Hiragino Maru Gothic ProN", sans-serif',
      body: '"Noto Sans JP", sans-serif',
    },
    motion: {
      speed: 'slow',
      style: 'gentle',
    },
    captionStyle: {
      animation: 'fade',
      position: 'bottom',
      backgroundColor: 'rgba(45, 74, 62, 0.80)',
      textColor: '#FFFFFF',
    },
  },

  // Flip Logic
  flip: {
    id: 'flip',
    name: 'Flip Logic',
    colors: {
      primary: '#0D0D0D',
      secondary: '#1A1A1A',
      accent: '#E63946',
      background: '#000000',
      text: '#FFFFFF',
      textHighlight: '#E63946',
    },
    overlays: {
      hook: 'rgba(230, 57, 70, 0.20)',
      truth: 'rgba(0, 0, 0, 0.90)',
      reveal: 'rgba(20, 0, 0, 0.85)',
      real_way: 'rgba(10, 10, 10, 0.85)',
      solution: 'rgba(15, 15, 15, 0.80)',
      cta: 'rgba(13, 13, 13, 0.95)',
    },
    fonts: {
      heading: '"Noto Sans JP", "Helvetica Neue", sans-serif',
      body: '"Noto Sans JP", sans-serif',
    },
    motion: {
      speed: 'fast',
      style: 'sharp',
    },
    captionStyle: {
      animation: 'typewriter',
      position: 'bottom',
      backgroundColor: 'rgba(0, 0, 0, 0.90)',
      textColor: '#FFFFFF',
    },
  },

  // おうちの補助金相談室
  subsidy: {
    id: 'subsidy',
    name: 'おうちの補助金相談室',
    colors: {
      primary: '#7CB342',
      secondary: '#558B2F',
      accent: '#FF9800',
      background: '#FFF8E1',
      text: '#333333',
      textHighlight: '#E65100',
    },
    overlays: {
      hook: 'rgba(124, 179, 66, 0.25)',
      truth: 'rgba(255, 248, 225, 0.85)',
      logic: 'rgba(255, 248, 225, 0.80)',
      solution: 'rgba(255, 255, 255, 0.85)',
      cta: 'rgba(255, 255, 255, 0.95)',
    },
    fonts: {
      heading: '"Rounded Mplus 1c", "Hiragino Maru Gothic ProN", sans-serif',
      body: '"Noto Sans JP", sans-serif',
    },
    motion: {
      speed: 'slow',
      style: 'friendly',
    },
    captionStyle: {
      animation: 'karaoke',
      position: 'bottom',
      backgroundColor: 'rgba(124, 179, 66, 0.90)',
      textColor: '#FFFFFF',
    },
  },
};

// ブランドIDからConfigを取得
export function getBrandConfig(brandId: BrandId): BrandConfig {
  return BRAND_CONFIGS[brandId] || BRAND_CONFIGS.wealth;
}

// セクションタイプからオーバーレイカラーを取得
export function getOverlayColor(brandId: BrandId, sectionType: string): string {
  const config = getBrandConfig(brandId);
  return config.overlays[sectionType] || config.overlays.solution || 'rgba(0, 0, 0, 0.8)';
}

// CTAかどうかでテキストカラーを判定
export function getTextColor(brandId: BrandId, sectionType: string): string {
  const config = getBrandConfig(brandId);

  // CTAは背景が明るいブランドがある
  if (sectionType === 'cta') {
    if (['legacy', 'subsidy'].includes(brandId)) {
      return config.colors.text; // 暗い文字
    }
  }

  // legacy, subsidyは基本的に明るい背景
  if (['legacy', 'subsidy'].includes(brandId) && sectionType !== 'hook') {
    return config.colors.text;
  }

  return '#FFFFFF';
}
