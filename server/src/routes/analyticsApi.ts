import { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";
import {
  getProfileByTelegramId,
  getProfileById,
  getTileById,
  recordClick,
  getClickStats,
  getProfileViewCount,
} from "../db/database";
import { extractTelegramUser } from "../security/auth";
import { sendOwnerNotification } from "../bot/bot";

// Simple in-memory rate limiter for click recording
const clickCooldowns = new Map<string, number>();
const CLICK_COOLDOWN_MS = 2000; // 2 seconds between clicks on the same tile from same IP

export async function analyticsRoutes(app: FastifyInstance): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || "";

  // Public: record a click on a tile
  app.post<{ Params: { tileId: string } }>("/api/click/:tileId", async (request, reply) => {
    const { tileId } = request.params;
    const clientIp = request.ip || "unknown";
    const cooldownKey = `${clientIp}:${tileId}`;

    // Rate limit: prevent click spam
    const lastClick = clickCooldowns.get(cooldownKey);
    const now = Date.now();
    if (lastClick && now - lastClick < CLICK_COOLDOWN_MS) {
      return reply.status(429).send({ error: "Too many clicks, slow down" });
    }
    clickCooldowns.set(cooldownKey, now);

    // Clean up old entries periodically (every 100 clicks)
    if (clickCooldowns.size > 1000) {
      const cutoff = now - CLICK_COOLDOWN_MS * 10;
      for (const [key, time] of clickCooldowns) {
        if (time < cutoff) clickCooldowns.delete(key);
      }
    }

    try {
      recordClick(uuidv4(), tileId);

      // Notify profile owner in background if notifications are enabled
      const tile = getTileById(tileId);
      if (tile) {
        const profile = getProfileById(tile.profile_id);
        if (profile && profile.notifications_enabled && profile.telegram_user_id > 0) {
          sendOwnerNotification(
            profile.telegram_user_id,
            `🔔 <b>New Click Alert!</b>\nA visitor just clicked on your Bento tile: <b>${tile.title}</b> (<i>${tile.type}</i>)`
          ).catch(() => {});
        }
      }

      return { success: true };
    } catch {
      return reply.status(500).send({ error: "Failed to record click" });
    }
  });

  // Authenticated: get analytics for own profile
  app.get("/api/analytics", async (request, reply) => {
    const user = extractTelegramUser(request.headers.authorization, botToken);

    if (!user && process.env.DEMO_MODE !== "true") {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const telegramUserId = user?.id || 0;
    const profile = getProfileByTelegramId(telegramUserId);

    if (!profile) {
      return reply.status(404).send({ error: "Profile not found" });
    }

    const viewCount = getProfileViewCount(profile.id);
    const clickStats = getClickStats(profile.id);

    const totalClicks = clickStats.reduce((sum, s) => sum + s.clicks, 0);

    return {
      profile_views: viewCount,
      total_clicks: totalClicks,
      tiles: clickStats.map((s) => ({
        tile_id: s.tile_id,
        title: s.title,
        type: s.type,
        clicks: s.clicks,
        ctr: viewCount > 0 ? Math.round((s.clicks / viewCount) * 10000) / 100 : 0,
      })),
    };
  });
}
