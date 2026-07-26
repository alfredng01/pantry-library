import { useState } from 'react';
import {
  Button,
  Checkbox,
  Divider,
  Group,
  Modal,
  NumberInput,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import type { Item, NewItemInput } from '../types';
import { DuplicateItemError } from '../api/items';

interface ItemsModalProps {
  opened: boolean;
  onClose: () => void;
  items: Item[];
  onAdd: (input: NewItemInput) => Promise<void>;
  onDelete: (ids: number[]) => Promise<void>;
}

const emptyForm = { name: '', shelfNumber: '', binNumber: '', quantity: '', unit: '' };

export function ItemsModal({ opened, onClose, items, onAdd, onDelete }: ItemsModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [form, setForm] = useState(emptyForm);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canAdd =
    form.name.trim() !== '' &&
    (form.shelfNumber.trim() !== '' || form.binNumber.trim() !== '') &&
    form.quantity.trim() !== '';

  function toggleSelected(id: number, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  async function handleAdd() {
    setAdding(true);
    try {
      await onAdd({
        name: form.name.trim(),
        shelfNumber: form.shelfNumber.trim() || null,
        binNumber: form.binNumber.trim() || null,
        quantity: Number(form.quantity) || 0,
        unit: form.unit.trim(),
      });
      setForm(emptyForm);
    } catch (e) {
      if (e instanceof DuplicateItemError) {
        notifications.show({ color: 'red', title: 'Duplicate item', message: 'Item already exists.' });
      } else {
        notifications.show({ color: 'red', title: 'Error', message: 'Could not add item.' });
      }
    } finally {
      setAdding(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await onDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Manage Items" size="lg">
      <Stack gap="md">
        <div>
          <Text fw={600} mb="xs">
            Current items
          </Text>
          <ScrollArea.Autosize mah={260}>
            <Stack gap={4}>
              {items.length === 0 && (
                <Text c="dimmed" size="sm">
                  No items yet.
                </Text>
              )}
              {items.map((item) => (
                <Group key={item.id} gap="sm" wrap="nowrap">
                  <Checkbox
                    checked={selectedIds.has(item.id)}
                    onChange={(e) => toggleSelected(item.id, e.currentTarget.checked)}
                  />
                  <Text size="sm" style={{ flex: 1 }}>
                    {item.name}
                  </Text>
                  <Text size="sm" c="dimmed">
                    Shelf: {item.shelfNumber || '—'} · Bin: {item.binNumber || '—'}
                  </Text>
                </Group>
              ))}
            </Stack>
          </ScrollArea.Autosize>
          <Button
            color="red"
            mt="sm"
            disabled={selectedIds.size === 0}
            loading={deleting}
            onClick={handleDelete}
          >
            Delete Selected
          </Button>
        </div>

        <Divider />

        <div>
          <Text fw={600} mb="xs">
            Add a new item
          </Text>
          <Stack gap="xs">
            <TextInput
              label="Item Name"
              value={form.name}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setForm((f) => ({ ...f, name: value }));
              }}
            />
            <Group grow>
              <TextInput
                label="Shelf Number"
                value={form.shelfNumber}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setForm((f) => ({ ...f, shelfNumber: value }));
                }}
              />
              <TextInput
                label="Bin Number"
                value={form.binNumber}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setForm((f) => ({ ...f, binNumber: value }));
                }}
              />
            </Group>
            <Group grow>
              <NumberInput
                label="Quantity"
                value={form.quantity}
                onChange={(value) => setForm((f) => ({ ...f, quantity: String(value ?? '') }))}
              />
              <TextInput
                label="Unit"
                value={form.unit}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setForm((f) => ({ ...f, unit: value }));
                }}
              />
            </Group>
            <Button color="green" disabled={!canAdd} loading={adding} onClick={handleAdd}>
              Add
            </Button>
          </Stack>
        </div>
      </Stack>
    </Modal>
  );
}
