import { forwardRef, useId, useImperativeHandle, useRef, type FormEvent, type InputHTMLAttributes, type KeyboardEvent } from 'react';
import { cx } from '../../utils/cx';
import { useControllableState } from '../../utils/useControllableState';
import { Icon } from '../Icon/Icon';

export interface SearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'defaultValue' | 'onChange'> {
  /** Accessible label. Visually hidden by default because the icon + placeholder make purpose clear. */
  label?: string;
  showLabel?: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Called on Enter / submit. */
  onSearch?: (value: string) => void;
  onClear?: () => void;
  size?: 'sm' | 'md' | 'lg';
  /** Shows a spinner while results load. */
  loading?: boolean;
  /** Accessible name of the surrounding search landmark. */
  landmarkLabel?: string;
}

export const Search = forwardRef<HTMLInputElement, SearchProps>(function Search(
  {
    label = 'Search',
    showLabel = false,
    value,
    defaultValue = '',
    onValueChange,
    onSearch,
    onClear,
    size = 'md',
    loading = false,
    landmarkLabel,
    placeholder = 'Search…',
    disabled,
    id,
    className,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `ds-search-${autoId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);
  const [query, setQuery] = useControllableState(value, defaultValue, onValueChange);

  const clear = () => {
    setQuery('');
    onClear?.();
    inputRef.current?.focus();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape' && query) {
      e.preventDefault();
      clear();
    }
    onKeyDown?.(e);
  };

  return (
    <form role="search" aria-label={landmarkLabel} className={cx('ds-field', 'ds-search', className)} onSubmit={handleSubmit}>
      <label htmlFor={inputId} className={cx('ds-field__label', !showLabel && 'ds-visually-hidden')}>
        {label}
      </label>
      <div className={cx('ds-control', `ds-control--${size}`, disabled && 'is-disabled')}>
        {loading ? (
          <span className="ds-spinner ds-control__icon" aria-hidden="true" />
        ) : (
          <Icon name="search" className="ds-control__icon" />
        )}
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          className="ds-control__input ds-search__input"
          value={query}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          enterKeyHint="search"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          {...rest}
        />
        {query && !disabled && (
          <button type="button" className="ds-control__button ds-focus-ring" aria-label="Clear search" onClick={clear}>
            <Icon name="close" />
          </button>
        )}
      </div>
    </form>
  );
});
