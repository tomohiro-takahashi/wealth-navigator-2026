import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { google } from 'googleapis';
import { getSiteConfig } from '@/site.config';


export async function POST(request: Request) {
    const resendApiKey = process.env.RESEND_API_KEY;
    const resend = resendApiKey ? new Resend(resendApiKey) : null;
    const siteConfig = await getSiteConfig();

    try {
        console.log("[API] Start processing inquiry");
        const body = await request.json();
        const { name, email, phone, message, type } = body;
        console.log(`[API] Received data for: ${name} (${type})`);

        // ---------------------------------------------------------
        // A. Email Notification (Resend)
        // ---------------------------------------------------------
        try {
            const adminEmail = process.env.ADMIN_EMAIL || 'takahashi.tomohiro.0911@gmail.com';
            console.log(`[Email] Admin: ${adminEmail}, Resend Key Exists: ${!!resend}`);

            if (resend) {
                console.log("[Email] Attempting to send...");
                await resend.emails.send({
                    from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
                    to: adminEmail,
                    subject: `【${siteConfig.name}】新規申請: ${name}様 (${type})`,
                    html: `
                        <h2>新規お問い合わせがありました</h2>
                        <p><strong>種別:</strong> ${type}</p>
                        <p><strong>氏名:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>電話番号:</strong> ${phone}</p>
                        <p><strong>内容:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>
                    `,
                });
                console.log("[Email] Sent successfully.");
            } else {
                console.warn("[Email] Resend API Key is missing. Skipping.");
            }
        } catch (emailError) {
            console.error("[Email] Error:", emailError);
        }

        // ---------------------------------------------------------
        // B. Google Sheets (Append)
        // ---------------------------------------------------------
        try {
            const spreadsheetId = siteConfig.inquiry?.spreadsheetId || process.env.GOOGLE_SHEET_ID;
            const sheetName = siteConfig.inquiry?.sheetName || 'Sheet1';
            
            const hasCreds = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && spreadsheetId;
            console.log(`[Sheet] Credentials Check: ${!!hasCreds}, Target: ${spreadsheetId}, Sheet: ${sheetName}`);

            if (hasCreds) {
                const auth = new google.auth.GoogleAuth({
                    credentials: {
                        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                        private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
                    },
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                });

                const sheets = google.sheets({ version: 'v4', auth });
                const timestamp = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

                console.log(`[Sheet] Appending row to ${sheetName}...`);
                await sheets.spreadsheets.values.append({
                    spreadsheetId: spreadsheetId,
                    range: `${sheetName}!A:F`,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: {
                        values: [
                            [timestamp, type, name, email, phone, message]
                        ],
                    },
                });
                console.log("[Sheet] Append success.");
            } else {
                console.log("[Sheet] Credentials or Sheet ID missing, skipping.");
            }
        } catch (sheetError) {
            console.error("[Sheet] Error:", sheetError);
        }

        return NextResponse.json({ success: true, message: "送信完了" });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
