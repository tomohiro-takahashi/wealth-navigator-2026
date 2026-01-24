/**
 * Unified Diagnosis Logic for all brands.
 * Ported and refined from the provided reference files.
 */

// --- 1. Flip Logic (MAO Calculator) ---

export type MaoInput = {
    arv: number;
    rehabCost: number;
    listPrice: number;
    contingencyRate: 0.10 | 0.15 | 0.20;
};

export type MaoResult = {
    judgment: {
        id: 'BUY' | 'NEGOTIATE' | 'PASS';
        label: string;
        message: string;
        description: string;
    };
    mao: {
        mao75: number;
        mao70: number;
        mao65: number;
        mao60: number;
    };
    difference: number;
    targetPrice: number | null;
    breakdown: {
        arv: number;
        rehabCostWithContingency: number;
        expenses: number;
        maxPurchasePrice: number;
    };
    input: MaoInput;
};

export const MaoCalculator = {
    calculate: (input: MaoInput): MaoResult => {
        const rehabWithContingency = input.rehabCost * (1 + input.contingencyRate);
        const mao75 = input.arv * 0.75 - rehabWithContingency;
        const mao70 = input.arv * 0.70 - rehabWithContingency;
        const mao65 = input.arv * 0.65 - rehabWithContingency;
        const mao60 = input.arv * 0.60 - rehabWithContingency;
        const difference = mao70 - input.listPrice;

        let judgmentId: 'BUY' | 'NEGOTIATE' | 'PASS' = 'PASS';
        let label = 'PASS';
        let message = '売出価格が高すぎます。';
        let description = 'この価格での仕入れは推奨されません。大幅な価格交渉が必要です。';
        let targetPrice: number | null = null;

        if (input.listPrice <= mao70) {
            judgmentId = 'BUY';
            label = 'BUY';
            message = '理想的な仕入れ価格です。';
            description = '想定される利益率を確保できる可能性が高い物件です。迅速な意思決定をお勧めします。';
        } else if (input.listPrice <= mao75) {
            judgmentId = 'NEGOTIATE';
            label = 'NEGOTIATE';
            message = '交渉の余地があります。';
            description = '指値交渉により、利益を確保できる可能性があります。周辺相場を再確認してください。';
            targetPrice = Math.floor(mao70);
        } else {
            targetPrice = Math.floor(mao75);
        }

        return {
            judgment: {
                id: judgmentId,
                label,
                message,
                description,
            },
            mao: {
                mao75: Math.floor(mao75),
                mao70: Math.floor(mao70),
                mao65: Math.floor(mao65),
                mao60: Math.floor(mao60),
            },
            difference: Math.floor(difference),
            targetPrice,
            breakdown: {
                arv: input.arv,
                rehabCostWithContingency: Math.floor(rehabWithContingency),
                expenses: Math.floor(input.arv * 0.30),
                maxPurchasePrice: Math.floor(mao70),
            },
            input
        };
    }
};

// --- 2. Subsidy (Subsidy Diagnosis) ---

export type SubsidyInput = {
    prefecture: string;
    buildingType: '戸建て' | 'マンション';
    buildingAge: '10年未満' | '10〜20年' | '20〜30年' | '30〜40年' | '40年以上';
    renovationItems: string[];
    householdType: string;
};

export type SubsidyMatch = {
    name: string;
    maxAmount: number;
    amountText: string;
    description: string;
    matchScore: number;
    avgAmount: number;
    reason: string;
    note?: string;
};

export type SubsidyResult = {
    displayType: 'multiple' | 'found' | 'local';
    displayMessage: string;
    matchedSubsidies: SubsidyMatch[];
    totalEstimate: number;
    subsidyCount: number;
};

export const SubsidyDiagnosis = {
    subsidies: {
        windowRenovation: {
            name: '先進的窓リノベ事業',
            maxAmount: 200,
            amountText: '最大200万円',
            description: '窓の断熱改修向け',
            matchScore: 3,
            avgAmount: 100,
        },
        waterHeater: {
            name: '給湯省エネ事業',
            maxAmount: 20,
            amountText: '最大20万円',
            description: '給湯器交換向け',
            matchScore: 2,
            avgAmount: 15,
        },
        childcareEco: {
            name: '子育てエコホーム支援事業',
            maxAmount: 60,
            amountText: '最大60万円',
            description: '子育て世帯向け',
            matchScore: 2,
            avgAmount: 40,
        },
        nursingCare: {
            name: '介護保険住宅改修',
            maxAmount: 18,
            amountText: '最大18万円（9割支給）',
            description: '介護のための住宅改修',
            matchScore: 2,
            avgAmount: 15,
        },
        longTermQuality: {
            name: '長期優良住宅化リフォーム推進事業',
            maxAmount: 250,
            amountText: '最大250万円',
            description: '住宅の長寿命化・性能向上',
            matchScore: 1,
            avgAmount: 150,
        },
    },

    diagnose: (input: SubsidyInput): SubsidyResult => {
        const matched: SubsidyMatch[] = [];

        if (input.renovationItems.includes('窓の断熱')) {
            matched.push({ ...SubsidyDiagnosis.subsidies.windowRenovation, reason: '窓の断熱改修を検討中' });
        }
        if (input.renovationItems.includes('給湯器')) {
            matched.push({ ...SubsidyDiagnosis.subsidies.waterHeater, reason: '給湯器の交換を検討中' });
        }
        if (input.householdType === '18歳未満の子どもがいる' || input.householdType === '夫婦どちらかが39歳以下') {
            matched.push({ ...SubsidyDiagnosis.subsidies.childcareEco, reason: '子育て世帯・若者夫婦世帯' });
        }
        if (input.householdType === '要介護・要支援の方がいる') {
            matched.push({ ...SubsidyDiagnosis.subsidies.nursingCare, reason: '要介護・要支援の方がいる' });
        }
        if (input.renovationItems.includes('バリアフリー') && !matched.find(s => s.name === '介護保険住宅改修')) {
            matched.push({ ...SubsidyDiagnosis.subsidies.nursingCare, reason: 'バリアフリー改修を検討中', note: '※要介護・要支援認定が必要です' });
        }
        if (['20〜30年', '30〜40年', '40年以上'].includes(input.buildingAge)) {
            matched.push({ ...SubsidyDiagnosis.subsidies.longTermQuality, reason: `築${input.buildingAge}の建物` });
        }

        matched.sort((a, b) => b.matchScore - a.matchScore);
        const totalEstimate = matched.reduce((sum, s) => sum + s.avgAmount, 0);

        let displayType: 'multiple' | 'found' | 'local' = 'local';
        let displayMessage = '📋 お住まいの自治体独自の制度を確認しましょう';

        if (matched.length >= 3) {
            displayType = 'multiple';
            displayMessage = '🎉 たくさんの補助金が使えそうです！';
        } else if (matched.length >= 1) {
            displayType = 'found';
            displayMessage = '✅ 使える補助金が見つかりました';
        }

        return {
            displayType,
            displayMessage,
            matchedSubsidies: matched,
            totalEstimate,
            subsidyCount: matched.length
        };
    }
};

// --- 3. Kominka (Yield Calculator) ---

export type YieldInput = {
    acquisitionPrice: number;
    renovationCost: number;
    otherExpenses: number;
    monthlyRent: number;
    annualExpenseRate: number;
};

export type YieldResult = {
    judgment: 'HIGH_YIELD' | 'STANDARD' | 'LOW_YIELD';
    message: string;
    yields: {
        gross: number;
        net: number;
    };
    investment: {
        total: number;
        breakdown: {
            acquisition: number;
            renovation: number;
            other: number;
        };
    };
    income: {
        annualRent: number;
        annualExpenses: number;
        annualNet: number;
        monthlyCashFlow: number;
    };
    paybackPeriod: number;
    input: YieldInput;
};

export const YieldCalculator = {
    calculate: (input: YieldInput): YieldResult => {
        const totalInvestment = input.acquisitionPrice + input.renovationCost + input.otherExpenses;
        const annualRentIncome = input.monthlyRent * 12;
        const annualExpenses = annualRentIncome * input.annualExpenseRate;
        const annualNetIncome = annualRentIncome - annualExpenses;

        const grossYield = (annualRentIncome / totalInvestment) * 100;
        const netYield = (annualNetIncome / totalInvestment) * 100;
        const paybackPeriod = totalInvestment / annualNetIncome;
        const monthlyCashFlow = annualNetIncome / 12;

        let judgment: 'HIGH_YIELD' | 'STANDARD' | 'LOW_YIELD';
        let message: string;

        if (netYield >= 12) {
            judgment = 'HIGH_YIELD';
            message = '優秀な数字だ。この利回りを実現できるなら、迷わず動け。';
        } else if (netYield >= 7) {
            judgment = 'STANDARD';
            message = '空き家投資としては合格ラインだ。リスクとリターンのバランスが取れている。';
        } else {
            judgment = 'LOW_YIELD';
            message = '利回りが物足りない。より安く仕入れるか、もっと高利回りの物件を探すべきだ。';
        }

        return {
            judgment,
            message,
            yields: {
                gross: Math.round(grossYield * 10) / 10,
                net: Math.round(netYield * 10) / 10,
            },
            investment: {
                total: Math.floor(totalInvestment),
                breakdown: {
                    acquisition: input.acquisitionPrice,
                    renovation: input.renovationCost,
                    other: input.otherExpenses,
                },
            },
            income: {
                annualRent: Math.floor(annualRentIncome),
                annualExpenses: Math.floor(annualExpenses),
                annualNet: Math.floor(annualNetIncome),
                monthlyCashFlow: Math.round(monthlyCashFlow * 10) / 10,
            },
            paybackPeriod: Math.round(paybackPeriod * 10) / 10,
            input
        };
    }
};

// --- 4. Legacy (Choice Diagnosis) ---

export type ChoiceInput = Record<string, string>;

export type ChoiceResult = {
    diagnosisType: 'sell' | 'rent' | 'keep' | 'hybrid';
    title: string;
    message: string;
    nextActions: string[];
    scores: {
        sell: number;
        rent: number;
        keep: number;
    };
};

export const ChoiceDiagnosis = {
    diagnosisTypes: {
        sell: {
            title: '「手放す」ことで、前に進めるかもしれません',
            message: `今のあなたの状況では、実家を売却することで、経済的にも心理的にも整理がつきやすいかもしれません。\n\n売却は「諦める」ことではなく、「次のステップに進む」選択です。`,
            nextActions: ['実家の査定を依頼してみる', '相続登記が済んでいるか確認', '兄弟姉妹と方針を共有する'],
        },
        rent: {
            title: '「活かしながら持つ」という選択肢があります',
            message: `所有権を手放さず、誰かに住んでもらうことで、実家を活かし続けることができます。\n\n将来の選択肢を残しながら、収入を得ることも可能です。`,
            nextActions: ['賃貸需要を調査する', '賃貸物件として貸し出せる状態か確認', '管理会社に相談してみる'],
        },
        keep: {
            title: '今は「持ち続ける」という選択も、正解です',
            message: `無理に決断を急ぐ必要はありません。\n\n思い入れのある実家を、もう少し持ち続けることで見えてくるものもあります。`,
            nextActions: ['定期的な管理計画を立てる', '維持費用の見積もりを出す', '将来的な活用方法を家族で話し合う'],
        },
        hybrid: {
            title: '選択肢は、一つではありません',
            message: `あなたの状況では、複数の選択肢が考えられます。\n\nそれぞれのメリット・デメリットを比較しながら、ゆっくり考えていきましょう。`,
            nextActions: ['各選択肢のメリット・デメリットを整理', '専門家に相談して客観的な意見を聞く', '期限を決めて再度検討する'],
        },
    },

    diagnose: (answers: ChoiceInput): ChoiceResult => {
        const scores = { sell: 0, rent: 0, keep: 0 };

        if (answers.q1 === 'ある') scores.keep += 2;
        else if (answers.q1 === 'ないと思う') scores.sell += 2;

        if (answers.q2 === 'できる') scores.keep += 1;
        else if (answers.q2 === '難しい') scores.sell += 2;
        else if (answers.q2 === '誰かに頼めばできる') scores.rent += 1;

        if (answers.q3 === 'はい') scores.sell += 2;
        else if (answers.q3 === '近い将来必要になりそう') scores.sell += 1;

        if (answers.q4 === 'ありそう') scores.rent += 2;
        else if (answers.q4 === 'なさそう') scores.sell += 1;

        if (answers.q5 === '2人') scores.sell += 1;
        else if (answers.q5 === '3人以上') scores.sell += 2;

        if (answers.q6 === '抵抗がある') scores.keep += 2;
        else if (answers.q6 === '整理がついている') scores.sell += 1;

        if (answers.q7 === '40年以上') scores.sell += 1;

        if (answers.q8 === '年に数回以上') scores.keep += 1;
        else if (answers.q8 === 'ほとんどない') scores.sell += 1;

        if (answers.q9 === 'あるかもしれない') scores.keep += 2;
        else if (answers.q9 === 'ないと思う') scores.sell += 1;
        else if (answers.q9 === '分からない') scores.rent += 1;

        if (answers.q10 === '早く決着をつけたい') scores.sell += 1;
        else if (answers.q10 === 'じっくり考えたい') scores.keep += 1;

        const maxScore = Math.max(scores.sell, scores.rent, scores.keep);
        const sortedScores = Object.values(scores).sort((a, b) => b - a);
        const secondScore = sortedScores[1];

        let diagnosisType: 'sell' | 'rent' | 'keep' | 'hybrid';
        if (maxScore - secondScore <= 2) {
            diagnosisType = 'hybrid';
        } else {
            if (maxScore === scores.sell) diagnosisType = 'sell';
            else if (maxScore === scores.rent) diagnosisType = 'rent';
            else diagnosisType = 'keep';
        }

        const diagnosis = ChoiceDiagnosis.diagnosisTypes[diagnosisType];

        return {
            diagnosisType,
            title: diagnosis.title,
            message: diagnosis.message,
            nextActions: diagnosis.nextActions,
            scores
        };
    }
};
