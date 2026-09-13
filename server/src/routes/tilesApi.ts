import { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";
import {
  getProfileByTelegramId,
  getTilesByProfileId,
  createTile,
  deleteTile,
  reorderTiles,
} from "../db/database";
import { extractTelegramUser } from "../security/auth";

export async function tilesRoutes(app: FastifyInstance): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || "";

  // Add a new tile
  app.post("/api/tiles", async (request, reply) => {
    const user = extractTelegramUser(request.headers.authorization, botToken);

    if (!user && process.env.DEMO_MODE !== "true") {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const telegramUserId = user?.id || 0;
    const profile = getProfileByTelegramId(telegramUserId);

    if (!profile) {
      return reply.status(404).send({ error: "Profile not found" });
    }

    const body = request.body as {
      type: string;
      title: string;
      subtitle?: string;
      url?: string;
      col_span?: number;
      row_span?: number;
      meta?: Record<string, unknown>;
    };

    const validTypes = ["GITHUB", "SOCIAL", "TIP", "MEDIA", "TEXT", "CONTACT"];
    if (!body.type || !validTypes.includes(body.type)) {
      return reply.status(400).send({ error: `Invalid type. Choose from: ${validTypes.join(", ")}` });
    }

    if (!body.title) {
      return reply.status(400).send({ error: "title is required" });
    }

    // Put the new tile at the end
    const existingTiles = getTilesByProfileId(profile.id);
    const nextIndex = existingTiles.length;

    const tileId = uuidv4();
    createTile({
      id: tileId,
      profile_id: profile.id,
      order_index: nextIndex,
      type: body.type,
      title: body.title,
      subtitle: body.subtitle || null,
      url: body.url || null,
      col_span: Math.min(body.col_span || 1, 2),
      row_span: Math.min(body.row_span || 1, 2),
      meta_json: body.meta ? JSON.stringify(body.meta) : null,
    });

    return reply.status(201).send({ success: true, tile_id: tileId });
  });

  // Reorder tiles (send an array of tile IDs in the desired order)
  app.put("/api/tiles/reorder", async (request, reply) => {
    const user = extractTelegramUser(request.headers.authorization, botToken);

    if (!user && process.env.DEMO_MODE !== "true") {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const telegramUserId = user?.id || 0;
    const profile = getProfileByTelegramId(telegramUserId);

    if (!profile) {
      return reply.status(404).send({ error: "Profile not found" });
    }

    const body = request.body as { tile_ids: string[] };

    if (!body.tile_ids || !Array.isArray(body.tile_ids)) {
      return reply.status(400).send({ error: "tile_ids array is required" });
    }

    reorderTiles(profile.id, body.tile_ids);

    return { success: true };
  });

  // Delete a tile
  app.delete<{ Params: { id: string } }>("/api/tiles/:id", async (request, reply) => {
    const user = extractTelegramUser(request.headers.authorization, botToken);

    if (!user && process.env.DEMO_MODE !== "true") {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const telegramUserId = user?.id || 0;
    const profile = getProfileByTelegramId(telegramUserId);

    if (!profile) {
      return reply.status(404).send({ error: "Profile not found" });
    }

    const deleted = deleteTile(request.params.id, profile.id);

    if (!deleted) {
      return reply.status(404).send({ error: "Tile not found" });
    }

    return { success: true };
  });
}
