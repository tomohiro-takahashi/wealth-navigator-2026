export type LegacyQuestionId = 'q1' | 'q2' | 'q3' | 'q4' | 'q5' | 'q6' | 'q7' | 'q8' | 'q9' | 'q10';

export type LegacyAnswers = Record<LegacyQuestionId, string>;

export type LegacyResult = {
    scores: {
        sell: number;
        rent: number;
        maintain: number;
    };
    recommendation: 'sell' | 'rent' | 'maintain' | 'complex';
    answers: LegacyAnswers;
};

export const LegacyCalculator = {
    calculate: (answers: LegacyAnswers): LegacyResult => {
        let sell = 0;
        let rent = 0;
        let maintain = 0;

        // Q1: 実家に、今後ご自身やご家族が住む可能性はありますか？
        if (answers.q1 === 'ある') maintain += 2;
        else if (answers.q1 === 'ないと思う') sell += 2;

        // Q2: 実家の維持管理を続けることは可能ですか？
        if (answers.q2 === 'できる') maintain += 1;
        else if (answers.q2 === '難しい') sell += 2;
        else if (answers.q2 === '誰かに頼めばできる') rent += 1;

        // Q3: まとまった資金が必要な状況ですか？
        if (answers.q3 === 'はい') sell += 2;
        else if (answers.q3 === '近い将来必要になりそう') sell += 1;

        // Q4: 実家のある地域に、賃貸の需要はありそうですか？
        if (answers.q4 === 'ありそう') rent += 2;
        else if (answers.q4 === 'なさそう') sell += 1;

        // Q5: 相続人は何人いますか？
        if (answers.q5 === '2人') sell += 1;
        else if (answers.q5 === '3人以上') sell += 2;

        // Q6: 実家を手放すことへの心理的な抵抗は？
        if (answers.q6 === '抵抗がある') maintain += 2;
        else if (answers.q6 === '整理がついている') sell += 1;

        // Q7: 実家の築年数は？
        if (answers.q7 === '40年以上') sell += 1;

        // Q8: 実家に帰省する頻度は？
        if (answers.q8 === '年に数回以上') maintain += 1;
        else if (answers.q8 === 'ほとんどない') sell += 1;

        // Q9: 将来、お子さんやお孫さんが使う可能性は？
        if (answers.q9 === 'あるかもしれない') maintain += 2;
        else if (answers.q9 === 'ないと思う') sell += 1;
        else if (answers.q9 === '分からない') rent += 1;

        // Q10: 今の気持ちに最も近いものは？
        if (answers.q10 === '早く決着をつけたい') sell += 1;
        else if (answers.q10 === 'じっくり考えたい') maintain += 1;

        const maxScore = Math.max(sell, rent, maintain);
        
        // Determine recommendation
        let recommendation: 'sell' | 'rent' | 'maintain' | 'complex' = 'complex';
        
        // If results are very close, return complex
        const scores = [sell, rent, maintain].sort((a, b) => b - a);
        if (scores[0] - scores[1] <= 1 && scores[0] >= 5) {
            recommendation = 'complex';
        } else {
            if (maxScore === sell) recommendation = 'sell';
            else if (maxScore === rent) recommendation = 'rent';
            else recommendation = 'maintain';
        }

        return {
            scores: { sell, rent, maintain },
            recommendation,
            answers
        };
    }
};
