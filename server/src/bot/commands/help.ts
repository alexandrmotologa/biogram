import { Bot } from "grammy";

export function setupHelpCommand(bot: Bot): void {
  bot.command("help", async (ctx) => {
    await ctx.reply(
      `BioGram commands:\n\n` +
      `/start — Create your profile or view it\n` +
      `/edit — Open the tile editor\n` +
      `/stats — See your click analytics\n` +
      `/qr — Get a QR code for your profile\n` +
      `/export — Download your profile as JSON\n` +
      `/help — This message\n\n` +
      `You can also use inline mode: type @biogram_bot <username> in any chat to share a profile card.`
    );
  });
}
