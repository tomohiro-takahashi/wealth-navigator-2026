import { SiteConfig } from '@/types/site';

export const siteConfig: SiteConfig = {
    name: "Wealth Navigator",
    tagline: "Global Investment Strategies for High Net Worth Individuals.",
    description: "富裕層のための資産防衛・運用戦略。国内・海外不動産、タックスプランニング、ポートフォリオ構築。",
    email: "contact@wealth-navigator.com",
    site_id: "wealth",

    theme: {
        colors: {
            primary: "#1A1A1B",
            background: "#F8F9FA",
            accent: "#C5A059",
            text: {
                main: "#1A1A1B",
                sub: "#4B5563",
                inverse: "#FFFFFF"
            },
            link: "#C5A059",
            border: "#E5E7EB"
        },
        typography: {
            fontFamily: "serif",
            h2: "text-[40px] md:text-[44px] font-medium leading-[1.2] tracking-wide font-serif"
        },
        rounded: "md",
    },

    hero: {
        title: "一流を、<br />再定義する。",
        subtitle: "現代のビジョナリーへ贈る、<br />至高のインサイト。",
        primaryButton: {
            text: "「信用力」と「最適戦略」を診断する (無料)",
            url: "/simulation"
        },
        secondaryButton: {
            text: "About us 私たちについて",
            url: "/about"
        },
        imageQuery: "luxury modern architecture gold finance abstract"
    },

    premium: {
        title: "厳選された物件",
        btnText: "すべての物件を見る"
    },

    features: [
        {
            title: "国内不動産",
            description: "都心プライムエリアの中古マンション、一棟収益物件。流動性と資産価値を重視した選定眼。"
        },
        {
            title: "海外不動産",
            description: "成長著しい新興国から、安定した先進国まで。通貨分散としての海外不動産投資戦略。"
        },
        {
            title: "タックスマネジメント",
            description: "法人活用、減価償却、相続対策。税引き後の手残りキャッシュフローを最大化する。"
        }
    ],

    philosophy: {
        title: "真の豊かさとは、<br />選択肢を持つこと。",
        description: "資産とは、数字の羅列ではない。それは、選択肢である。<br />望む場所に住み、望む時間を生き、望む人々と過ごす。<br />その自由を手にするための、静かなる力である。<br /><br />知識こそが、最強の防衛策。<br />そして、真の自由への最短距離である。"
    },

    bridge: {
        title: "「孤独な決断」から、<br />「確信ある選択」へ",
        description: "資産運用は情報戦です。30年の実績を持つプロフェッショナルを、<br class=\"hidden md:block\" />あなた専属の<span class=\"text-[#c59f59] font-bold\">「プライベート・顧問」</span>に迎え入れる。<br />それが、資産を守る最強の防衛策です。",
        buttonText: "資産防衛・個別相談を予約する",
        url: "/inquiry",
        image: "/images/wealth_lounge.jpg"
    },

    categoryNav: [
        { id: 'domestic', label: '国内不動産', icon: 'apartment' },
        { id: 'overseas', label: '海外不動産', icon: 'public' },
        { id: 'column', label: '資産コラム', icon: 'article' }
    ],
    cta: {
        type: "consultation",
        label: "Members Only Intelligence",
        title: "Webでは書けない<br />「裏情報」がある。",
        description: "この記事で公開したのは、氷山の一角です。<br class=\"hidden md:block\" />具体的な金融機関名、市場に出ない非公開物件、税務の核心...<br />不特定多数には公開できない「資産防衛の真実」を、<br class=\"hidden md:block\" />LINEメンバー限定で配信します。",
        buttonText: "LINEで「極秘情報」を受け取る",
        lineUrl: "https://line.me/R/ti/p/@wealth-navigator",
        image: "/images/wealth_lounge.jpg"
    }
};
