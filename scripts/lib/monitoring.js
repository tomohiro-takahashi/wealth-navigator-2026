const fs = require('fs');
const path = require('path');

// ========== ログ記録（ローカル + Google Sheets） ==========

/**
 * Logs the execution of a factory step.
 * @param {Object} context - The Context object.
 * @param {string} step - The step name ('brain', 'vision', 'director', 'gateway').
 * @param {string} status - The execution status ('success', 'failed', 'partial').
 * @param {string} message - Optional message or error details.
 */
async function logExecution(context, step, status, message = '') {
  const logEntry = {
    timestamp: new Date().toISOString(),
    brand: context.brand,
    slug: context.slug,
    step: step,
    status: status,
    message: message,
  };

  try {
    // 1. ローカルログ（JSON Lines形式）
    const logDir = path.resolve(process.cwd(), './logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    
    const logFile = path.join(logDir, `factory_${new Date().toISOString().split('T')[0]}.jsonl`);
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  } catch (e) {
    console.warn(`[WARN] Failed to write local log: ${e.message}`);
  }

  // 2. Google Sheets連携（GAS Web App）
  if (process.env.GAS_LOG_URL) {
    try {
      await fetch(process.env.GAS_LOG_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry),
      });
    } catch (e) {
      console.warn(`[WARN] Failed to log to Google Sheets: ${e.message}`);
    }
  }

  return logEntry;
}

// ========== 失敗通知（LINE Notify） ==========

/**
 * Sends a failure notification to Discord.
 * @param {Object} context - The Context object.
 * @param {string} step - The failed step name.
 * @param {string} error - The error message.
 */
async function notifyFailure(context, step, error) {
  const embed = {
    title: "❌ Content Factory 失敗",
    color: 0xff0000, // Red
    fields: [
      { name: "Brand", value: context.brand, inline: true },
      { name: "Step", value: step, inline: true },
      { name: "Slug", value: context.slug },
      { name: "Error", value: `\`\`\`${error}\`\`\`` },
      { name: "Work Dir", value: `\`${context.paths.workDir}\`` }
    ],
    timestamp: new Date().toISOString()
  };

  console.error(`[FAILURE] ${context.brand} / ${context.slug} / ${step}: ${error}`);

  // Discord Webhook
  if (process.env.DISCORD_WEBHOOK_URL) {
    try {
      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] }),
      });
      console.log('[NOTIFY] Discord failure notification sent.');
    } catch (e) {
      console.warn(`[WARN] Discord notification failed: ${e.message}`);
    }
  }
}

// ========== 成功通知（日次サマリー用） ==========

/**
 * Records a successful execution and sends a notification.
 */
async function notifySuccess(context, step) {
  await logExecution(context, step, 'success');

  const embed = {
    title: "✅ Content Factory 成功",
    color: 0x00ff00, // Green
    fields: [
      { name: "Brand", value: context.brand, inline: true },
      { name: "Step", value: step, inline: true },
      { name: "Slug", value: context.slug },
      { name: "Status", value: "🎉 Published successfully!" }
    ],
    timestamp: new Date().toISOString()
  };

  if (process.env.DISCORD_WEBHOOK_URL) {
    try {
      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] }),
      });
      console.log('[NOTIFY] Discord success notification sent.');
    } catch (e) {
      console.warn(`[WARN] Discord notification failed: ${e.message}`);
    }
  }
}

// ========== 日次サマリー生成 ==========

/**
 * Generates a summary of the executions for a specific date.
 */
function generateDailySummary(date = null) {
  const targetDate = date || new Date().toISOString().split('T')[0];
  const logFile = path.resolve(process.cwd(), `./logs/factory_${targetDate}.jsonl`);
  
  const initialSummary = { date: targetDate, total: 0, success: 0, failed: 0, partial: 0, entries: [], byBrand: {}, failedItems: [] };

  if (!fs.existsSync(logFile)) {
    return initialSummary;
  }

  try {
    const lines = fs.readFileSync(logFile, 'utf8').trim().split('\n');
    const entries = lines.filter(l => l.trim()).map(line => {
        try { return JSON.parse(line); } catch(e) { return null; }
    }).filter(Boolean);

    const summary = {
      date: targetDate,
      total: entries.length,
      success: entries.filter(e => e.status === 'success').length,
      failed: entries.filter(e => e.status === 'failed').length,
      partial: entries.filter(e => e.status === 'partial').length,
      byBrand: {},
      failedItems: entries.filter(e => e.status === 'failed'),
      entries: entries
    };

    // ブランド別集計
    entries.forEach(e => {
      if (!summary.byBrand[e.brand]) {
        summary.byBrand[e.brand] = { success: 0, failed: 0, partial: 0 };
      }
      if (summary.byBrand[e.brand][e.status] !== undefined) {
        summary.byBrand[e.brand][e.status]++;
      }
    });

    return summary;
  } catch (e) {
    console.error(`[ERROR] Failed to generate summary: ${e.message}`);
    return initialSummary;
  }
}

module.exports = { 
  logExecution, 
  notifyFailure, 
  notifySuccess, 
  generateDailySummary 
};
