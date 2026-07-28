import { Router } from 'express';
import { db } from '../db.js';
import type { Item, ItemInput, ItemUpdate } from '../types.js';

const router = Router();

interface ItemRow {
  id: number;
  name: string;
  shelf_number: string | null;
  bin_number: string | null;
  quantity: number;
  unit: string;
  updated_at: string;
}

function rowToItem(row: ItemRow): Item {
  return {
    id: row.id,
    name: row.name,
    shelfNumber: row.shelf_number,
    binNumber: row.bin_number,
    quantity: row.quantity,
    unit: row.unit,
    updatedAt: row.updated_at,
  };
}

router.get('/', (_req, res) => {
  const rows = db.prepare('SELECT * FROM items ORDER BY id').all() as ItemRow[];
  res.json(rows.map(rowToItem));
});

router.post('/', (req, res) => {
  const body = req.body as ItemInput;
  const name = (body.name ?? '').trim();
  if (!name) {
    res.status(400).json({ error: 'name is required' });
    return;
  }

  const existing = db
    .prepare('SELECT * FROM items WHERE name = ? COLLATE NOCASE')
    .get(name) as ItemRow | undefined;
  if (existing) {
    res.status(409).json({ error: 'Item already exists', item: rowToItem(existing) });
    return;
  }

  const result = db
    .prepare(
      `INSERT INTO items (name, shelf_number, bin_number, quantity, unit, updated_at)
       VALUES (?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`
    )
    .run(
      name,
      body.shelfNumber ?? null,
      body.binNumber ?? null,
      body.quantity ?? 0,
      body.unit ?? ''
    );

  const created = db
    .prepare('SELECT * FROM items WHERE id = ?')
    .get(result.lastInsertRowid) as ItemRow;
  res.status(201).json(rowToItem(created));
});

router.patch('/batch', (req, res) => {
  const updates = (req.body?.items ?? []) as ItemUpdate[];

  const stmt = db.prepare(`
    UPDATE items
    SET
      name = ?,
      shelf_number = ?,
      bin_number = ?,
      quantity = ?,
      unit = ?,
      updated_at = CASE
        WHEN name != ? OR quantity != ? OR unit != ?
          THEN strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
        ELSE updated_at
      END
    WHERE id = ?
  `);

  const applyAll = db.transaction((items: ItemUpdate[]) => {
    for (const item of items) {
      stmt.run(
        item.name,
        item.shelfNumber,
        item.binNumber,
        item.quantity,
        item.unit,
        item.name,
        item.quantity,
        item.unit,
        item.id
      );
    }
  });

  applyAll(updates);

  const rows = db.prepare('SELECT * FROM items ORDER BY id').all() as ItemRow[];
  res.json(rows.map(rowToItem));
});

router.delete('/', (req, res) => {
  const ids = (req.body?.ids ?? []) as number[];
  if (ids.length === 0) {
    res.json({ deleted: 0 });
    return;
  }
  const placeholders = ids.map(() => '?').join(',');
  const result = db.prepare(`DELETE FROM items WHERE id IN (${placeholders})`).run(...ids);
  res.json({ deleted: result.changes });
});

export default router;
