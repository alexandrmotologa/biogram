import { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";
import {
  getTileById,
  getProfileById,
  recordStarsPayment,
  getUnlockedTileIdsForUser,
} from "../db/database";
import { extractTelegramUser } from "../security/auth";
import { getBot, sendOwnerNotification } from "../bot/bot";

export async function starsRoutes(app: FastifyInstance): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || "";

  // Get unlocked tiles for the current user on a profile
  app.get<{ Params: { profileId: string } }>(
    "/api/stars/unlocked/:profileId",
    async (request, reply) => {
      const user = extractTelegramUser(request.headers.authorization, botToken);
      const userId = user?.id || 0;
      const { profileId } = request.params;

      const unlocked = getUnlockedTileIdsForUser(profileId, userId);
      return { unlockedTileIds: unlocked };
    }
  );

  // Create a Telegram Stars invoice link
  app.post<{ Body: { tileId: string; amountStars?: number } }>(
    "/api/stars/create-invoice",
    async (request, reply) => {
      const { tileId, amountStars } = request.body || {};
      if (!tileId) {
        return reply.status(400).send({ error: "Missing tileId" });
      }

      const tile = getTileById(tileId);
      if (!tile) {
        return reply.status(404).send({ error: "Tile not found" });
      }

      const price = amountStars || tile.locked_stars || 15;
      const user = extractTelegramUser(request.headers.authorization, botToken);
      const bot = getBot();

      // If bot is active with token, generate real Telegram Stars invoice link
      if (bot && botToken && botToken !== "mock_token") {
        try {
          const payload = JSON.stringify({
            tileId: tile.id,
            profileId: tile.profile_id,
            userId: user?.id || 0,
          });

          const invoiceLink = await bot.api.createInvoiceLink(
            tile.title, // Title
            tile.subtitle || "Unlock exclusive content on BioGram", // Description
            payload, // Payload
            "", // Provider token empty for Stars
            "XTR", // Currency XTR for Telegram Stars
            [{ label: tile.title, amount: price }] // Price in Stars
          );

          return { invoiceLink, simulated: false };
        } catch (err) {
          console.warn("[stars] Could not create real invoice link, falling back to simulated:", err);
        }
      }

      // Simulated invoice for dev/demo mode
      return {
        invoiceLink: null,
        simulated: true,
        tileId: tile.id,
        price,
        title: tile.title,
      };
    }
  );

  // Simulated unlock endpoint for development / demo mode
  app.post<{ Body: { tileId: string } }>(
    "/api/stars/simulate-unlock",
    async (request, reply) => {
      const { tileId } = request.body || {};
      if (!tileId) {
        return reply.status(400).send({ error: "Missing tileId" });
      }

      const tile = getTileById(tileId);
      if (!tile) {
        return reply.status(404).send({ error: "Tile not found" });
      }

      const user = extractTelegramUser(request.headers.authorization, botToken);
      const userId = user?.id || 0;

      recordStarsPayment({
        id: uuidv4(),
        tile_id: tile.id,
        profile_id: tile.profile_id,
        telegram_user_id: userId,
        stars_amount: tile.locked_stars || 15,
        telegram_payment_charge_id: `sim_${Date.now()}`,
        created_at: Math.floor(Date.now() / 1000),
      });

      // Notify owner if available
      const profile = getProfileById(tile.profile_id);
      if (profile && profile.telegram_user_id) {
        sendOwnerNotification(
          profile.telegram_user_id,
          `⭐ <b>Stars Received!</b>\nA user just unlocked your content: <b>"${tile.title}"</b> for ${tile.locked_stars || 15} Stars!`
        ).catch(() => {});
      }

      return {
        success: true,
        unlocked_content: tile.unlocked_content,
      };
    }
  );
}
