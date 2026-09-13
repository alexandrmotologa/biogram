import { FastifyInstance } from "fastify";
import { getPublicProfiles, getTilesByProfileId } from "../db/database";

export async function exploreRoutes(app: FastifyInstance): Promise<void> {
  // Public directory of featured Bento profiles
  app.get("/api/explore", async (_request, reply) => {
    try {
      const profiles = getPublicProfiles();

      const list = profiles.map((p) => {
        const tiles = getTilesByProfileId(p.id);
        return {
          id: p.id,
          username: p.username,
          display_name: p.display_name,
          bio: p.bio,
          avatar_url: p.avatar_url,
          theme: p.theme,
          badges: p.badges || [],
          tiles_count: tiles.length,
          preview_tiles: tiles.slice(0, 3).map((t) => ({
            title: t.title,
            type: t.type,
          })),
        };
      });

      return { profiles: list };
    } catch (err) {
      console.error("[explore] Failed to fetch explore profiles:", err);
      return reply.status(500).send({ error: "Failed to load explore directory" });
    }
  });
}
