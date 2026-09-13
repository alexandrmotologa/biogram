import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import path from "path";
import fs from "fs";

import { initDb, closeDb } from "./db/database";
import { seedDemoProfile } from "./db/seeder";
import { profileRoutes } from "./routes/profileApi";
import { tilesRoutes } from "./routes/tilesApi";
import { analyticsRoutes } from "./routes/analyticsApi";
import { createBot, startPolling, stopBot } from "./bot/bot";

const PORT = parseInt(process.env.PORT || "8080", 10);
const HOST = "0.0.0.0";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function main() {
  // Initialize database
  console.log("[server] Initializing database...");
  await initDb();

  // Seed demo data if enabled
  seedDemoProfile();

  // Create Fastify server
  const app = Fastify({ logger: false });

  // CORS for development
  await app.register(cors, {
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  });

  // Support fallback content types on POST/PUT
  app.addContentTypeParser(
    ["text/plain", "application/x-www-form-urlencoded"],
    { parseAs: "string" },
    (_req, body, done) => {
      if (!body || (typeof body === "string" && body.trim().length === 0)) {
        done(null, {});
        return;
      }
      try {
        done(null, JSON.parse(body as string));
      } catch {
        done(null, {});
      }
    }
  );

  // Register API routes
  await app.register(profileRoutes);
  await app.register(tilesRoutes);
  await app.register(analyticsRoutes);

  // Serve frontend static files
  const webDistPath = path.join(__dirname, "..", "..", "web", "dist");
  if (fs.existsSync(webDistPath)) {
    await app.register(fastifyStatic, {
      root: webDistPath,
      prefix: "/",
      wildcard: false,
    });

    // SPA fallback: serve index.html for any non-API, non-file route
    app.setNotFoundHandler(async (request, reply) => {
      if (request.url.startsWith("/api/")) {
        return reply.status(404).send({ error: "Not found" });
      }

      // Inject OG meta tags for profile URLs (link previews on social platforms)
      const profileMatch = request.url.match(/^\/([a-zA-Z0-9_]+)$/);
      if (profileMatch) {
        const { getProfileByUsername } = await import("./db/database");
        const profile = getProfileByUsername(profileMatch[1]);
        if (profile) {
          const htmlPath = path.join(webDistPath, "index.html");
          let html = fs.readFileSync(htmlPath, "utf-8");

          const ogTags = [
            `<meta property="og:title" content="${escapeHtml(profile.display_name)} — BioGram" />`,
            `<meta property="og:description" content="${escapeHtml(profile.bio || 'Check out my Bento profile on Telegram')}" />`,
            `<meta property="og:type" content="profile" />`,
            `<meta property="og:url" content="https://t.me/biogram_bot/app?startapp=${profile.username}" />`,
            `<meta name="twitter:card" content="summary" />`,
            `<meta name="twitter:title" content="${escapeHtml(profile.display_name)} — BioGram" />`,
            `<meta name="twitter:description" content="${escapeHtml(profile.bio || 'Check out my Bento profile on Telegram')}" />`,
          ].join("\n    ");

          html = html.replace("</head>", `    ${ogTags}\n  </head>`);
          return reply.type("text/html").send(html);
        }
      }

      return reply.sendFile("index.html");
    });
  } else {
    console.log("[server] Frontend not built yet. Run 'npm run build' in web/ to serve the Mini App.");

    app.get("/", async (_request, reply) => {
      return reply.send({
        status: "running",
        message: "BioGram API is running. Frontend not built yet.",
        docs: "See /api/p/demo for the demo profile.",
      });
    });
  }

  // Health check
  app.get("/api/health", async () => {
    return { status: "ok", timestamp: Date.now() };
  });

  // Start HTTP server
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`[server] HTTP server running on http://localhost:${PORT}`);
  } catch (err) {
    console.error("[server] Failed to start:", err);
    process.exit(1);
  }

  // Start Telegram bot (only with a real token)
  const botToken = process.env.TELEGRAM_BOT_TOKEN || "";
  if (botToken && botToken !== "mock_token" && botToken !== "your_bot_token_here") {
    try {
      createBot(botToken);
      startPolling();
    } catch (err) {
      console.error("[server] Failed to start bot:", err);
    }
  } else {
    console.log("[server] No valid bot token found. Bot polling disabled. Set TELEGRAM_BOT_TOKEN in .env to enable.");
  }

  // Graceful shutdown
  const shutdown = async () => {
    console.log("\n[server] Shutting down...");
    stopBot();
    closeDb();
    await app.close();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("[server] Fatal error:", err);
  process.exit(1);
});
