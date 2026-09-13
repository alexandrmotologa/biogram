import { Bot, InputFile } from "grammy";
import {
  getProfileByTelegramId,
  getTilesByProfileId,
} from "../../db/database";

export function setupExportCommand(bot: Bot): void {
  bot.command("export", async (ctx) => {
    const telegramUser = ctx.from;
    if (!telegramUser) return;

    const profile = getProfileByTelegramId(telegramUser.id);

    if (!profile) {
      await ctx.reply("You don't have a profile yet. Send /start to create one.");
      return;
    }

    const tiles = getTilesByProfileId(profile.id);

    const exportData = {
      exported_at: new Date().toISOString(),
      profile: {
        username: profile.username,
        display_name: profile.display_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        theme: profile.theme,
        created_at: new Date(profile.created_at * 1000).toISOString(),
      },
      tiles: tiles.map((t) => ({
        type: t.type,
        title: t.title,
        subtitle: t.subtitle,
        url: t.url,
        col_span: t.col_span,
        row_span: t.row_span,
        meta: t.meta_json ? JSON.parse(t.meta_json) : null,
      })),
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const buffer = Buffer.from(jsonString, "utf-8");

    await ctx.replyWithDocument(
      new InputFile(buffer, `biogram-${profile.username}.json`),
      { caption: "Here's your profile data. Keep it somewhere safe." }
    );
  });
}
