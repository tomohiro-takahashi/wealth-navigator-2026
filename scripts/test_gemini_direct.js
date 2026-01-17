// scripts/test_gemini_direct.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ▼▼▼ ここに直接キーを貼ってください（.envは使いません） ▼▼▼
const API_KEY = "AIzaSyDrKBFD2p61ENmANS7jf1If88yw-wNSPMY";
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function run() {
    console.log("🚀 Testing Gemini API directly...");
    try {
        const result = await model.generateContent("Hello! Are you working?");
        const response = await result.response;
        console.log("✅ SUCCESS! Response:", response.text());
    } catch (error) {
        console.error("❌ FAILED. Error details:");
        console.error(JSON.stringify(error, null, 2));

        // モデル名を変えて再トライ
        console.log("🔄 Retrying with 'gemini-pro'...");
        try {
            const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
            const resultPro = await modelPro.generateContent("Hello?");
            console.log("✅ SUCCESS with gemini-pro!");
        } catch (errPro) {
            console.error("❌ gemini-pro also failed.");
        }
    }
}

run();
