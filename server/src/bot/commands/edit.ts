import { Bot, InlineKeyboard } from "grammy";
import { getProfileByTelegramId } from "../../db/database";

export function setupEditCommand(bot: Bot): void {
  bot.command("edit", async (ctx) => {
    const telegramUser = ctx.from;
    if (!telegramUser) return;

    const profile = getProfileByTelegramId(telegramUser.id);

    if (!profile) {
      await ctx.reply("You don't have a profile yet. Send /start to create one.");
      return;
    }

    const port = process.env.PORT || "8080";
    const appUrl = process.env.APP_URL || `http://localhost:${port}`;

    const keyboard = new InlineKeyboard()
      .webApp("Edit my BioGram", `${appUrl}?username=${profile.username}&mode=edit`);

    await ctx.reply("Tap below to open the editor.", { reply_markup: keyboard });
  });
}
