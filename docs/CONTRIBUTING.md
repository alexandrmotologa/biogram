# Contributing to BioGram

Thanks for your interest in contributing. Here's how to get set up and what to keep in mind.

## Setting up a dev environment

You'll need Node.js 20 or later.

1. Fork and clone the repo
2. Copy the environment file:
   ```bash
   cp .env.example .env
   ```
3. Install dependencies for both server and frontend:
   ```bash
   cd server && npm install
   cd ../web && npm install
   ```
4. Start the server in dev mode:
   ```bash
   cd server && npm run dev
   ```
5. In a separate terminal, start the frontend dev server:
   ```bash
   cd web && npm run dev
   ```

The API runs on port 8080 and the Vite dev server on port 5173. The Vite config proxies API requests to the backend automatically.

If you set `DEMO_MODE=true` in `.env`, you'll get a pre-seeded profile to work with, so you don't need a real bot token during development.

## Code style

- TypeScript everywhere, strict mode enabled
- No `any` types unless you have a good reason and leave a comment explaining why
- Use `const` by default, `let` when reassignment is necessary
- Name files in camelCase (e.g. `profileApi.ts`, `useTelegram.ts`)
- Keep functions short. If a function needs a scroll to read, split it up

## Commits

Follow conventional commit format:

```
feat: add QR code generation command
fix: correct tile reorder when last tile is moved
docs: update deployment guide with nginx example
```

## Pull requests

- One feature or fix per PR
- Include a short description of what changed and why
- If you're adding a new tile type, include a screenshot or screen recording of it working in the Mini App
- Make sure `npm run build` passes in both `server/` and `web/` before opening the PR

## Reporting bugs

Open an issue with:
- What you expected to happen
- What actually happened
- Steps to reproduce (the fewer, the better)
- Node.js version and OS

## Adding a new tile type

If you want to add a new tile type (e.g. a Spotify embed or a skill bar):

1. Add the type name to the `type` enum in `server/src/db/database.ts`
2. Create the tile component in `web/src/components/tiles/`
3. Register it in the tile renderer inside `PublicBentoView.tsx`
4. Add it to the "Add tile" presets in `EditBentoView.tsx`
5. If it needs seeder data, add a sample in `server/src/db/seeder.ts`

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
