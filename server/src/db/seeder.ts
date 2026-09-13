import { v4 as uuidv4 } from "uuid";
import {
  getProfileByUsername,
  createProfile,
  createTile,
  type Profile,
  type BentoTile,
} from "./database";

/**
 * Seeds a demo profile if DEMO_MODE is enabled and the profile doesn't exist yet.
 * Creates "Alex Motologa" with rich sample tiles covering all tile types.
 */
export function seedDemoProfile(): void {
  if (process.env.DEMO_MODE !== "true") return;

  const existing = getProfileByUsername("demo");
  if (existing) {
    console.log("[seeder] Demo profile already exists, skipping.");
    return;
  }

  console.log("[seeder] Creating rich demo profile...");

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
    badges: ["👨‍💻 Systems Builder", "🚀 Open Source", "⚡ Indie Hacker"],
    custom_bg: null,
    glass_blur: 14,
    notifications_enabled: true,
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
      locked_stars: 0,
    },
    {
      profile_id: profileId,
      order_index: 1,
      type: "TELEGRAM_CHANNEL",
      title: "Alex's Dev Log",
      subtitle: "1.4k subscribers • Behind the scenes of shipping apps",
      url: "https://t.me/telegram",
      col_span: 2,
      row_span: 1,
      meta_json: JSON.stringify({ channelUsername: "telegram", membersCount: "1.4k", handle: "@alexdevlog" }),
      locked_stars: 0,
    },
    {
      profile_id: profileId,
      order_index: 2,
      type: "SOCIAL",
      title: "Twitter / X",
      subtitle: "@alexmotologa",
      url: "https://x.com/alexmotologa",
      col_span: 1,
      row_span: 1,
      meta_json: JSON.stringify({ platform: "twitter" }),
      locked_stars: 0,
    },
    {
      profile_id: profileId,
      order_index: 3,
      type: "SOCIAL",
      title: "LinkedIn",
      subtitle: "Alexandr Motologa",
      url: "https://linkedin.com/in/alexandrmotologa",
      col_span: 1,
      row_span: 1,
      meta_json: JSON.stringify({ platform: "linkedin" }),
      locked_stars: 0,
    },
    {
      profile_id: profileId,
      order_index: 4,
      type: "AUDIO",
      title: "Lo-Fi Beats for Coding",
      subtitle: "Track Preview • 0:30",
      url: "https://cdn.freesound.org/previews/612/612610_5674468-lq.mp3",
      col_span: 2,
      row_span: 1,
      meta_json: JSON.stringify({ duration: "0:30", artist: "Chill Developer Session" }),
      locked_stars: 0,
    },
    {
      profile_id: profileId,
      order_index: 5,
      type: "GATED_STAR",
      title: "Agent Architecture Playbook",
      subtitle: "Unlock secret architecture notes & code templates",
      url: null,
      col_span: 2,
      row_span: 1,
      meta_json: JSON.stringify({ perks: "Production-ready prompt engineering patterns + Fastify boilerplate" }),
      locked_stars: 15,
      unlocked_content: "🎉 Thank you! Here is your exclusive access: https://github.com/alexandrmotologa/biogram/releases/tag/v0.1.0",
    },
    {
      profile_id: profileId,
      order_index: 6,
      type: "NEWSLETTER",
      title: "Get weekly tech digests",
      subtitle: "Zero spam, unsubscribe anytime",
      url: null,
      col_span: 2,
      row_span: 1,
      meta_json: JSON.stringify({ placeholder: "Enter email or @handle" }),
      locked_stars: 0,
    },
    {
      profile_id: profileId,
      order_index: 7,
      type: "BOOKING",
      title: "Book a 15-min call",
      subtitle: "Architecture review & code consulting",
      url: "https://cal.com/alexmotologa",
      col_span: 1,
      row_span: 1,
      meta_json: JSON.stringify({ platform: "cal.com", badge: "Available" }),
      locked_stars: 0,
    },
    {
      profile_id: profileId,
      order_index: 8,
      type: "TIP",
      title: "Buy me a coffee",
      subtitle: "Send 25 Telegram Stars",
      url: null,
      col_span: 1,
      row_span: 1,
      meta_json: JSON.stringify({ method: "telegram_stars", defaultStars: 25 }),
      locked_stars: 0,
    },
    {
      profile_id: profileId,
      order_index: 9,
      type: "MEDIA",
      title: "How I build side projects",
      subtitle: "YouTube",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      col_span: 2,
      row_span: 1,
      meta_json: JSON.stringify({ mediaType: "youtube", videoId: "dQw4w9WgXcQ" }),
      locked_stars: 0,
    },
    {
      profile_id: profileId,
      order_index: 10,
      type: "CONTACT",
      title: "Message me on Telegram",
      subtitle: "Usually reply within a few hours",
      url: "https://t.me/alexmotologa",
      col_span: 2,
      row_span: 1,
      meta_json: JSON.stringify({ telegramUsername: "alexmotologa" }),
      locked_stars: 0,
    },
  ];

  for (const tile of tiles) {
    createTile({ id: uuidv4(), ...tile });
  }

  console.log(`[seeder] Rich demo profile created with ${tiles.length} tiles.`);
}
