import { forwardRef, useId, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { useControllableState } from '../../utils/useControllableState';
import { Icon } from '../Icon/Icon';

export interface ToggleProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange' | 'value'> {
  /** Visible label describing what the switch controls. Required. */
  label: ReactNode;
  /** Visually hide the label. */
  hideLabel?: boolean;
  /** Supporting text. */
  description?: ReactNode;
  /** Controlled state. */
  checked?: boolean;
  /** Uncontrolled initial state. */
  defaultChecked?: boolean;
  /** Called with the new state. */
  onCheckedChange?: (checked: boolean) => void;
  /** Switch size. */
  size?: 'sm' | 'md';
  /** Label placement relative to the switch. */
  labelPosition?: 'start' | 'end';
}

/**
 * Switch for settings that take effect immediately. For choices submitted with a
 * form, use Checkbox instead.
 */
export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(function Toggle(
  {
    label,
    hideLabel = false,
    description,
    checked,
    defaultChecked = false,
    onCheckedChange,
    size = 'md',
    labelPosition = 'end',
    disabled,
    id,
    className,
    onClick,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const buttonId = id ?? `ds-toggle-${autoId}`;
  const descId = description ? `${buttonId}-desc` : undefined;
  const [isOn, setIsOn] = useControllableState(checked, defaultChecked, onCheckedChange);

  return (
    <div
      className={cx(
        'ds-toggle',
        `ds-toggle--${size}`,
        labelPosition === 'start' && 'ds-toggle--label-start',
        disabled && 'is-disabled',
        className,
      )}
    >
      <button
        ref={ref}
        id={buttonId}
        type="button"
        role="switch"
        aria-checked={isOn}
        aria-describedby={descId}
        disabled={disabled}
        className="ds-toggle__switch ds-focus-ring"
        onClick={(e) => {
          setIsOn(!isOn);
          onClick?.(e);
        }}
        {...rest}
      >
        <span className="ds-toggle__thumb">
          {/* Non-color state cue (WCAG 1.4.1) */}
          <Icon name={isOn ? 'check' : 'minus'} size={12} />
        </span>
      </button>
      <span className={cx('ds-toggle__text', hideLabel && 'ds-visually-hidden')}>
        <label htmlFor={buttonId} className="ds-toggle__label">{label}</label>
        {description && <span id={descId} className="ds-field__hint">{description}</span>}
      </span>
    </div>
  );
});
