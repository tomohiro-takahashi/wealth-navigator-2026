
import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy | Wealth Navigator',
    description: 'プライバシーポリシー',
};

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-neutral-900 text-neutral-300 py-20 px-4 pt-32">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-serif text-white mb-10 text-center">プライバシーポリシー</h1>

                <div className="space-y-8 leading-relaxed font-sans text-sm md:text-base">
                    <p>
                        Wealth Navigator運営事務局（以下「当事務局」といいます）は、本ウェブサイト「Wealth Navigator」（以下「本サイト」といいます）をご利用いただくユーザーの皆様の個人情報の保護に関し、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定め、適切な取り扱いと保護に努めます。
                    </p>

                    <section>
                        <h2 className="text-xl font-serif text-white mb-4 border-b border-neutral-700 pb-2">1. 個人情報の定義</h2>
                        <p>本ポリシーにおいて「個人情報」とは、個人情報の保護に関する法律（以下「個人情報保護法」といいます）に定める個人情報を指し、生存する個人に関する情報であって、氏名、メールアドレス、電話番号、その他の記述等により特定の個人を識別できる情報、または個人識別符号が含まれる情報をいいます。</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-white mb-4 border-b border-neutral-700 pb-2">2. 個人情報の取得方法</h2>
                        <h3 className="text-lg text-white mt-4 mb-2">2-1. ユーザーからの直接提供</h3>
                        <p className="mb-4">本サイトのお問い合わせフォーム、資料請求フォーム、無料相談申込フォーム等を通じて、ユーザーご自身が入力・送信された情報を取得します。取得する情報には、氏名、メールアドレス、電話番号、ご相談内容等が含まれます。</p>

                        <h3 className="text-lg text-white mt-4 mb-2">2-2. 自動的に取得する情報</h3>
                        <p>本サイトでは、ユーザーの利便性向上およびサービス改善のため、Cookie（クッキー）やアクセス解析ツールを使用しています。これにより、IPアドレス、ブラウザの種類、アクセス日時、閲覧ページ、リファラー情報等を自動的に取得することがあります。</p>
                        <p className="mt-2">当サイトでは、Google LLC が提供するアクセス解析ツール「Google Analytics」を使用しています。Google Analytics は Cookie を使用してユーザーのアクセス情報を収集しますが、これらの情報は匿名で収集されており、個人を特定するものではありません。Google Analytics の利用規約およびプライバシーポリシーについては、Google社のウェブサイトをご確認ください。</p>
                        <p className="mt-2">なお、ブラウザの設定により Cookie の受け取りを拒否することが可能ですが、その場合、本サイトの一部機能がご利用いただけなくなる場合があります。</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-white mb-4 border-b border-neutral-700 pb-2">3. 個人情報の利用目的</h2>
                        <p className="mb-4">当事務局は、取得した個人情報を以下の目的で利用いたします。</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>サービスの提供・運営</strong><br />お問い合わせへの回答、資料の送付、ご相談対応など、本サイトで提供するサービスの実施のため</li>
                            <li><strong>提携パートナーへのご紹介</strong><br />ユーザーのご要望に応じて、当事務局が提携する不動産会社、ファイナンシャルプランナー、税理士等の専門家（以下「提携パートナー」といいます）をご紹介し、最適なご提案を行うため</li>
                            <li><strong>サービス向上・改善</strong><br />本サイトのコンテンツ改善、新サービスの開発、ユーザビリティ向上のための分析・調査のため</li>
                            <li><strong>お知らせ・情報配信</strong><br />新着記事、セミナー情報、キャンペーン情報等、ユーザーに有益と思われる情報のご案内のため（配信停止はいつでも可能です）</li>
                            <li><strong>法令遵守・権利保護</strong><br />法令に基づく対応、および当事務局の権利・財産を保護するため</li>
                        </ul>
                        <p className="mt-4">上記の利用目的の範囲を超えて個人情報を利用する場合は、あらかじめユーザーご本人の同意を得るものとします。</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-white mb-4 border-b border-neutral-700 pb-2">4. 個人情報の第三者提供について</h2>
                        <p className="mb-4">当事務局は、以下の場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。</p>

                        <h3 className="text-lg text-white mt-4 mb-2">4-1. 提携パートナーへの提供</h3>
                        <p className="mb-2">ユーザーが当サイトのお問い合わせフォーム等を通じて、不動産投資に関するご相談、物件紹介、専門家への相談等を希望された場合、当事務局はユーザーに最適なサービスを提供するため、提携パートナー（不動産会社、ファイナンシャルプランナー、税理士、その他の専門家等）に対して、以下の情報を提供することがあります。</p>
                        <ul className="list-disc pl-6 mb-2">
                            <li>氏名</li>
                            <li>連絡先（メールアドレス、電話番号）</li>
                            <li>ご相談内容・ご要望</li>
                            <li>その他、ご紹介に必要な情報</li>
                        </ul>
                        <p>この第三者提供は、お問い合わせフォーム等において、ユーザーが本ポリシーに同意いただいた場合に限り行われます。提携パートナーは、当該情報をユーザーへのご連絡・ご提案の目的のみに使用し、適切に管理することを当事務局との契約により義務付けられています。</p>

                        <h3 className="text-lg text-white mt-4 mb-2">4-2. 法令に基づく場合</h3>
                        <p>法令に基づき開示が求められた場合、または公的機関から正当な理由に基づき開示を求められた場合は、ユーザーの同意なく個人情報を提供することがあります。</p>

                        <h3 className="text-lg text-white mt-4 mb-2">4-3. 生命・身体・財産の保護のため</h3>
                        <p>人の生命、身体または財産の保護のために必要がある場合であって、ユーザーご本人の同意を得ることが困難であるとき。</p>

                        <h3 className="text-lg text-white mt-4 mb-2">4-4. 業務委託先への提供</h3>
                        <p>当事務局は、利用目的の達成に必要な範囲内において、個人情報の取り扱いの全部または一部を委託することがあります。その場合、委託先に対して適切な監督を行います。</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-white mb-4 border-b border-neutral-700 pb-2">5. 個人情報の管理</h2>
                        <p>当事務局は、ユーザーの個人情報を正確かつ最新の状態に保ち、個人情報への不正アクセス、紛失、破壊、改ざんおよび漏洩等を防止するため、以下のセキュリティ対策を講じます。</p>
                        <ul className="list-disc pl-6 mt-2">
                            <li>SSL（Secure Socket Layer）による通信の暗号化</li>
                            <li>アクセス権限の適切な設定・管理</li>
                            <li>個人情報を取り扱う担当者の限定および教育</li>
                            <li>保管期間経過後の適切な方法による廃棄</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-white mb-4 border-b border-neutral-700 pb-2">6. 個人情報の開示・訂正・削除等</h2>
                        <p>ユーザーご本人から、当事務局が保有する個人情報について、開示、訂正、追加、削除、利用停止または第三者提供の停止（以下「開示等」といいます）のご請求があった場合は、ご本人であることを確認のうえ、合理的な期間内に対応いたします。<br />ただし、以下の場合には、開示等のご請求に応じられないことがあります。</p>
                        <ul className="list-disc pl-6 mt-2">
                            <li>ご本人または第三者の生命、身体、財産その他の権利利益を害するおそれがある場合</li>
                            <li>当事務局の業務の適正な実施に著しい支障を及ぼすおそれがある場合</li>
                            <li>法令に違反することとなる場合</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-white mb-4 border-b border-neutral-700 pb-2">7. 本ポリシーの変更</h2>
                        <p>当事務局は、法令の改正、社会情勢の変化、その他の事由により、本ポリシーの内容を変更することがあります。変更後のプライバシーポリシーは、本サイト上に掲載した時点から効力を生じるものとします。重要な変更がある場合は、本サイト上で適切な方法によりお知らせいたします。</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-serif text-white mb-4 border-b border-neutral-700 pb-2">8. お問い合わせ窓口</h2>
                        <p>本ポリシーに関するお問い合わせ、個人情報の開示等のご請求、その他個人情報の取り扱いに関するご質問・ご意見等は、以下の窓口までご連絡ください。</p>
                        <div className="mt-4 p-4 bg-neutral-800 rounded-lg">
                            <p className="font-bold">Wealth Navigator 運営事務局</p>
                            <p className="mt-2">メールアドレス：<a href="mailto:info@tom-inc.com" className="text-[#c59f59] hover:underline">info@tom-inc.com</a></p>
                            <p className="text-sm text-neutral-400 mt-2">※お問い合わせへの回答には、数営業日いただく場合がございます。</p>
                        </div>
                        <p className="text-right text-sm text-neutral-500 mt-8">
                            制定日：2026年1月1日<br />
                            最終改定日：2026年1月1日
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
