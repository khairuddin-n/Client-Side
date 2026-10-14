import { Search } from 'lucide-react';
import { useId } from 'react';

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Cari data…',
}) {
  const id = useId();
  return (
    <div className="admin-search">
      <label className="sr-only" htmlFor={id}>
        Cari data
      </label>
      <Search size={17} aria-hidden="true" />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
