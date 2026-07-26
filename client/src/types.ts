export interface Item {
  id: number;
  name: string;
  shelfNumber: string | null;
  binNumber: string | null;
  quantity: number;
  unit: string;
}

export interface NewItemInput {
  name: string;
  shelfNumber: string | null;
  binNumber: string | null;
  quantity: number;
  unit: string;
}

export type SortKey = 'name' | 'shelfNumber' | 'binNumber' | 'quantity' | 'unit';

export type SortDirection = 'asc' | 'desc';
