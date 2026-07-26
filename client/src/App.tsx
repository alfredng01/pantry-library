import { useState } from 'react';
import { Alert, Button, Container, Group, Loader, Stack, Title } from '@mantine/core';
import { SearchBar } from './components/SearchBar';
import { ItemsTable } from './components/ItemsTable';
import { ItemsModal } from './components/ItemsModal';
import { useItems } from './hooks/useItems';

function App() {
  const { items, loading, syncing, error, isDirty, editCell, addItem, removeItems, syncUpdates } =
    useItems();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpened, setModalOpened] = useState(false);

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Title order={2}>Pantry Library</Title>

        <Group justify="space-between" wrap="wrap">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <Group>
            <Button variant="default" onClick={() => setModalOpened(true)}>
              Add / Remove Item
            </Button>
            <Button color="green" disabled={!isDirty} loading={syncing} onClick={syncUpdates}>
              Update
            </Button>
          </Group>
        </Group>

        {error && (
          <Alert color="red" title="Error loading items">
            {error}
          </Alert>
        )}

        {loading ? (
          <Group justify="center" py="xl">
            <Loader />
          </Group>
        ) : (
          <ItemsTable items={items} searchQuery={searchQuery} onEditCell={editCell} />
        )}
      </Stack>

      <ItemsModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        items={items}
        onAdd={addItem}
        onDelete={removeItems}
      />
    </Container>
  );
}

export default App;
