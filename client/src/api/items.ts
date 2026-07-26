import type { Item, NewItemInput } from '../types';

const BASE_URL = '/api/items';

export class DuplicateItemError extends Error {
  constructor() {
    super('Item already exists');
    this.name = 'DuplicateItemError';
  }
}

export async function getItems(): Promise<Item[]> {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error(`Failed to load items (${res.status})`);
  return res.json();
}

export async function createItem(input: NewItemInput): Promise<Item> {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (res.status === 409) throw new DuplicateItemError();
  if (!res.ok) throw new Error(`Failed to create item (${res.status})`);
  return res.json();
}

export async function batchUpdateItems(items: Item[]): Promise<Item[]> {
  const res = await fetch(`${BASE_URL}/batch`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  if (!res.ok) throw new Error(`Failed to update items (${res.status})`);
  return res.json();
}

export async function deleteItems(ids: number[]): Promise<void> {
  const res = await fetch(BASE_URL, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  if (!res.ok) throw new Error(`Failed to delete items (${res.status})`);
}
