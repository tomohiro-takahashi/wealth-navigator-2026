import { SiteConfig } from '@/types/site';

export const siteConfig: SiteConfig = {
    name: "空き家錬金術",
    tagline: "放置された空き家を、年間利回り15%の資産に変える。",
    description: "古民家投資の極意。物件探し、リノベーション、客付け、出口戦略まで。",
    email: "contact@kominka.jp",
    site_id: "kominka",
    pinnedSlug: "akiyabank-complete-guide",

    theme: {
        colors: {
            primary: "#1a1a1a",
            background: "#191919",
            accent: "#A68A56",
            text: {
                main: "#FFFFFF",
                sub: "#A68A56",
                inverse: "#1a1a1a"
            },
            link: "#A68A56",
            border: "#2D3222"
        },
        typography: {
            fontFamily: "serif",
            h2: "text-4xl md:text-5xl font-bold italic serif-heading text-[#A68A56]"
        },
        rounded: "lg"
    },

    hero: {
        title: "眠れる負動産を<br />富動産へ",
        subtitle: "900万戸の空き家に眠る、<br />年利15%の可能性。",
        heroImage: "/assets/hero-kominka.jpg",
        primaryButton: {
            text: "利回りを10秒でシミュレーション",
            url: "/simulation"
        },
        secondaryButton: {
            text: "空き家錬金術とは？",
            url: "/about"
        }
    },

    premium: {
        title: "発掘された原石たち",
        btnText: "すべての物件を見る"
    },

    features: [
        {
            title: "物件を探す",
            description: "投資対象の物件を見つけたい。空き家バンク、競売、任意売却。"
        },
        {
            title: "再生する",
            description: "リノベーションの方法・費用を知りたい。補助金活用、DIY、職人手配。"
        },
        {
            title: "出口戦略",
            description: "売却・事業承継を考えたい。高値売却、民泊運営、賃貸付け。"
        }
    ],

    philosophy: {
        title: "「負債」と「資産」を分けるのは、<br />視点だけだ。",
        description: "日本中に放置された900万戸の空き家。<br />多くの人はそれを「負債」と呼ぶ。しかし我々は知っている。正しい目利きと再生戦略があれば、それは年利15%を生む「資産」に変わることを。<br />古民家には、新築にはない物語がある。インバウンド旅行者が求めているのは、まさにその「物語」だ。<br />眠れる不動産を叩き起こし、新たな価値を吹き込む。<br />それが、空き家錬金術。"
    },

    bridge: {
        title: "「情報格差」が、<br />利回りの差になる。",
        description: "一般に出回る前の空き家情報、自治体の補助金動向、成功オーナーの非公開ノウハウ。不動産投資で勝つための情報は、表には出てこない。先に知った者だけが、先に動ける。",
        buttonText: "非公開の物件情報を受け取る",
        url: "/inquiry"
    },

    categoryNav: [
        { id: 'find', label: '空き家の探し方', icon: 'search' },
        { id: 'renovate', label: 'リノベ/リフォーム', icon: 'handyman' },
        { id: 'operate', label: '空き家の活用方法', icon: 'key' },
        { id: 'exit', label: '高く売るには', icon: 'payments' }
    ],
    cta: {
        type: "line_simple",
        label: "Kominka Investor Community",
        title: "市場に出る前の<br />「原石」がある。",
        description: "空き家バンクの新着、任意売却の事前情報、地方自治体の補助金付き案件。一般には出回らない物件リストを、メンバー限定で毎週配信しています。",
        buttonText: "LINEで非公開物件を受け取る",
        lineUrl: "https://line.me/R/ti/p/@kominka",
        image: "/assets/banner-kominka.jpg"
    },
    homepageLayout: 'grid'
};
