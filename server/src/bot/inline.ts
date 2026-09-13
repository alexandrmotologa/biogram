import { Bot, InlineQueryResultBuilder } from "grammy";
import {
  getProfileByUsername,
  getTilesByProfileId,
} from "../db/database";

export function setupInlineQuery(bot: Bot): void {
  bot.on("inline_query", async (ctx) => {
    const query = ctx.inlineQuery.query.trim().toLowerCase();

    if (!query) {
      await ctx.answerInlineQuery([], {
        button: {
          text: "Type a username to search",
          start_parameter: "inline_help",
        },
        cache_time: 5,
      });
      return;
    }

    const profile = getProfileByUsername(query);

    if (!profile) {
      await ctx.answerInlineQuery([], {
        button: {
          text: `No profile found for "${query}"`,
          start_parameter: "not_found",
        },
        cache_time: 10,
      });
      return;
    }

    const tiles = getTilesByProfileId(profile.id);
    const tileCount = tiles.length;

    // Build a short description from the tiles
    const tileTypes = [...new Set(tiles.map((t) => t.type.toLowerCase()))];
    const typeLabels: Record<string, string> = {
      github: "GitHub repos",
      social: "social links",
      tip: "tip jar",
      media: "media",
      text: "notes",
      contact: "contact",
    };
    const tileDescription = tileTypes.map((t) => typeLabels[t] || t).join(", ");

    const profileUrl = `https://t.me/biogram_bot/app?startapp=${profile.username}`;

    const messageText =
      `⭐ ${profile.display_name}\n` +
      (profile.bio ? `\n${profile.bio}\n` : "") +
      `\n${tileCount} tiles: ${tileDescription}`;

    const result = InlineQueryResultBuilder.article(profile.id, `⭐ ${profile.display_name}'s Bento Profile`, {
      description: profile.bio || `${tileCount} tiles on their BioGram`,
      reply_markup: {
        inline_keyboard: [
          [{ text: "🌐 Open Bento Profile", url: profileUrl }],
        ],
      },
    }).text(messageText);

    await ctx.answerInlineQuery([result], { cache_time: 30 });
  });
}
