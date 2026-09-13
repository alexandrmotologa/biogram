import initSqlJs, { Database as SqlJsDatabase } from "sql.js";
import path from "path";
import fs from "fs";

const DATA_DIR = process.env.NODE_ENV === "production" ? "/data" : path.join(__dirname, "..", "..", "data");
const DB_PATH = path.join(DATA_DIR, "biogram.db");

let db: SqlJsDatabase | null = null;

/**
 * Initializes the database. Must be called once at startup before any queries.
 */
export async function initDb(): Promise<void> {
  if (db) return;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const SQL = await initSqlJs();

  // Load existing database or create new one
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  initSchema();
  saveDb(); // Persist the schema
}

export function getDb(): SqlJsDatabase {
  if (!db) {
    throw new Error("Database not initialized. Call initDb() first.");
  }
  return db;
}

/**
 * Saves the database to disk. Call after write operations.
 */
export function saveDb(): void {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function initSchema(): void {
  if (!db) return;

  db.run(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      telegram_user_id INTEGER UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      bio TEXT,
      avatar_url TEXT,
      theme TEXT DEFAULT 'obsidian',
      created_at INTEGER NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS bento_tiles (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      order_index INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT,
      url TEXT,
      col_span INTEGER DEFAULT 1,
      row_span INTEGER DEFAULT 1,
      meta_json TEXT,
      FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS click_events (
      id TEXT PRIMARY KEY,
      tile_id TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS profile_views (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )
  `);
}

// Profile operations

export interface Profile {
  id: string;
  telegram_user_id: number;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  theme: string;
  created_at: number;
}

export interface BentoTile {
  id: string;
  profile_id: string;
  order_index: number;
  type: string;
  title: string;
  subtitle: string | null;
  url: string | null;
  col_span: number;
  row_span: number;
  meta_json: string | null;
}

function rowToProfile(row: unknown[]): Profile {
  return {
    id: row[0] as string,
    telegram_user_id: row[1] as number,
    username: row[2] as string,
    display_name: row[3] as string,
    bio: row[4] as string | null,
    avatar_url: row[5] as string | null,
    theme: row[6] as string,
    created_at: row[7] as number,
  };
}

function rowToTile(row: unknown[]): BentoTile {
  return {
    id: row[0] as string,
    profile_id: row[1] as string,
    order_index: row[2] as number,
    type: row[3] as string,
    title: row[4] as string,
    subtitle: row[5] as string | null,
    url: row[6] as string | null,
    col_span: row[7] as number,
    row_span: row[8] as number,
    meta_json: row[9] as string | null,
  };
}

export function getProfileByUsername(username: string): Profile | undefined {
  const d = getDb();
  const stmt = d.prepare("SELECT * FROM profiles WHERE username = ?");
  stmt.bind([username]);
  if (stmt.step()) {
    const row = stmt.get();
    stmt.free();
    return rowToProfile(row);
  }
  stmt.free();
  return undefined;
}

export function getProfileByTelegramId(telegramUserId: number): Profile | undefined {
  const d = getDb();
  const stmt = d.prepare("SELECT * FROM profiles WHERE telegram_user_id = ?");
  stmt.bind([telegramUserId]);
  if (stmt.step()) {
    const row = stmt.get();
    stmt.free();
    return rowToProfile(row);
  }
  stmt.free();
  return undefined;
}

export function createProfile(profile: Profile): void {
  const d = getDb();
  d.run(
    `INSERT INTO profiles (id, telegram_user_id, username, display_name, bio, avatar_url, theme, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [profile.id, profile.telegram_user_id, profile.username, profile.display_name, profile.bio, profile.avatar_url, profile.theme, profile.created_at]
  );
  saveDb();
}

export function updateProfile(profileId: string, updates: Partial<Pick<Profile, "display_name" | "bio" | "avatar_url" | "theme">>): void {
  const d = getDb();
  const fields: string[] = [];
  const values: (string | null)[] = [];

  if (updates.display_name !== undefined) { fields.push("display_name = ?"); values.push(updates.display_name); }
  if (updates.bio !== undefined) { fields.push("bio = ?"); values.push(updates.bio); }
  if (updates.avatar_url !== undefined) { fields.push("avatar_url = ?"); values.push(updates.avatar_url); }
  if (updates.theme !== undefined) { fields.push("theme = ?"); values.push(updates.theme); }

  if (fields.length === 0) return;

  values.push(profileId);
  d.run(`UPDATE profiles SET ${fields.join(", ")} WHERE id = ?`, values);
  saveDb();
}

// Tile operations

export function getTilesByProfileId(profileId: string): BentoTile[] {
  const d = getDb();
  const tiles: BentoTile[] = [];
  const stmt = d.prepare("SELECT * FROM bento_tiles WHERE profile_id = ? ORDER BY order_index ASC");
  stmt.bind([profileId]);
  while (stmt.step()) {
    tiles.push(rowToTile(stmt.get()));
  }
  stmt.free();
  return tiles;
}

export function createTile(tile: BentoTile): void {
  const d = getDb();
  d.run(
    `INSERT INTO bento_tiles (id, profile_id, order_index, type, title, subtitle, url, col_span, row_span, meta_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [tile.id, tile.profile_id, tile.order_index, tile.type, tile.title, tile.subtitle, tile.url, tile.col_span, tile.row_span, tile.meta_json]
  );
  saveDb();
}

export function deleteTile(tileId: string, profileId: string): boolean {
  const d = getDb();
  const before = d.getRowsModified();
  d.run("DELETE FROM bento_tiles WHERE id = ? AND profile_id = ?", [tileId, profileId]);
  const after = d.getRowsModified();
  if (after > 0) {
    saveDb();
    return true;
  }
  return false;
}

export function reorderTiles(profileId: string, tileIds: string[]): void {
  const d = getDb();
  tileIds.forEach((id, index) => {
    d.run("UPDATE bento_tiles SET order_index = ? WHERE id = ? AND profile_id = ?", [index, id, profileId]);
  });
  saveDb();
}

// Click analytics

export function recordClick(id: string, tileId: string): void {
  const d = getDb();
  d.run("INSERT INTO click_events (id, tile_id, created_at) VALUES (?, ?, ?)", [id, tileId, Math.floor(Date.now() / 1000)]);
  saveDb();
}

export function recordProfileView(id: string, profileId: string): void {
  const d = getDb();
  d.run("INSERT INTO profile_views (id, profile_id, created_at) VALUES (?, ?, ?)", [id, profileId, Math.floor(Date.now() / 1000)]);
  saveDb();
}

export interface TileClickStat {
  tile_id: string;
  title: string;
  type: string;
  clicks: number;
}

export function getClickStats(profileId: string): TileClickStat[] {
  const d = getDb();
  const stats: TileClickStat[] = [];
  const stmt = d.prepare(`
    SELECT bt.id as tile_id, bt.title, bt.type, COUNT(ce.id) as clicks
    FROM bento_tiles bt
    LEFT JOIN click_events ce ON bt.id = ce.tile_id
    WHERE bt.profile_id = ?
    GROUP BY bt.id
    ORDER BY clicks DESC
  `);
  stmt.bind([profileId]);
  while (stmt.step()) {
    const row = stmt.get();
    stats.push({
      tile_id: row[0] as string,
      title: row[1] as string,
      type: row[2] as string,
      clicks: row[3] as number,
    });
  }
  stmt.free();
  return stats;
}

export function getProfileViewCount(profileId: string): number {
  const d = getDb();
  const stmt = d.prepare("SELECT COUNT(*) as count FROM profile_views WHERE profile_id = ?");
  stmt.bind([profileId]);
  if (stmt.step()) {
    const row = stmt.get();
    stmt.free();
    return row[0] as number;
  }
  stmt.free();
  return 0;
}

export function closeDb(): void {
  if (db) {
    saveDb();
    db.close();
    db = null;
  }
}
