import { Bot } from "grammy";
import {
  getProfileByTelegramId,
  getClickStats,
  getProfileViewCount,
} from "../../db/database";

export function setupStatsCommand(bot: Bot): void {
  bot.command("stats", async (ctx) => {
    const telegramUser = ctx.from;
    if (!telegramUser) return;

    const profile = getProfileByTelegramId(telegramUser.id);

    if (!profile) {
      await ctx.reply("You don't have a profile yet. Send /start to create one.");
      return;
    }

    const viewCount = getProfileViewCount(profile.id);
    const clickStats = getClickStats(profile.id);
    const totalClicks = clickStats.reduce((sum, s) => sum + s.clicks, 0);

    let message = `📊 Analytics for @${profile.username}\n\n`;
    message += `Profile views: ${viewCount}\n`;
    message += `Total tile clicks: ${totalClicks}\n`;

    if (clickStats.length > 0) {
      message += `\nBreakdown by tile:\n`;
      for (const stat of clickStats) {
        const ctr = viewCount > 0 ? Math.round((stat.clicks / viewCount) * 100) : 0;
        message += `  ${stat.title} (${stat.type}): ${stat.clicks} clicks`;
        if (viewCount > 0) message += ` (${ctr}% CTR)`;
        message += `\n`;
      }
    }

    await ctx.reply(message);
  });
}
