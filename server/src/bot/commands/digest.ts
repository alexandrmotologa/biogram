import { Bot } from "grammy";
import {
  getProfileByTelegramId,
  getProfileViewCount,
  getClickStats,
  getLeads,
} from "../../db/database";

export function setupDigestCommand(bot: Bot): void {
  bot.command("digest", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const profile = getProfileByTelegramId(userId);
    if (!profile) {
      await ctx.reply("❌ You haven't set up your BioGram profile yet. Send /start to begin.");
      return;
    }

    const views = getProfileViewCount(profile.id);
    const clickStats = getClickStats(profile.id);
    const totalClicks = clickStats.reduce((sum, s) => sum + s.clicks, 0);
    const leads = getLeads(profile.id);
    const overallCtr = views > 0 ? ((totalClicks / views) * 100).toFixed(1) : "0.0";
    const topTile = clickStats[0];

    const lines = [
      `📊 <b>BioGram Performance Digest — @${profile.username}</b>`,
      ``,
      `👀 Total Profile Views: <b>${views}</b>`,
      `👆 Total Link Clicks: <b>${totalClicks}</b>`,
      `📈 Overall CTR: <b>${overallCtr}%</b>`,
      `💌 Subscribers / Leads: <b>${leads.length}</b>`,
      ``,
    ];

    if (topTile && topTile.clicks > 0) {
      lines.push(`🏆 <b>Top Performing Tile:</b> "${topTile.title}" (${topTile.clicks} clicks)`);
    } else {
      lines.push(`💡 Tip: Share your profile link in your bio or channels to start getting clicks!`);
    }

    await ctx.reply(lines.join("\n"), { parse_mode: "HTML" });
  });
}
