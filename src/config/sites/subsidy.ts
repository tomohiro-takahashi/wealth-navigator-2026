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
            primary: "#E67E22",
            background: "#141414",
            accent: "#E67E22",
            text: {
                main: "#FDFBF7",
                sub: "#A0A0A0",
                inverse: "#FFFFFF"
            },
            link: "#E67E22",
            border: "#2A2A2A"
        },

        typography: {
            fontFamily: "sans",
            h2: "text-4xl md:text-5xl font-black tracking-tight text-white"
        },

        rounded: "2xl"
    },

    hero: {
        title: "Unlock the Subsidies Your Home Deserves.",
        subtitle: "Expert guidance to navigate wealth benefits and government grants. Our personalized consultants ensure you don't leave money on the table.",
        heroImage: "/assets/hero-subsidy.jpg",
        primaryButton: {
            text: "Get Started Now",
            url: "/simulation"
        },
        secondaryButton: {
            text: "View Success Stories",
            url: "/cases"
        }
    },

    premium: {
        title: "人気の補助金活用術",
        btnText: "すべての活用事例を見る"
    },

    features: [
        {
            title: "申請は業者がやってくれます",
            description: "「手続きが面倒そう…」と思っていませんか？住宅省エネ補助金は、リフォーム会社が申請を代行。あなたがやることは「使いたい」と伝えるだけ。"
        },
        {
            title: "窓・お風呂・給湯器、全部対象です",
            description: "先進的窓リノベで最大200万円、子育てグリーンで最大60万円、給湯省エネで約20万円。組み合わせればさらにお得。"
        },
        {
            title: "100件以上の申請実績",
            description: "私たちはリフォーム会社として、補助金申請を100件以上対応してきました。情報提供だけでなく、工事まで責任を持ちます。"
        }
    ],

    philosophy: {
        title: "快適な暮らしを、負担なく。",
        description: "国は今、省エネや耐震リフォームを全力で応援しています。制度を正しく使えば、自己負担はぐっと減らせます。"
    },

    bridge: {
        title: "「よくわからない」から「任せて安心」へ",
        description: "補助金制度は毎年変わります。最新情報を熟知したプロと、相談できるパートナーとして繋がりましょう。",
        buttonText: "無料で相談予約する",
        url: "/inquiry"
    },

    cta: {
        type: "line_quiz",
        title: "まずは「自分が対象か」だけ確認しませんか？",
        description: "LINEで簡単な質問に答えるだけ。30秒であなたが使える補助金と、だいたいの金額がわかります。",
        buttonText: "LINEで無料診断を受ける",
        lineUrl: "https://line.me/R/ti/p/@subsidy_nav"
    },

    categoryNav: [
        { id: 'learn', label: '知る', icon: 'school' },
        { id: 'guide', label: 'ガイド', icon: 'explore' },
        { id: 'howto', label: '流れ', icon: 'steps' },
        { id: 'case', label: '事例', icon: 'history_edu' }
    ]
};
