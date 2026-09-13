import { Bot, InlineKeyboard } from "grammy";
import { v4 as uuidv4 } from "uuid";
import {
  getProfileByTelegramId,
  getProfileByUsername,
  createProfile,
} from "../../db/database";

export function setupStartCommand(bot: Bot): void {
  bot.command("start", async (ctx) => {
    const telegramUser = ctx.from;
    if (!telegramUser) return;

    // Check for existing profile
    let profile = getProfileByTelegramId(telegramUser.id);

    if (!profile) {
      // Create a new profile
      const username = telegramUser.username || `user${telegramUser.id}`;

      // Make sure the username isn't taken
      let finalUsername = username.toLowerCase();
      const existing = getProfileByUsername(finalUsername);
      if (existing) {
        finalUsername = `${finalUsername}${telegramUser.id}`;
      }

      const profileId = uuidv4();
      createProfile({
        id: profileId,
        telegram_user_id: telegramUser.id,
        username: finalUsername,
        display_name: [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(" "),
        bio: null,
        avatar_url: null,
        theme: "obsidian",
        created_at: Math.floor(Date.now() / 1000),
      });

      profile = getProfileByTelegramId(telegramUser.id)!;

      const keyboard = new InlineKeyboard()
        .webApp("Open my BioGram", `${getAppUrl()}?username=${profile.username}`)
        .row()
        .webApp("Edit profile", `${getAppUrl()}?username=${profile.username}&mode=edit`);

      await ctx.reply(
        `Welcome to BioGram! Your profile is ready.\n\n` +
        `Your link: t.me/biogram_bot/app?startapp=${profile.username}\n\n` +
        `Use /edit to customize your tiles, or tap the button below.`,
        { reply_markup: keyboard }
      );
    } else {
      const keyboard = new InlineKeyboard()
        .webApp("Open my BioGram", `${getAppUrl()}?username=${profile.username}`)
        .row()
        .webApp("Edit profile", `${getAppUrl()}?username=${profile.username}&mode=edit`);

      await ctx.reply(
        `Welcome back! Your profile: t.me/biogram_bot/app?startapp=${profile.username}`,
        { reply_markup: keyboard }
      );
    }
  });
}

function getAppUrl(): string {
  // In production, this would be the deployed URL
  // For development, we use localhost
  const port = process.env.PORT || "8080";
  return process.env.APP_URL || `http://localhost:${port}`;
}
