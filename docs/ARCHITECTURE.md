# Architecture

BioGram has three moving parts: a Telegram bot, an HTTP API, and a React frontend. They all run in a single Node.js process, with SQLite as the database.

## How the pieces connect

```
┌─────────────┐     Long Polling      ┌──────────────────────────────┐
│  Telegram   │◄────────────────────► │  Node.js Process             │
│  Bot API    │                       │                              │
└─────────────┘                       │  ┌────────┐  ┌───────────┐  │
                                      │  │ grammY  │  │  Fastify   │  │
┌─────────────┐     HTTP :8080        │  │  Bot    │  │  HTTP API  │  │
│  Browser /  │◄────────────────────► │  └────┬───┘  └─────┬─────┘  │
│  Telegram   │                       │       │            │         │
│  WebView    │                       │       └─────┬──────┘         │
└─────────────┘                       │             │                │
                                      │      ┌──────▼──────┐        │
                                      │      │   SQLite     │        │
                                      │      │  (WAL mode)  │        │
                                      │      └──────────────┘        │
                                      └──────────────────────────────┘
```

## Telegram bot

The bot uses grammY with long polling (`getUpdates`). No webhooks, no public URL, no SSL certificate needed. It handles:

- `/start`: creates a user profile (or finds the existing one) and sends a button that opens the Mini App
- `/edit`: opens the Mini App in edit mode
- `/stats`: sends a quick summary of profile views and clicks
- `/help`: lists available commands
- `/qr`: generates a QR code image for the profile link
- `/export`: sends the user's profile data as a JSON file

Inline queries let anyone type `@biogram_bot username` in any Telegram chat. The bot looks up the profile and returns a styled result card with a button that opens the Mini App.

## HTTP API

Fastify serves both the REST API and the built frontend files. All API routes sit under `/api/`:

| Route | Method | Auth | What it does |
|---|---|---|---|
| `/api/p/:username` | GET | No | Returns a profile with its tiles |
| `/api/profile` | PUT | Yes | Updates the authenticated user's profile |
| `/api/tiles` | POST | Yes | Adds a new tile |
| `/api/tiles/reorder` | PUT | Yes | Reorders tiles (bulk update) |
| `/api/tiles/:id` | DELETE | Yes | Removes a tile |
| `/api/click/:tileId` | POST | No | Records a click event |
| `/api/analytics` | GET | Yes | Returns click stats for the profile owner |

Authentication uses Telegram's `initData` validation. The Mini App sends the init data string in the `Authorization` header, and the server verifies the HMAC-SHA256 signature against the bot token.

## Database

SQLite runs in WAL (Write-Ahead Logging) mode for better concurrent read performance. Three tables:

- **profiles**: user identity, display name, bio, avatar URL, chosen theme
- **bento_tiles**: each tile belongs to a profile, has a type (GITHUB, SOCIAL, TIP, MEDIA, TEXT, CONTACT), position, size (col_span and row_span), and a JSON blob for type-specific data
- **click_events**: timestamp log of tile clicks, used for analytics

The schema uses TEXT primary keys (UUIDs) and INTEGER timestamps (Unix seconds).

## Frontend

The React app runs inside Telegram's WebView via the TWA (Telegram Web App) SDK. It reads theme parameters from Telegram (dark mode, accent color) and uses haptic feedback for interactions.

Three main views:

1. **PublicBentoView**: the visitor-facing grid. Fetches the profile by username from the URL, renders tiles in a CSS Grid layout. Clicking a tile records the click and opens the link.
2. **EditBentoView**: the owner's editor. Drag-and-drop reordering, add/remove tiles, change tile properties, pick a theme. Requires authentication.
3. **AnalyticsModal**: overlay that shows click counts per tile and total profile views.

The Bento grid uses CSS Grid with dynamic `grid-column: span N` / `grid-row: span N` classes. On mobile, the grid is 2 columns wide. Tiles have glassmorphic styling with backdrop blur and subtle borders.

## Themes

Four visual themes, applied via CSS custom properties:

| Theme | Background | Cards | Accent |
|---|---|---|---|
| Obsidian Dark | Near-black gradient | Dark glass with white/10 border | Blue-violet |
| Cyberpunk | Deep purple to black | Neon-bordered cards | Hot pink / cyan |
| Glassmorphic | Blurred gradient mesh | Frosted glass, high blur | White / teal |
| Minimal Paper | Off-white | Flat cards with subtle shadow | Charcoal |

## Demo mode

When `DEMO_MODE=true`, the server seeds a sample profile on startup: "Alex Motologa" with tiles for GitHub repos, Twitter/X, LinkedIn, a YouTube embed, a tip button, and a contact card. The seeder runs once and skips if the demo profile already exists.
