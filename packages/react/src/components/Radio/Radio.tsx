import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import { useControllableState } from '../../utils/useControllableState';
import { Icon } from '../Icon/Icon';

interface RadioGroupContextValue {
  name: string;
  value: string;
  disabled?: boolean;
  invalid: boolean;
  onChange: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface RadioOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Group question/label, rendered as a <legend>. Required. */
  legend: ReactNode;
  hideLegend?: boolean;
  /** Shortcut for rendering options; or pass <Radio> children. */
  options?: RadioOption[];
  children?: ReactNode;
  name?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'vertical' | 'horizontal';
  description?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function RadioGroup({
  legend,
  hideLegend = false,
  options,
  children,
  name,
  value,
  defaultValue = '',
  onValueChange,
  orientation = 'vertical',
  description,
  error,
  required,
  disabled,
  className,
}: RadioGroupProps) {
  const autoId = useId();
  const groupName = name ?? `ds-radio-${autoId}`;
  const [current, setCurrent] = useControllableState(value, defaultValue, onValueChange);
  const descId = description ? `${groupName}-desc` : undefined;
  const errId = error ? `${groupName}-err` : undefined;

  return (
    <fieldset
      className={cx('ds-radio-group', `ds-radio-group--${orientation}`, error && 'is-invalid', className)}
      aria-describedby={[descId, errId].filter(Boolean).join(' ') || undefined}
      aria-required={required || undefined}
      aria-invalid={error ? true : undefined}
      disabled={disabled}
    >
      <legend className={cx('ds-field__label', hideLegend && 'ds-visually-hidden')}>
        {legend}
        {required && <span className="ds-field__required" aria-hidden="true">*</span>}
      </legend>
      {description && <p id={descId} className="ds-field__hint">{description}</p>}
      <div className="ds-radio-group__options">
        <RadioGroupContext.Provider
          value={{ name: groupName, value: current, disabled, invalid: Boolean(error), onChange: setCurrent }}
        >
          {options?.map((o) => (
            <Radio key={o.value} value={o.value} label={o.label} description={o.description} disabled={o.disabled} />
          ))}
          {children}
        </RadioGroupContext.Provider>
      </div>
      {error && (
        <p id={errId} className="ds-field__error">
          <Icon name="alert-circle" size="sm" />
          {error}
        </p>
      )}
    </fieldset>
  );
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'> {
  value: string;
  label: ReactNode;
  description?: ReactNode;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { value, label, description, disabled, id, className, onChange, ...rest },
  ref,
) {
  const group = useContext(RadioGroupContext);
  const autoId = useId();
  const inputId = id ?? `ds-radio-${autoId}`;
  const descId = description ? `${inputId}-desc` : undefined;
  const isDisabled = disabled || group?.disabled;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    group?.onChange(value);
    onChange?.(e);
  };

  return (
    <div className={cx('ds-radio', isDisabled && 'is-disabled', group?.invalid && 'is-invalid', className)}>
      <span className="ds-radio__control">
        <input
          ref={ref}
          id={inputId}
          type="radio"
          className="ds-radio__input"
          name={group?.name ?? rest.name}
          value={value}
          checked={group ? group.value === value : rest.checked}
          disabled={isDisabled}
          aria-describedby={descId}
          onChange={handleChange}
          {...rest}
        />
        <span className="ds-radio__dot" aria-hidden="true" />
      </span>
      <span className="ds-radio__text">
        <label htmlFor={inputId} className="ds-radio__label">{label}</label>
        {description && <span id={descId} className="ds-field__hint">{description}</span>}
      </span>
    </div>
  );
});
