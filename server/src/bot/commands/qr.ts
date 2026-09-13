import { Bot, InputFile } from "grammy";
import QRCode from "qrcode";
import { getProfileByTelegramId } from "../../db/database";

export function setupQrCommand(bot: Bot): void {
  bot.command("qr", async (ctx) => {
    const telegramUser = ctx.from;
    if (!telegramUser) return;

    const profile = getProfileByTelegramId(telegramUser.id);

    if (!profile) {
      await ctx.reply("You don't have a profile yet. Send /start to create one.");
      return;
    }

    const profileUrl = `https://t.me/biogram_bot/app?startapp=${profile.username}`;

    try {
      const qrBuffer = await QRCode.toBuffer(profileUrl, {
        type: "png",
        width: 512,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      await ctx.replyWithPhoto(new InputFile(qrBuffer, "biogram-qr.png"), {
        caption: `QR code for your BioGram profile.\n\nLink: ${profileUrl}`,
      });
    } catch (err) {
      console.error("[qr] Failed to generate QR code:", err);
      await ctx.reply(`Here's your profile link: ${profileUrl}\n\n(QR generation failed, sorry about that.)`);
    }
  });
}
