# BioGram

Your Telegram profile page, done right. A personal link-in-bio that lives inside Telegram as a Mini App, so people find you where they already are.

BioGram gives you a drag-and-drop grid of tiles: pin your GitHub repos, drop in social links, add a tip jar, embed a video, or put up a "message me" button. Pick a theme, share the link, and you're set.

## What it looks like

> Screenshots coming once the frontend is wired up.

## Why this exists

Services like Linktree and Bento.me work fine, but they sit outside Telegram. If someone finds you through a Telegram group or channel, they shouldn't need to leave the app to see what you're about. BioGram keeps that entire flow inside Telegram's Mini App system.

## Features

- **Bento grid layout** with 1x1, 2x1, and 2x2 tiles that snap into a responsive two-column grid
- **Five tile types**: GitHub repo (live star count and language tag), social link, tip/coffee button, video embed, and direct Telegram contact
- **Four themes**: Obsidian Dark, Cyberpunk, Glassmorphic, Minimal Paper
- **Inline queries**: type `@biogram_bot username` in any chat to share a profile card
- **Click analytics**: see which tiles people tap and how often
- **Demo mode**: ships with a pre-seeded profile so you can see everything working without a bot token
- **QR code generation**: get a scannable code for your profile link
- **Data export**: download your profile as JSON

## Quick start

### With Docker (recommended)

```bash
cp .env.example .env
# Edit .env and add your bot token from @BotFather

docker-compose up --build
```

Open `http://localhost:8080` in your browser. The demo profile loads automatically when `DEMO_MODE=true`.

### Manual setup

You'll need Node.js 20+ installed.

```bash
# Install server dependencies
cd server
npm install
npm run build

# Install frontend dependencies
cd ../web
npm install
npm run build

# Go back to server and start
cd ../server
npm start
```

## Environment variables

| Variable | Required | Default | What it does |
|---|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Yes (unless DEMO_MODE) | — | Bot token from @BotFather |
| `DEMO_MODE` | No | `false` | Seeds a sample profile on startup |
| `PORT` | No | `8080` | HTTP server port |
| `NODE_ENV` | No | `development` | `development` or `production` |

## Tech stack

- **Backend**: Node.js, TypeScript, Fastify, grammY
- **Database**: SQLite (better-sqlite3) in WAL mode
- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons
- **Telegram SDK**: @twa-dev/sdk
- **Containerization**: Docker with multi-stage builds

## Project structure

```
biogram/
├── server/           # API + Telegram bot
│   └── src/
│       ├── bot/      # grammY bot, commands, inline queries
│       ├── db/       # SQLite schema and demo seeder
│       ├── routes/   # REST API endpoints
│       └── security/ # Telegram auth validation
├── web/              # React Mini App
│   └── src/
│       ├── views/    # Public grid, editor, analytics
│       ├── components/
│       │   └── tiles/ # Individual tile types
│       ├── hooks/    # Telegram SDK and data fetching
│       └── styles/   # Tailwind config and theme CSS
├── docs/             # Architecture, deployment, contributing
├── Dockerfile
└── docker-compose.yml
```

## Contributing

See [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) for setup instructions and guidelines.

## License

MIT. See [LICENSE](LICENSE).
