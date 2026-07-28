import { useEffect, useMemo, useState } from 'react';
import { Group, NumberInput, Pagination, Text } from '@mantine/core';
import type { Item, SortDirection, SortKey } from '../types';
import { EditableCell } from './EditableCell';
import styles from './ItemsTable.module.css';

const DEFAULT_PAGE_SIZE = 20;

interface ItemsTableProps {
  items: Item[];
  searchQuery: string;
  onEditCell: (id: number, field: keyof Item, value: string | number) => void;
}

const COLUMNS: { key: SortKey; label: string; type: 'text' | 'number'; editable: boolean }[] = [
  { key: 'name', label: 'Item Name', type: 'text', editable: true },
  { key: 'shelfNumber', label: 'Shelf Number', type: 'text', editable: true },
  { key: 'binNumber', label: 'Bin Number', type: 'text', editable: true },
  { key: 'quantity', label: 'Quantity', type: 'number', editable: true },
  { key: 'unit', label: 'Unit', type: 'text', editable: true },
  { key: 'updatedAt', label: 'Last Updated', type: 'text', editable: false },
];

function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function compareValues(a: Item, b: Item, key: SortKey): number {
  const av = a[key];
  const bv = b[key];
  if (key === 'quantity') return (av as number) - (bv as number);
  return String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true });
}

export function ItemsTable({ items, searchQuery, onEditCell }: ItemsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

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

  const totalPages = Math.max(1, Math.ceil(visibleItems.length / pageSize));

  useEffect(() => {
    setPage(1);
  }, [searchQuery, pageSize]);

  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const pagedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return visibleItems.slice(start, start + pageSize);
  }, [visibleItems, page, pageSize]);

  function rowClass(item: Item): string {
    if (item.quantity === 0) return styles.rowOut;
    if ((item.quantity <= 1) && (item.quantity > 0)) return styles.rowLow;
    return styles.rowEmpty;
  }

  return (
    <div>
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
          {pagedItems.map((item) => (
            <tr key={item.id} className={rowClass(item)}>
              {COLUMNS.map((col) => (
                <td key={col.key}>
                  {col.editable ? (
                    <EditableCell
                      value={(item[col.key] ?? '') as string | number}
                      type={col.type}
                      onCommit={(value) => onEditCell(item.id, col.key, value)}
                    />
                  ) : (
                    <div>{formatUpdatedAt(item.updatedAt)}</div>
                  )}
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

      {visibleItems.length > 0 && (
        <Group justify="space-between" mt="md" wrap="wrap">
          <Group gap="xs">
            <Text size="sm">Items per page</Text>
            <NumberInput
              value={pageSize}
              onChange={(value) => setPageSize(Math.max(1, Number(value) || DEFAULT_PAGE_SIZE))}
              min={1}
              w={80}
            />
          </Group>
          <Pagination total={totalPages} value={page} onChange={setPage} />
        </Group>
      )}
    </div>
  );
}
