import { SiteConfig } from '@/types/site';

export const siteConfig: SiteConfig = {
    name: "親の家、どうする？",
    tagline: "実家を'負担'から'資産'に変える、たったひとつの選択。",
    description: "実家じまい、相続不動産の売却・活用、遺品整理、家族信託の専門サイト。",
    email: "consult@legacy-guard.jp",
    site_id: "legacy",
    pinnedSlug: "real-estate-legacy-options",

    theme: {
        colors: {
            primary: "#1a1a1a",
            background: "#191919",
            accent: "#A68966",
            text: {
                main: "#FFFFFF",
                sub: "#8D8675",
                inverse: "#FFFFFF"
            },
            link: "#A68966",
            border: "#8D8675"
        },
        typography: {
            fontFamily: "sans",
            h2: "text-4xl md:text-6xl font-light italic text-[#A68966]"
        },
        rounded: "lg"
    },

    hero: {
        title: "実家問題、<br />終わらせよう。",
        subtitle: "「いつかやらなきゃ」を、<br />「今日、解決」に。",
        heroImage: "/assets/hero-legacy.jpg",
        primaryButton: {
            text: "診断を開始する",
            url: "/simulation"
        },
        secondaryButton: {
            text: "解決事例を見る",
            url: "/about"
        }
    },

    premium: {
        title: "解決事例",
        btnText: "すべての事例を見る"
    },

    features: [
        {
            title: "心の準備",
            description: "感情の整理・罪悪感の解消。実家じまいは親不孝ではない。"
        },
        {
            title: "選択肢を知る",
            description: "売る・貸す・活かす、どれが正解か。家族会議の進め方。"
        },
        {
            title: "手続き・税金",
            description: "具体的な手続き・税金を知りたい。相続登記、譲渡所得税、特例活用。"
        }
    ],

    philosophy: {
        title: "「先送り」が、<br />最も高くつく。",
        description: "親の家を相続したけれど、どうすればいいかわからない。売るのは親不孝な気がする。でも維持するのも大変。そんな気持ち、よくわかります。ただ、知っておいてほしいのです。空き家は放置するほど、価値が下がり、リスクが増える。相続登記の義務化、固定資産税の増額、近隣トラブル…。「いつかやる」の「いつか」は、永遠に来ません。一人で抱え込まなくて大丈夫。一緒に、最適な選択肢を見つけましょう。"
    },

    bridge: {
        title: "「どうすればいいかわからない」<br />その状態で大丈夫です。",
        description: "売るべきか、貸すべきか、まだ決まっていなくてOK。まずは現状を整理するところから。相続・不動産の専門スタッフが、あなたのペースに合わせてお手伝いします。",
        buttonText: "無料で相談予約する",
        url: "/inquiry"
    },

    categoryNav: [
        { id: 'mindset', label: '心の準備', icon: 'favorite' },
        { id: 'options', label: '選択肢', icon: 'list_alt' },
        { id: 'procedure', label: '手続き', icon: 'gavel' },
        { id: 'case', label: '活用事例', icon: 'history_edu' }
    ],
    cta: {
        type: "consultation",
        label: "Legacy Consultation",
        title: "「実家の価値」<br />知っておきませんか？",
        description: "売るかどうかは別として、今の実家がいくらで売れるのか。それを知っておくだけで、選択肢が見えてきます。もちろん、査定したからといって売る必要はありません。",
        buttonText: "LINEで無料査定を依頼する",
        lineUrl: "https://line.me/R/ti/p/@legacy_guard",
        image: "/images/legacy_lounge.jpg"
    },
    homepageLayout: 'grid'
};
