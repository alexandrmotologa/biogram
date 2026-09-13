import { Bot } from "grammy";
import { getProfileByTelegramId, updateProfile } from "../../db/database";

export function setupNotificationsCommand(bot: Bot): void {
  bot.command("notifications", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const profile = getProfileByTelegramId(userId);
    if (!profile) {
      await ctx.reply("❌ You haven't set up your BioGram profile yet. Send /start to begin.");
      return;
    }

    const arg = ctx.match?.trim().toLowerCase();
    if (arg === "on") {
      updateProfile(profile.id, { notifications_enabled: true });
      await ctx.reply("🔔 Live click alerts are now **ENABLED**! You will receive a message when someone visits key links on your Bento profile.");
    } else if (arg === "off") {
      updateProfile(profile.id, { notifications_enabled: false });
      await ctx.reply("🔕 Live click alerts are now **MUTED**.");
    } else {
      const current = profile.notifications_enabled ? "ENABLED 🔔" : "MUTED 🔕";
      await ctx.reply(
        `Your notifications are currently **${current}**.\n\nUse:\n• \`/notifications on\` to enable live alerts\n• \`/notifications off\` to mute them`,
        { parse_mode: "Markdown" }
      );
    }
  });
}
