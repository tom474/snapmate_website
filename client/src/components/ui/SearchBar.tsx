import { Search } from 'lucide-react';
import { FC } from 'react';
import { Input } from './Input';
import { mergeClassNames } from '../../utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onSearch: () => void;
}

const SearchBar: FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder,
  className,
  onSearch,
}) => {
  return (
    <div
      className={mergeClassNames(
        'rounded-full border-2 border-border px-4 flex items-center gap-2 bg-secondary',
        className,
      )}
    >
      <Input
        className="border-none text-base bg-inherit p-0 focus-visible:ring-offset-0 focus-visible:ring-0 focus-visible:outline-none"
        placeholder={placeholder ?? 'Search'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="cursor-pointer" onClick={onSearch}>
        <Search size={20} className="stroke-slate-400 hover:stroke-white" />
      </div>
    </div>
  );
};

export default SearchBar;
