import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Item, NewItemInput } from '../types';
import { batchUpdateItems, createItem, deleteItems as apiDeleteItems, getItems } from '../api/items';

export function useItems() {
  const [serverItems, setServerItems] = useState<Item[]>([]);
  const [localItems, setLocalItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const items = await getItems();
      setServerItems(items);
      setLocalItems(items);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load items');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isDirty = useMemo(
    () => JSON.stringify(localItems) !== JSON.stringify(serverItems),
    [localItems, serverItems]
  );

  const editCell = useCallback((id: number, field: keyof Item, value: string | number) => {
    setLocalItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  }, []);

  const addItem = useCallback(async (input: NewItemInput) => {
    await createItem(input);
    await refresh();
  }, [refresh]);

  const removeItems = useCallback(async (ids: number[]) => {
    await apiDeleteItems(ids);
    await refresh();
  }, [refresh]);

  const syncUpdates = useCallback(async () => {
    const changed = localItems.filter((local) => {
      const server = serverItems.find((s) => s.id === local.id);
      return server && JSON.stringify(server) !== JSON.stringify(local);
    });
    if (changed.length === 0) return;

    setSyncing(true);
    try {
      const updated = await batchUpdateItems(changed);
      setServerItems(updated);
      setLocalItems(updated);
    } finally {
      setSyncing(false);
    }
  }, [localItems, serverItems]);

  return {
    items: localItems,
    loading,
    syncing,
    error,
    isDirty,
    editCell,
    addItem,
    removeItems,
    syncUpdates,
  };
}
