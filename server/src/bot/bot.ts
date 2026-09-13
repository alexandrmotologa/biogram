import { Bot, InlineKeyboard } from "grammy";
import { setupStartCommand } from "./commands/start";
import { setupEditCommand } from "./commands/edit";
import { setupHelpCommand } from "./commands/help";
import { setupStatsCommand } from "./commands/stats";
import { setupQrCommand } from "./commands/qr";
import { setupExportCommand } from "./commands/export";
import { setupInlineQuery } from "./inline";

let bot: Bot | null = null;

export function createBot(token: string): Bot {
  bot = new Bot(token);

  // Register command handlers
  setupStartCommand(bot);
  setupEditCommand(bot);
  setupHelpCommand(bot);
  setupStatsCommand(bot);
  setupQrCommand(bot);
  setupExportCommand(bot);
  setupInlineQuery(bot);

  // Error handler
  bot.catch((err) => {
    console.error("[bot] Error:", err.message);
  });

  return bot;
}

export function startPolling(): void {
  if (!bot) {
    console.warn("[bot] No bot instance, skipping polling.");
    return;
  }

  console.log("[bot] Starting long polling...");
  bot.start({
    onStart: (botInfo) => {
      console.log(`[bot] @${botInfo.username} is running.`);
    },
  });
}

export function stopBot(): void {
  if (bot) {
    bot.stop();
  }
}
