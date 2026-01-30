const { generateDailySummary } = require('./lib/monitoring');

async function sendDailySummary() {
  const summary = generateDailySummary();

  if (summary.total === 0) {
    console.log(`[INFO] No executions recorded for ${summary.date}. Skipping summary.`);
    return;
  }

  const message = `
📊 Content Factory 日次レポート
📅 ${summary.date}

✅ 成功: ${summary.success}件
❌ 失敗: ${summary.failed}件
⚠️ 部分成功: ${summary.partial}件

【ブランド別】
${Object.entries(summary.byBrand).map(([brand, stats]) => 
  `・${brand}: ✅${stats.success} ❌${stats.failed} ⚠️${stats.partial}`
).join('\n')}

${summary.failed > 0 ? `
【失敗詳細】
${summary.failedItems.slice(0, 5).map(item => 
  `・${item.slug} (${item.step}): ${item.message.substring(0, 50)}`
).join('\n')}
` : ''}
  `.trim();

  // Discord Webhook
  if (process.env.DISCORD_WEBHOOK_URL) {
    const embed = {
      title: "📊 Content Factory 日次レポート",
      color: 0x3498db, // Blue
      description: `📅 **${summary.date}**`,
      fields: [
        { name: "✅ 成功", value: `${summary.success}件`, inline: true },
        { name: "❌ 失敗", value: `${summary.failed}件`, inline: true },
        { name: "⚠️ 部分成功", value: `${summary.partial}件`, inline: true },
        { 
          name: "【ブランド別】", 
          value: Object.entries(summary.byBrand).map(([brand, stats]) => 
            `・**${brand}**: ✅${stats.success} ❌${stats.failed} ⚠️${stats.partial}`
          ).join('\n') || "データなし"
        }
      ],
      timestamp: new Date().toISOString()
    };

    if (summary.failed > 0) {
      embed.fields.push({
        name: "【失敗詳細】",
        value: summary.failedItems.slice(0, 5).map(item => 
          `・**${item.slug}** (${item.step}): ${item.message.substring(0, 50)}`
        ).join('\n')
      });
    }

    try {
        await fetch(process.env.DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ embeds: [embed] }),
        });
        console.log('✅ Daily summary sent to Discord.');
    } catch (e) {
        console.error(`❌ Failed to send summary to Discord: ${e.message}`);
    }
  } else {
    const textMessage = `
📊 Content Factory 日次レポート
📅 ${summary.date}

✅ 成功: ${summary.success}件
❌ 失敗: ${summary.failed}件
⚠️ 部分成功: ${summary.partial}件

【ブランド別】
${Object.entries(summary.byBrand).map(([brand, stats]) => 
  `・${brand}: ✅${stats.success} ❌${stats.failed} ⚠️${stats.partial}`
).join('\n')}
    `.trim();
    console.log('--- Daily Summary (Log Only) ---');
    console.log(textMessage);
    console.log('--------------------------------');
  }
}

sendDailySummary();
