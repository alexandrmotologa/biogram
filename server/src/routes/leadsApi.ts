import { FastifyInstance } from "fastify";
import { v4 as uuidv4 } from "uuid";
import {
  getProfileByUsername,
  addLead,
  getLeads,
} from "../db/database";
import { extractTelegramUser } from "../security/auth";
import { sendOwnerNotification } from "../bot/bot";

export async function leadsRoutes(app: FastifyInstance): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN || "";

  // Public: subscribe to a profile's newsletter
  app.post<{ Params: { username: string }; Body: { emailOrHandle: string } }>(
    "/api/p/:username/subscribe",
    async (request, reply) => {
      const { username } = request.params;
      const { emailOrHandle } = request.body || {};

      if (!emailOrHandle || typeof emailOrHandle !== "string" || emailOrHandle.trim().length < 3) {
        return reply.status(400).send({ error: "Invalid email or handle" });
      }

      const profile = getProfileByUsername(username);
      if (!profile) {
        return reply.status(404).send({ error: "Profile not found" });
      }

      const trimmed = emailOrHandle.trim();
      addLead({
        id: uuidv4(),
        profile_id: profile.id,
        email_or_handle: trimmed,
        created_at: Math.floor(Date.now() / 1000),
      });

      // Send owner notification
      if (profile.telegram_user_id > 0 && profile.notifications_enabled) {
        sendOwnerNotification(
          profile.telegram_user_id,
          `💌 <b>New Subscriber!</b>\n<code>${trimmed}</code> just subscribed to your BioGram newsletter!`
        ).catch(() => {});
      }

      return { success: true, message: "Subscribed successfully" };
    }
  );

  // Authenticated: view leads for own profile
  app.get<{ Params: { username: string } }>(
    "/api/p/:username/leads",
    async (request, reply) => {
      const { username } = request.params;
      const profile = getProfileByUsername(username);
      if (!profile) {
        return reply.status(404).send({ error: "Profile not found" });
      }

      const user = extractTelegramUser(request.headers.authorization, botToken);
      if (
        process.env.DEMO_MODE !== "true" &&
        (!user || user.id !== profile.telegram_user_id)
      ) {
        return reply.status(403).send({ error: "Forbidden" });
      }

      const leads = getLeads(profile.id);
      return { leads };
    }
  );
}
