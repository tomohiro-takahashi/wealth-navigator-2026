import { NextResponse } from 'next/server';


export async function POST(request: Request) {
    try {
        const data = await request.json();

        // 実際にはここでmicroCMSへのPOSTやメール送信などを行う
        console.log("Inquiry Data Received:", data);

        // 擬似的な遅延
        await new Promise(resolve => setTimeout(resolve, 1000));

        return NextResponse.json({ success: true, message: "お問い合わせを受け付けました。" });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { success: false, message: "エラーが発生しました。" },
            { status: 500 }
        );
    }
}
