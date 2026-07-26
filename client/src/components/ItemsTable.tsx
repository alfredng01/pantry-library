import { useMemo, useState } from 'react';
import type { Item, SortDirection, SortKey } from '../types';
import { EditableCell } from './EditableCell';
import styles from './ItemsTable.module.css';

interface ItemsTableProps {
  items: Item[];
  searchQuery: string;
  onEditCell: (id: number, field: keyof Item, value: string | number) => void;
}

const COLUMNS: { key: SortKey; label: string; type: 'text' | 'number' }[] = [
  { key: 'name', label: 'Item Name', type: 'text' },
  { key: 'shelfNumber', label: 'Shelf Number', type: 'text' },
  { key: 'binNumber', label: 'Bin Number', type: 'text' },
  { key: 'quantity', label: 'Quantity', type: 'number' },
  { key: 'unit', label: 'Unit', type: 'text' },
];

function compareValues(a: Item, b: Item, key: SortKey): number {
  const av = a[key];
  const bv = b[key];
  if (key === 'quantity') return (av as number) - (bv as number);
  return String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true });
}

export function ItemsTable({ items, searchQuery, onEditCell }: ItemsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  }

  const visibleItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? items.filter((item) => item.name.toLowerCase().includes(query))
      : items;

    const sorted = [...filtered].sort((a, b) => {
      const result = compareValues(a, b, sortKey);
      return sortDirection === 'asc' ? result : -result;
    });

    return sorted;
  }, [items, searchQuery, sortKey, sortDirection]);

  function rowClass(item: Item): string {
    if (item.quantity === 0) return styles.rowOut;
    if (item.quantity === 1) return styles.rowLow;
    return styles.rowEmpty;
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {COLUMNS.map((col) => (
            <th key={col.key} onClick={() => toggleSort(col.key)}>
              {col.label}
              {sortKey === col.key && (
                <span className={styles.sortArrow}>{sortDirection === 'asc' ? '▲' : '▼'}</span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {visibleItems.map((item) => (
          <tr key={item.id} className={rowClass(item)}>
            {COLUMNS.map((col) => (
              <td key={col.key}>
                <EditableCell
                  value={(item[col.key] ?? '') as string | number}
                  type={col.type}
                  onCommit={(value) => onEditCell(item.id, col.key, value)}
                />
              </td>
            ))}
          </tr>
        ))}
        {visibleItems.length === 0 && (
          <tr>
            <td colSpan={COLUMNS.length} style={{ textAlign: 'center', opacity: 0.6 }}>
              No items found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
