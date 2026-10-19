import { forwardRef, useEffect, useId, useImperativeHandle, useRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Visible label. Always required — use hideLabel to hide it visually (e.g. in table rows). */
  label: ReactNode;
  /** Visually hide the label (e.g. table row selection) while keeping it for screen readers. */
  hideLabel?: boolean;
  /** Supporting text below the label (linked via aria-describedby). */
  description?: ReactNode;
  /** Error message. Sets aria-invalid and is announced with the control. */
  error?: ReactNode;
  /** Mixed state for "select all" parents. */
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, hideLabel = false, description, error, indeterminate = false, disabled, id, className, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `ds-checkbox-${autoId}`;
  const descId = description ? `${inputId}-desc` : undefined;
  const errId = error ? `${inputId}-err` : undefined;
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <div className={cx('ds-checkbox', error && 'is-invalid', disabled && 'is-disabled', className)}>
      <span className="ds-checkbox__control">
        <input
          ref={inputRef}
          id={inputId}
          type="checkbox"
          className="ds-checkbox__input"
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={[descId, errId].filter(Boolean).join(' ') || undefined}
          {...rest}
        />
        <span className="ds-checkbox__box" aria-hidden="true">
          <Icon name="check" size="sm" className="ds-checkbox__check" />
          <Icon name="minus" size="sm" className="ds-checkbox__dash" />
        </span>
      </span>
      <span className={cx('ds-checkbox__text', hideLabel && 'ds-visually-hidden')}>
        <label htmlFor={inputId} className="ds-checkbox__label">
          {label}
        </label>
        {description && (
          <span id={descId} className="ds-field__hint">
            {description}
          </span>
        )}
        {error && (
          <span id={errId} className="ds-field__error">
            <Icon name="alert-circle" size="sm" />
            {error}
          </span>
        )}
      </span>
    </div>
  );
});
