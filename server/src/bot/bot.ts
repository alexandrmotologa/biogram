import { Bot } from "grammy";
import { setupStartCommand } from "./commands/start";
import { setupEditCommand } from "./commands/edit";
import { setupHelpCommand } from "./commands/help";
import { setupStatsCommand } from "./commands/stats";
import { setupQrCommand } from "./commands/qr";
import { setupExportCommand } from "./commands/export";
import { setupNotificationsCommand } from "./commands/notifications";
import { setupDigestCommand } from "./commands/digest";
import { setupInlineQuery } from "./inline";
import { recordStarsPayment } from "../db/database";
import { v4 as uuidv4 } from "uuid";

let bot: Bot | null = null;

export function getBot(): Bot | null {
  return bot;
}

export async function sendOwnerNotification(
  telegramUserId: number,
  message: string
): Promise<void> {
  if (!bot || !telegramUserId || telegramUserId === 0) return;
  try {
    await bot.api.sendMessage(telegramUserId, message, { parse_mode: "HTML" });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[bot] Notification skipped for user ${telegramUserId}: ${msg}`);
  }
}

export function createBot(token: string): Bot {
  bot = new Bot(token);

  // Register command handlers
  setupStartCommand(bot);
  setupEditCommand(bot);
  setupHelpCommand(bot);
  setupStatsCommand(bot);
  setupQrCommand(bot);
  setupExportCommand(bot);
  setupNotificationsCommand(bot);
  setupDigestCommand(bot);
  setupInlineQuery(bot);

  // Telegram Stars: answer pre-checkout queries
  bot.on("pre_checkout_query", async (ctx) => {
    try {
      await ctx.answerPreCheckoutQuery(true);
    } catch (err) {
      console.error("[bot] Pre-checkout error:", err);
    }
  });

  // Telegram Stars: handle successful payment
  bot.on("message:successful_payment", async (ctx) => {
    const payment = ctx.message.successful_payment;
    const fromId = ctx.from.id;
    try {
      const payload = JSON.parse(payment.invoice_payload);
      const { tileId, profileId } = payload;

      recordStarsPayment({
        id: uuidv4(),
        tile_id: tileId,
        profile_id: profileId,
        telegram_user_id: fromId,
        stars_amount: payment.total_amount,
        telegram_payment_charge_id: payment.telegram_payment_charge_id,
        created_at: Math.floor(Date.now() / 1000),
      });

      await ctx.reply("⭐ Payment confirmed! Your content has been unlocked in the Bento Mini App.");
    } catch (err) {
      console.error("[bot] Error processing successful payment:", err);
    }
  });

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
