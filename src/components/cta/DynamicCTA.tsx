import React from 'react';
import { cn } from '@/lib/utils';

type Props = {
    mode?: 'simulation' | 'line' | 'list' | string[] | undefined;
};

// 色変数のマッピング（Tailwind configに基づく）
const COLORS = {
    // primary: #0A192F (Navy)
    // accent: #D4AF37 (Gold)
}

const LineButton = () => (
    <a
        href="https://line.me/" // 実際は環境変数等で管理
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full text-center bg-[#06C755] text-white py-4 px-6 rounded-sm font-bold shadow-md hover:bg-[#05b34c] transition-colors"
    >
        LINEで最新情報を受け取る
    </a>
);

const SimulationButton = () => (
    <a
        href="/simulation"
        className="block w-full text-center bg-accent text-white py-4 px-6 rounded-sm font-bold shadow-md hover:bg-accent-dark transition-colors"
    >
        無料収支シミュレーションを依頼する
    </a>
);

const RequestButton = () => (
    <a
        href="/inquiry"
        className="block w-full text-center bg-primary text-white py-4 px-6 rounded-sm font-bold shadow-md hover:bg-primary-light transition-colors"
    >
        非公開物件リストを請求する
    </a>
);

export const DynamicCTA: React.FC<Props> = ({ mode }) => {
    // microCMSのセレクトフィールドは配列で返ってくることがあるため、最初の要素を取得
    // 配列できた場合は最初の要素をとる、または文字列そのもの
    const modeValue = Array.isArray(mode) ? mode[0] : mode;

    if (!modeValue) {
        return null;
    }

    return (
        <div className="my-12 p-8 bg-gray-50 border border-gray-100 rounded-lg shadow-sm">
            <h3 className="text-xl font-serif text-primary mb-6 text-center font-bold">
                この記事に興味を持った方へ
            </h3>
            <div className="max-w-md mx-auto">
                {modeValue === 'line' && <LineButton />}
                {modeValue === 'simulation' && <SimulationButton />}
                {modeValue === 'list' && <RequestButton />}
            </div>
            <p className="mt-4 text-xs text-center text-gray-500">
                ※ 登録は無料です。いつでも解除できます。
            </p>
        </div>
    );
};
