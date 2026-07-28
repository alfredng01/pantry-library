import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, 'pantry.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL COLLATE NOCASE,
    shelf_number TEXT,
    bin_number TEXT,
    quantity REAL NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  )
`);

const columns = db.prepare('PRAGMA table_info(items)').all() as {
  name: string;
  type: string;
}[];

if (!columns.some((c) => c.name === 'updated_at')) {
  // ALTER TABLE ADD COLUMN only permits a literal constant default;
  // backfill the real timestamp in a separate statement right after.
  db.exec(`ALTER TABLE items ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''`);
  db.exec(`UPDATE items SET updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`);
}

const quantityColumn = columns.find((c) => c.name === 'quantity');
if (quantityColumn && quantityColumn.type.toUpperCase() !== 'REAL') {
  // SQLite has no ALTER COLUMN TYPE; rebuild the table to widen
  // quantity from INTEGER to REAL so fractional amounts can be stored.
  db.exec(`
    BEGIN TRANSACTION;
    ALTER TABLE items RENAME TO items_old;
    CREATE TABLE items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL COLLATE NOCASE,
      shelf_number TEXT,
      bin_number TEXT,
      quantity REAL NOT NULL DEFAULT 0,
      unit TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    INSERT INTO items (id, name, shelf_number, bin_number, quantity, unit, updated_at)
      SELECT id, name, shelf_number, bin_number, quantity, unit, updated_at FROM items_old;
    DROP TABLE items_old;
    COMMIT;
  `);
}
