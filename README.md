<p align="center">
  <img src="docs/images/logo.png?raw=true" alt="BioGram Logo" width="130" style="border-radius: 24px;" />
</p>

<h1 align="center">BioGram</h1>

<p align="center">
  <b>Luxury Bento-grid personal link-in-bio inside Telegram.</b><br />
  Share GitHub repositories, social links, audio previews, gate private content, and schedule appointments directly within Telegram.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Telegram-Mini%20App-26A5E4?logo=telegram&logoColor=white" alt="Telegram Mini App" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Fastify-5.x-000000?logo=fastify&logoColor=white" alt="Fastify" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="MIT License" />
</p>

---

## Live Demo & Interface Preview

<p align="center">
  <img src="docs/images/demo.gif?raw=true" alt="BioGram Interactive Demo" width="380" style="border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.4);" />
</p>

### Real Interface Gallery

<table align="center">
  <tr>
    <td align="center" width="50%">
      <b>Public Bento Profile</b><br />
      <img src="docs/images/screenshot-public.png?raw=true" alt="Public Bento Profile" width="320" style="border-radius: 14px;" />
    </td>
    <td align="center" width="50%">
      <b>Telegram Stars Tipping & Gating</b><br />
      <img src="docs/images/screenshot-stars.png?raw=true" alt="Telegram Stars Modal" width="320" style="border-radius: 14px;" />
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <b>Explore Community Directory</b><br />
      <img src="docs/images/screenshot-explore.png?raw=true" alt="Explore Community Directory" width="320" style="border-radius: 14px;" />
    </td>
    <td align="center" width="50%">
      <b>Bento Grid Editor & Reordering</b><br />
      <img src="docs/images/screenshot-edit.png?raw=true" alt="Bento Grid Editor" width="320" style="border-radius: 14px;" />
    </td>
  </tr>
</table>

---

## Why this exists

Services like Linktree and Bento.me work fine, but they sit outside Telegram. If someone discovers you through a Telegram channel, group, or discussion, clicking an external link breaks immersion and hurts conversions.

BioGram keeps that entire experience native inside Telegram's Mini App ecosystem:
- **Instant load** with zero redirects.
- **Native Telegram Stars monetization** for tips and gated exclusive resources.
- **Real-time bot alerts** delivered straight to your Telegram chat whenever someone taps key links or subscribes to your newsletter.

---

## Features

- **Bento Grid Architecture**: Responsive 2-column grid with flexible tile dimensions (`1x1`, `2x1`, `1x2`, and `2x2`).
- **Rich Tile Ecosystem**:
  - 🐙 **GitHub Repos**: Live star counts and language tags.
  - 📢 **Telegram Channel Widget**: Member count badge with direct "Join Channel" CTA.
  - ⭐ **Gated Stars Tile**: Lock exclusive code, articles, or links behind Telegram Stars.
  - ☕ **Tip Jar**: Receive Telegram Stars support directly with customizable star tiers.
  - 🎵 **Mini Audio Player**: Preview audio tracks or voice intros with animated wave visualizer.
  - 💌 **Newsletter / Lead Capture**: Collect emails or Telegram handles with instant creator alerts.
  - 📅 **Booking & Appointments**: Direct scheduling links (Cal.com / Calendly) with live availability pills.
  - 🔗 **Social Links, Video Embeds, Contact CTAs & Text Notes**.
- **Four Luxury Themes**: Obsidian Dark, Cyberpunk, Tokyo Night, and Aurora, with glassmorphism cards and squircle borders.
- **Telegram Bot Automation**:
  - `/start`: Open or create your Bento profile card.
  - `/notifications on|off`: Toggle real-time visitor click alerts.
  - `/digest`: On-demand weekly performance report (views, clicks, CTR, top tiles).
  - `/qr`: Generate a high-resolution QR code for your profile link.
  - `/export`: Download your complete Bento setup as JSON.
  - **Inline Queries**: Share your profile in any chat using `@biogram_bot <username>`.
- **Explore Community**: In-app directory to browse and discover fellow creators.
- **Dynamic OG Meta Tags**: Rich social previews when shared on Twitter/X, LinkedIn, or external browsers.
- **Backup & Restore**: Export and import your Bento configuration as JSON directly in the editor.

---

## Quick start

### With Docker (recommended)

```bash
cp .env.example .env
# Edit .env and add your bot token from @BotFather

docker-compose up --build
```

Open `http://localhost:8080` in your browser. The demo profile loads automatically when `DEMO_MODE=true`.

### Manual setup

You will need Node.js 20+ installed.

```bash
# Install server dependencies and build
cd server
npm install
npm run build

# Install frontend dependencies and build
cd ../web
npm install
npm run build

# Start the BioGram server
cd ../server
npm start
```

---

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Yes (unless DEMO_MODE) | — | Bot token from @BotFather |
| `DEMO_MODE` | No | `false` | Pre-seeds rich demo profile with 11 tiles |
| `PORT` | No | `8080` | HTTP server port |
| `NODE_ENV` | No | `development` | `development` or `production` |

---

## Tech stack

- **Backend**: Node.js, TypeScript, Fastify, grammY (Telegram Bot Framework)
- **Database**: SQLite (`sql.js` WASM / pure JS) with disk persistence in `data/biogram.db`
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Branding**: Procedural SVG and Resvg vector mascot design
- **Containerization**: Multi-stage Dockerfile and Docker Compose

---

## Project structure

```
biogram/
├── docs/
│   ├── images/       # Official logo, screenshots, and animated demo GIF
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   └── DEPLOYMENT.md
├── server/           # Fastify API + grammY Telegram bot
│   └── src/
│       ├── bot/      # Bot commands, notifications, payments, inline queries
│       ├── db/       # SQLite schema, migrations, seeder
│       ├── routes/   # Profile, tiles, stars, leads, analytics, explore API
│       └── security/ # Telegram HMAC-SHA256 initData validation
├── web/              # React 19 Telegram Mini App
│   └── src/
│       ├── components/
│       │   └── tiles/ # Rich tile components (Channel, Audio, Gated, etc.)
│       ├── views/    # PublicBentoView, EditBentoView, ExploreModal, Analytics
│       ├── hooks/    # Telegram SDK & data fetching
│       └── styles/   # Tailwind and custom theme styles
├── Dockerfile
└── docker-compose.yml
```

---

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for setup instructions and guidelines.

## License

MIT. See [LICENSE](LICENSE).