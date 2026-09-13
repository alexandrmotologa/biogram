# Deployment

## Docker (simplest approach)

Build and run with Docker Compose:

```bash
cp .env.example .env
# Edit .env: set TELEGRAM_BOT_TOKEN to your real token from @BotFather

docker-compose up --build -d
```

The app starts on port 8080. SQLite data persists in a Docker volume called `biogram_data`.

To stop:
```bash
docker-compose down
```

To reset the database (this deletes all profiles):
```bash
docker-compose down -v
```

## Manual deployment

### Prerequisites
- Node.js 20+
- A server with a public IP (if you want the Mini App accessible outside localhost)

### Build steps

```bash
# Build the frontend
cd web
npm install
npm run build
# The built files go to web/dist/

# Build the server
cd ../server
npm install
npm run build
# Compiled JS goes to server/dist/
```

### Run in production

```bash
cd server
NODE_ENV=production TELEGRAM_BOT_TOKEN=your_token PORT=8080 node dist/index.js
```

The server serves the frontend files from `../web/dist/` automatically.

## Getting a bot token

1. Open Telegram and find [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow the prompts
3. Copy the token it gives you
4. To enable the Mini App:
   - Send `/newapp` to BotFather
   - Select your bot
   - Set the Web App URL to wherever you're hosting BioGram (e.g. `https://your-domain.com`)

For local development, you don't need a public URL. Set `DEMO_MODE=true` and the app works without Telegram integration.

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Yes (prod) | `mock_token` | Bot token from BotFather |
| `DEMO_MODE` | No | `false` | Pre-seed a demo profile |
| `PORT` | No | `8080` | HTTP port |
| `NODE_ENV` | No | `development` | Set to `production` for prod |

## Reverse proxy (optional)

If you want to put BioGram behind nginx:

```nginx
server {
    listen 443 ssl;
    server_name biogram.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/biogram.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/biogram.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Data persistence

SQLite stores everything in a single file at `/data/biogram.db` (inside Docker) or `./data/biogram.db` (manual setup). The database runs in WAL mode for better read concurrency.

Back up the file while the server is running. SQLite's WAL mode handles this safely. Just copy `biogram.db`, `biogram.db-wal`, and `biogram.db-shm` together.
