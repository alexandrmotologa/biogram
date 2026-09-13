import { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";
import {
  getProfileByUsername,
  getProfileByTelegramId,
  createProfile,
  updateProfile,
  getTilesByProfileId,
  recordProfileView,
  hasUserUnlockedTile,
} from "../db/database";
import { extractTelegramUser } from "../security/auth";

export async function profileRoutes(app: FastifyInstance): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || "";

  // Public: get a profile by username (with tiles)
  app.get<{ Params: { username: string } }>("/api/p/:username", async (request, reply) => {
    const { username } = request.params;
    const profile = getProfileByUsername(username);

    if (!profile) {
      return reply.status(404).send({ error: "Profile not found" });
    }

    const tiles = getTilesByProfileId(profile.id);
    const user = extractTelegramUser(request.headers.authorization, botToken);
    const requesterTelegramId = user?.id || 0;
    const isOwner = requesterTelegramId > 0 && requesterTelegramId === profile.telegram_user_id;

    // Record a view (fire and forget, don't slow down the response)
    try {
      recordProfileView(uuidv4(), profile.id);
    } catch {
      // Non-critical, skip silently
    }

    return {
      id: profile.id,
      username: profile.username,
      display_name: profile.display_name,
      bio: profile.bio,
      avatar_url: profile.avatar_url,
      theme: profile.theme,
      badges: profile.badges || [],
      custom_bg: profile.custom_bg || null,
      glass_blur: profile.glass_blur ?? 12,
      notifications_enabled: profile.notifications_enabled !== false,
      tiles: tiles.map((t) => {
        const isGated = (t.locked_stars || 0) > 0;
        const isUnlocked = !isGated || isOwner || hasUserUnlockedTile(t.id, requesterTelegramId);

        return {
          id: t.id,
          order_index: t.order_index,
          type: t.type,
          title: t.title,
          subtitle: t.subtitle,
          url: t.url,
          col_span: t.col_span,
          row_span: t.row_span,
          meta: t.meta_json ? JSON.parse(t.meta_json) : null,
          locked_stars: t.locked_stars || 0,
          is_unlocked: isUnlocked,
          unlocked_content: isUnlocked ? t.unlocked_content : null,
        };
      }),
    };
  });

  // Authenticated: update own profile
  app.put("/api/profile", async (request, reply) => {
    const user = extractTelegramUser(request.headers.authorization, botToken);

    // In demo mode, allow unauthenticated updates for testing
    if (!user && process.env.DEMO_MODE !== "true") {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const telegramUserId = user?.id || 0;
    const profile = getProfileByTelegramId(telegramUserId);

    if (!profile) {
      return reply.status(404).send({ error: "Profile not found. Use /start in the bot first." });
    }

    const body = request.body as {
      display_name?: string;
      bio?: string;
      avatar_url?: string;
      theme?: string;
      badges?: string[];
      custom_bg?: string | null;
      glass_blur?: number;
      notifications_enabled?: boolean;
    };

    const validThemes = ["obsidian", "cyberpunk", "tokyo", "aurora", "glassmorphic", "paper"];
    if (body.theme && !validThemes.includes(body.theme)) {
      return reply.status(400).send({ error: `Invalid theme. Choose from: ${validThemes.join(", ")}` });
    }

    updateProfile(profile.id, {
      display_name: body.display_name,
      bio: body.bio,
      avatar_url: body.avatar_url,
      theme: body.theme,
      badges: body.badges,
      custom_bg: body.custom_bg,
      glass_blur: body.glass_blur,
      notifications_enabled: body.notifications_enabled,
    });

    return { success: true };
  });

  // Authenticated: create profile (used by bot, but also available via API for testing)
  app.post("/api/profile", async (request, reply) => {
    const user = extractTelegramUser(request.headers.authorization, botToken);

    if (!user && process.env.DEMO_MODE !== "true") {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const telegramUserId = user?.id || 0;
    const existing = getProfileByTelegramId(telegramUserId);

    if (existing) {
      return reply.status(409).send({ error: "Profile already exists", profile_id: existing.id });
    }

    const body = request.body as {
      username: string;
      display_name: string;
      bio?: string;
      avatar_url?: string;
      badges?: string[];
      custom_bg?: string;
    };

    if (!body.username || !body.display_name) {
      return reply.status(400).send({ error: "username and display_name are required" });
    }

    // Check username availability
    const usernameExists = getProfileByUsername(body.username);
    if (usernameExists) {
      return reply.status(409).send({ error: "Username taken" });
    }

    const profileId = uuidv4();
    createProfile({
      id: profileId,
      telegram_user_id: telegramUserId,
      username: body.username.toLowerCase(),
      display_name: body.display_name,
      bio: body.bio || null,
      avatar_url: body.avatar_url || null,
      theme: "obsidian",
      badges: body.badges || [],
      custom_bg: body.custom_bg || null,
      glass_blur: 12,
      notifications_enabled: true,
      created_at: Math.floor(Date.now() / 1000),
    });

    return reply.status(201).send({ success: true, profile_id: profileId });
  });
}
