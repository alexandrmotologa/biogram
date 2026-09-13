import { v4 as uuidv4 } from "uuid";
import {
  getDb,
  getProfileByUsername,
  createProfile,
  createTile,
  type Profile,
  type BentoTile,
} from "./database";

/**
 * Seeds a demo profile if DEMO_MODE is enabled and the profile doesn't exist yet.
 * Creates "Alex Motologa" with sample tiles covering all tile types.
 */
export function seedDemoProfile(): void {
  if (process.env.DEMO_MODE !== "true") return;

  const existing = getProfileByUsername("demo");
  if (existing) {
    console.log("[seeder] Demo profile already exists, skipping.");
    return;
  }

  console.log("[seeder] Creating demo profile...");

  const profileId = uuidv4();
  const now = Math.floor(Date.now() / 1000);

  const profile: Profile = {
    id: profileId,
    telegram_user_id: 0,
    username: "demo",
    display_name: "Alex Motologa",
    bio: "Software engineer and systems builder. I ship side projects and write about distributed systems, developer tools, and the occasional rant about CSS.",
    avatar_url: null,
    theme: "obsidian",
    created_at: now,
  };

  createProfile(profile);

  const tiles: Omit<BentoTile, "id">[] = [
    {
      profile_id: profileId,
      order_index: 0,
      type: "GITHUB",
      title: "biogram",
      subtitle: "Telegram Mini App for personal branding",
      url: "https://github.com/alexandrmotologa/biogram",
      col_span: 2,
      row_span: 1,
      meta_json: JSON.stringify({ stars: 12, language: "TypeScript", languageColor: "#3178c6" }),
    },
    {
      profile_id: profileId,
      order_index: 1,
      type: "SOCIAL",
      title: "Twitter / X",
      subtitle: "@alexmotologa",
      url: "https://x.com/alexmotologa",
      col_span: 1,
      row_span: 1,
      meta_json: JSON.stringify({ platform: "twitter" }),
    },
    {
      profile_id: profileId,
      order_index: 2,
      type: "SOCIAL",
      title: "LinkedIn",
      subtitle: "Alexandr Motologa",
      url: "https://linkedin.com/in/alexandrmotologa",
      col_span: 1,
      row_span: 1,
      meta_json: JSON.stringify({ platform: "linkedin" }),
    },
    {
      profile_id: profileId,
      order_index: 3,
      type: "GITHUB",
      title: "nexus-workflow",
      subtitle: "Visual workflow engine for Node.js",
      url: "https://github.com/alexandrmotologa/nexus-workflow",
      col_span: 1,
      row_span: 1,
      meta_json: JSON.stringify({ stars: 8, language: "TypeScript", languageColor: "#3178c6" }),
    },
    {
      profile_id: profileId,
      order_index: 4,
      type: "TIP",
      title: "Buy me a coffee",
      subtitle: "Support my open source work",
      url: null,
      col_span: 1,
      row_span: 1,
      meta_json: JSON.stringify({ method: "telegram_stars" }),
    },
    {
      profile_id: profileId,
      order_index: 5,
      type: "MEDIA",
      title: "How I build side projects",
      subtitle: "YouTube",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      col_span: 2,
      row_span: 1,
      meta_json: JSON.stringify({ mediaType: "youtube", videoId: "dQw4w9WgXcQ" }),
    },
    {
      profile_id: profileId,
      order_index: 6,
      type: "CONTACT",
      title: "Message me on Telegram",
      subtitle: "Usually reply within a few hours",
      url: "https://t.me/alexmotologa",
      col_span: 2,
      row_span: 1,
      meta_json: JSON.stringify({ telegramUsername: "alexmotologa" }),
    },
  ];

  for (const tile of tiles) {
    createTile({ id: uuidv4(), ...tile });
  }

  console.log(`[seeder] Demo profile created with ${tiles.length} tiles.`);
}
