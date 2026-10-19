import { forwardRef, useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { Icon, type IconName } from '../Icon/Icon';

export interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  /** Visible label. Required — placeholders are not labels. */
  label: ReactNode;
  /** Visually hide the label. */
  hideLabel?: boolean;
  /** Helper text shown under the input. */
  hint?: ReactNode;
  /** Error message; sets aria-invalid. Describe how to fix the problem. */
  error?: ReactNode;
  /** Control height. */
  size?: 'sm' | 'md' | 'lg';
  /** Leading decorative icon. */
  iconStart?: IconName;
  /** Trailing content such as a unit ("kg") or currency. */
  suffix?: ReactNode;
  /** Show "(optional)" next to the label instead of marking required fields. */
  showOptional?: boolean;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(function InputField(
  {
    label,
    hideLabel = false,
    hint,
    error,
    size = 'md',
    iconStart,
    suffix,
    showOptional = false,
    type = 'text',
    required,
    disabled,
    id,
    className,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? `ds-input-${autoId}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errId = error ? `${inputId}-err` : undefined;
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={cx('ds-field', className)}>
      <label htmlFor={inputId} className={cx('ds-field__label', hideLabel && 'ds-visually-hidden')}>
        {label}
        {required && <span className="ds-field__required" aria-hidden="true">*</span>}
        {showOptional && !required && <span className="ds-field__optional">(optional)</span>}
      </label>
      {hint && <p id={hintId} className="ds-field__hint">{hint}</p>}
      <div className={cx('ds-control', `ds-control--${size}`, error && 'is-invalid', disabled && 'is-disabled')}>
        {iconStart && <Icon name={iconStart} className="ds-control__icon" />}
        <input
          ref={ref}
          id={inputId}
          type={isPassword && revealed ? 'text' : type}
          className="ds-control__input"
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, errId].filter(Boolean).join(' ') || undefined}
          {...rest}
        />
        {suffix && <span className="ds-input__suffix">{suffix}</span>}
        {isPassword && !disabled && (
          <button
            type="button"
            className="ds-control__button ds-focus-ring"
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
            onClick={() => setRevealed((r) => !r)}
          >
            <Icon name={revealed ? 'eye-off' : 'eye'} />
          </button>
        )}
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
