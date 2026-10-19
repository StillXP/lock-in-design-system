import { forwardRef, useId, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Visible label. */
  label: ReactNode;
  /** Visually hide the label. */
  hideLabel?: boolean;
  /** Options; groups render as <optgroup> on web. */
  options: Array<SelectOption | SelectOptionGroup>;
  /** Empty first option, e.g. "Choose a team". Selected when value is "". */
  placeholder?: string;
  /** Helper text. */
  hint?: ReactNode;
  /** Error message. */
  error?: ReactNode;
  /** Control height. */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Form control for picking one value from a list. Built on the native <select>
 * so it gets platform pickers on mobile and full assistive-tech support.
 * For a menu of actions, use Dropdown instead.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hideLabel = false, options, placeholder, hint, error, size = 'md', required, disabled, id, className, ...rest },
  ref,
) {
  const autoId = useId();
  const selectId = id ?? `ds-select-${autoId}`;
  const hintId = hint ? `${selectId}-hint` : undefined;
  const errId = error ? `${selectId}-err` : undefined;

  const renderOption = (o: SelectOption) => (
    <option key={o.value} value={o.value} disabled={o.disabled}>
      {o.label}
    </option>
  );

  return (
    <div className={cx('ds-field', className)}>
      <label htmlFor={selectId} className={cx('ds-field__label', hideLabel && 'ds-visually-hidden')}>
        {label}
        {required && <span className="ds-field__required" aria-hidden="true">*</span>}
      </label>
      {hint && <p id={hintId} className="ds-field__hint">{hint}</p>}
      <div className={cx('ds-control', 'ds-select', `ds-control--${size}`, error && 'is-invalid', disabled && 'is-disabled')}>
        <select
          ref={ref}
          id={selectId}
          className="ds-control__input ds-select__input"
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, errId].filter(Boolean).join(' ') || undefined}
          {...rest}
        >
          {placeholder !== undefined && (
            <option value="" disabled={required}>
              {placeholder}
            </option>
          )}
          {options.map((o) =>
            'options' in o ? (
              <optgroup key={o.label} label={o.label}>
                {o.options.map(renderOption)}
              </optgroup>
            ) : (
              renderOption(o)
            ),
          )}
        </select>
        <Icon name="chevron-down" className="ds-control__icon ds-select__chevron" />
      </div>
      {error && (
        <p id={errId} className="ds-field__error">
          <Icon name="alert-circle" size="sm" />
          {error}
        </p>
      )}
    </div>
  );
});
