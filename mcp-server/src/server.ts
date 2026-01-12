import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";

// 環境変数からAPIキーを取得
// 実行時に MICROCMS_SERVICE_DOMAIN, MICROCMS_API_KEY が必要
const MICROCMS_SERVICE_DOMAIN = process.env.MICROCMS_SERVICE_DOMAIN;
const MICROCMS_API_KEY = process.env.MICROCMS_API_KEY;

const server = new Server(
    {
        name: "wealth-navigator-cms-server",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

// ツール定義
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "create_article",
                description: "Wealth Navigator 2026の記事をmicroCMSに入稿する",
                inputSchema: {
                    type: "object",
                    properties: {
                        title: { type: "string", description: "記事タイトル" },
                        slug: { type: "string", description: "URLスラッグ (英数字)" },
                        content: { type: "string", description: "HTML形式の本文" },
                        category: {
                            type: "array",
                            items: { type: "string", enum: ["domestic", "overseas", "column"] },
                            description: "カテゴリIDの配列"
                        },
                        target_yield: { type: "string", description: "想定利回り" },
                        expert_tip: { type: "string", description: "専門家の視点・解説" },
                        cta_mode: {
                            type: "string",
                            enum: ["simulation", "line", "list"], // 最新のスキーマに合わせる
                            description: "CTAの表示モード"
                        },
                        math_enabled: { type: "boolean", description: "数式(LaTeX)を有効にするか" }
                    },
                    required: ["title", "slug", "content"]
                },
            },
        ],
    };
});

// ツール実行
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "create_article") {
        const articleData = request.params.arguments;

        if (!MICROCMS_SERVICE_DOMAIN || !MICROCMS_API_KEY) {
            return {
                content: [{ type: "text", text: "Error: MICROCMS_SERVICE_DOMAIN or MICROCMS_API_KEY not set." }],
                isError: true,
            }
        }

        // microCMS APIへのPOSTリクエスト
        try {
            const response = await fetch(
                `https://${MICROCMS_SERVICE_DOMAIN}.microcms.io/api/v1/articles`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-MICROCMS-API-KEY": MICROCMS_API_KEY,
                    },
                    body: JSON.stringify(articleData),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                return {
                    content: [{ type: "text", text: `Error: ${response.status} - ${errorText}` }],
                    isError: true,
                };
            }

            const result = await response.json() as { id: string };
            return {
                content: [
                    {
                        type: "text",
                        text: `記事の入稿に成功しました。ID: ${result.id}`,
                    },
                ],
            };
        } catch (error: any) {
            return {
                content: [{ type: "text", text: `Error: ${error.message}` }],
                isError: true,
            };
        }
    }
    throw new Error("Tool not found");
});

const transport = new StdioServerTransport();
await server.connect(transport);
