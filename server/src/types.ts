export interface Item {
  id: number;
  name: string;
  shelfNumber: string | null;
  binNumber: string | null;
  quantity: number;
  unit: string;
}

export interface ItemInput {
  name: string;
  shelfNumber?: string | null;
  binNumber?: string | null;
  quantity?: number;
  unit?: string;
}

export type ItemUpdate = Item;
