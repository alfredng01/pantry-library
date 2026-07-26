import { TextInput } from '@mantine/core';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <TextInput
      placeholder="Search items by name..."
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      style={{ flex: 1, maxWidth: 400 }}
    />
  );
}
