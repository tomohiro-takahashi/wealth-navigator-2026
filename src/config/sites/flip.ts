import { SiteConfig } from '@/types/site';

export const siteConfig: SiteConfig = {
    name: "Flip Logic",
    tagline: "Speed is Cash. The logic of Real Estate Flipping.",
    description: "不動産買取再販（フリップ）の専門サイト。仕入れ、バリューアップ、短期売却のロジック。",
    email: "contact@flip-logic.jp",
    site_id: "flip",
    pinnedSlug: "70-percent-rule",

    theme: {
        colors: {
            primary: "#0B0E14",
            background: "#0B0E14",
            accent: "#00F0FF",
            text: {
                main: "#FFFFFF",
                sub: "#9CA3AF",
                inverse: "#000000"
            },
            link: "#00F0FF",
            border: "#1F2937"
        },
        typography: {
            fontFamily: "sans",
            h2: "text-2xl md:text-3xl font-black uppercase tracking-tighter text-[#00F0FF]"
        },
        rounded: "none"
    },

    hero: {
        title: "感情を捨てよ。<br />数字だけが全て",
        subtitle: "不動産フリッピング、<br />冷徹な論理の教科書。",
        heroImage: "/assets/hero-flip.jpg",
        primaryButton: {
            text: "案件の収益性を分析する",
            url: "/simulation"
        },
        secondaryButton: {
            text: "取引実績を見る",
            url: "/about"
        }
    },

    premium: {
        title: "分析済み案件",
        btnText: "すべての案件を見る"
    },

    features: [
        {
            title: "仕入れ",
            description: "物件の仕入れ方法を知りたい。業者間流通、レインズ攻略、指値交渉。"
        },
        {
            title: "目利き",
            description: "買うべき物件の見極め方を知りたい。積算評価、実勢価格、再販価格。"
        },
        {
            title: "売却",
            description: "高く・早く売る方法を知りたい。ホームステージング、媒介契約戦略。"
        }
    ],

    philosophy: {
        title: "安く買って、高く売る。<br />それ以外は誤差だ。",
        description: "不動産投資には様々な手法がある。しかしフリッピングの本質は、極めてシンプルだ。「安く買って、高く売る」。それだけだ。感情に流されず、相場の歪みを見抜き、出口から逆算して仕入れる。このロジックを徹底できる者だけが、市場で生き残る。ここは、冷徹な計算と論理だけが支配する世界。夢を語る場所ではない。"
    },

    bridge: {
        title: "「なんとなく」で買うな。<br />「逆算」で買え。",
        description: "出口価格から仕入れ上限を逆算する。それがプロの鉄則だ。70%ルールを日本市場に最適化した計算シートで、買う前に利益を確定させろ。",
        buttonText: "逆算シミュレーションを試す",
        url: "/inquiry"
    },

    categoryNav: [
        { id: 'source', label: '仕入れ', icon: 'input' },
        { id: 'analyze', label: '目利き', icon: 'analytics' },
        { id: 'flip', label: '再生', icon: 'construction' },
        { id: 'sell', label: '売却', icon: 'sell' }
    ],
    cta: {
        type: "line_simple",
        label: "Flip Logic Community",
        title: "表に出ない<br />「仕入れ情報」がある。",
        description: "競売の注目案件、任売の事前情報、業者ルートの非公開物件。フリッパーが本当に欲しい情報は、一般には流れてこない。メンバー限定で、週次レポートを配信中。",
        buttonText: "LINEで仕入れ情報を受け取る",
        lineUrl: "https://line.me/R/ti/p/@flip_logic",
        image: "/images/flip_lounge.jpg"
    },
    homepageLayout: 'grid'
};
