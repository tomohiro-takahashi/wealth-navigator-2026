import { SiteConfig } from '@/types/site';

export const siteConfig: SiteConfig = {
    name: "おうちの補助金相談室",
    tagline: "おばあちゃんでもわかる、補助金でお得にリフォーム。",
    description: "窓、お風呂、給湯器のリフォームに使える補助金を、日本一やさしく解説。相談から申請、工事までワンストップ。",
    email: "info@subsidy-nav.jp",
    site_id: "subsidy",
    pinnedSlug: "2026-renovation-subsidy-guide",

    theme: {
        colors: {
            primary: "#D97200", // Slightly deeper orange for better contrast on white
            background: "#FFFFFF", // Pure white for a cleaner look
            accent: "#FF8C00", // Vibrant orange for buttons/accents
            text: {
                main: "#2D241E", // Darker text for readability
                sub: "#666666",
                inverse: "#FFFFFF"
            },
            link: "#D97200",
            border: "#EAE0D5"
        },

        typography: {
            fontFamily: "sans",
            h2: "text-4xl md:text-5xl font-black tracking-tight text-[#4A3F35]"
        },

        rounded: "2xl"
    },

    hero: {
        title: "知らないだけで、<br />損してます",
        subtitle: "リフォームおばちゃんが教える<br />誰でもかんたん補助金活用術",
        heroImage: "/assets/hero-subsidy.jpg",
        primaryButton: {
            text: "使える補助金を30秒で診断",
            url: "/simulation"
        },
        secondaryButton: {
            text: "はじめての方へ",
            url: "/about"
        }
    },

    premium: {
        title: "2026年 人気の補助金活用事例",
        btnText: "すべての活用事例を見る"
    },

    features: [
        {
            title: "申請は業者がやってくれます",
            description: "2026年度の住宅省エネ補助金は、リフォーム会社が申請を代行。あなたがやることは、補助対象の工事を選ぶだけ。"
        },
        {
            title: "窓・お風呂・給湯器、全部対象です",
            description: "先進的窓リノベ2026で最大200万円、子育てエコホームで最大60万円、給湯省エネで約20万円。組み合わせればさらにお得。"
        },
        {
            title: "実績豊富なアドバイザー",
            description: "最新の補助金制度を熟知した専門家が、あなたの工事内容に合わせた最適な組み合わせを提案します。"
        }
    ],

    philosophy: {
        title: "快適な暮らしを、負担なく。",
        description: "国は今、省エネやバリアフリー改修を強力に支援しています。2026年の制度を正しく使えば、自己負担はぐっと減らせます。"
    },

    bridge: {
        title: "「よくわからない」から「任せて安心」へ",
        description: "補助金制度は毎年アップデートされます。2026年度の最新情報を熟知したプロに、まずは相談しましょう。",
        buttonText: "無料で診断・相談する",
        url: "/inquiry"
    },

    cta: {
        type: "line_quiz",
        title: "まずは「自分が対象か」だけ確認しませんか？",
        description: "LINEで簡単な質問に答えるだけ。30秒であなたが使える補助金と、だいたいの金額がわかります。",
        buttonText: "LINEで無料診断を受ける",
        lineUrl: "https://line.me/R/ti/p/@subsidy_nav",
        image: "/assets/banner-subsidy.jpg"
    },

    categoryNav: [
        { id: 'learn', label: '使える制度', icon: 'school' },
        { id: 'guide', label: '失敗しないコツ', icon: 'explore' },
        { id: 'howto', label: '申請の流れ', icon: 'steps' },
        { id: 'case', label: '事例を見る', icon: 'history_edu' }
    ],
    homepageLayout: 'grid',
    inquiry: { sheetName: "Subsidy_Inquiry" }
};
