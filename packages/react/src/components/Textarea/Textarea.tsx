import {
  forwardRef,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { cx } from '../../utils/cx';
import { Icon } from '../Icon/Icon';

export interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows' | 'maxLength'> {
  /** Visible label. Required — placeholders are not labels. */
  label: ReactNode;
  /** Visually hide the label (keeps the accessible name). */
  hideLabel?: boolean;
  /** Guidance about what to write, linked with aria-describedby. */
  hint?: ReactNode;
  /** Error message; sets aria-invalid. Say how to fix it. */
  error?: ReactNode;
  /** Visible lines before scrolling (the minimum height when autoGrow is on). */
  rows?: number;
  /** Grow with the content up to maxRows, then scroll. */
  autoGrow?: boolean;
  /** Upper limit for autoGrow. */
  maxRows?: number;
  /** Whether the user can drag to resize. Ignored when autoGrow is on. */
  resize?: 'vertical' | 'none';
  /** Hard character limit. Pair with showCount so people can see it. */
  maxLength?: number;
  /** Show a "86 / 500" counter under the field. Needs maxLength. */
  showCount?: boolean;
  /** Show "(optional)" next to the label instead of marking required fields. */
  showOptional?: boolean;
}

/** Share of maxLength at which the counter warns and announces. */
const NEAR = 0.9;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    label,
    hideLabel = false,
    hint,
    error,
    rows = 3,
    autoGrow = false,
    maxRows = 8,
    resize = 'vertical',
    maxLength,
    showCount = false,
    showOptional = false,
    required,
    disabled,
    id,
    className,
    style,
    value,
    defaultValue,
    onChange,
    ...rest
  },
  forwardedRef,
) {
  const autoId = useId();
  const inputId = id ?? `ds-textarea-${autoId}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const counted = showCount && maxLength !== undefined;
  const countId = counted ? `${inputId}-count` : undefined;
  const errId = error ? `${inputId}-err` : undefined;

  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  const setRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  const [uncontrolledLength, setUncontrolledLength] = useState(() => String(defaultValue ?? '').length);
  const length = value !== undefined ? String(value).length : uncontrolledLength;
  const near = maxLength !== undefined && length >= maxLength * NEAR;
  const atLimit = maxLength !== undefined && length >= maxLength;

  // Announce once when crossing into "near" and once at the limit, never on every keystroke.
  const [announcement, setAnnouncement] = useState('');
  const lastBucket = useRef<'near' | 'limit' | null>(null);
  useLayoutEffect(() => {
    if (maxLength === undefined) return;
    const bucket = atLimit ? 'limit' : near ? 'near' : null;
    if (bucket && bucket !== lastBucket.current) {
      setAnnouncement(bucket === 'limit' ? 'Character limit reached' : `${maxLength - length} characters left`);
    }
    lastBucket.current = bucket;
  }, [atLimit, near, length, maxLength]);

  // Auto-grow: size to content between rows and maxRows.
  const [capped, setCapped] = useState(false);
  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!autoGrow || !el) return;
    el.style.height = 'auto';
    const max = parseFloat(getComputedStyle(el).maxHeight);
    const next = Number.isFinite(max) ? Math.min(el.scrollHeight, max) : el.scrollHeight;
    el.style.height = `${next}px`;
    setCapped(Number.isFinite(max) && el.scrollHeight > max);
  }, [autoGrow, value, length, rows, maxRows]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (value === undefined) setUncontrolledLength(event.target.value.length);
    onChange?.(event);
  };

  // Height in lines of the field's own font (body.md): rows sets the minimum, maxRows caps autoGrow.
  const lines = (n: number) => `calc(${n} * var(--ds-font-line-height-normal) * 1em)`;
  const heights: CSSProperties = { minHeight: lines(rows), maxHeight: autoGrow ? lines(maxRows) : undefined };

  return (
    <div className={cx('ds-field', 'ds-textarea', className)} style={style}>
      <label htmlFor={inputId} className={cx('ds-field__label', hideLabel && 'ds-visually-hidden')}>
        {label}
        {required && <span className="ds-field__required" aria-hidden="true">*</span>}
        {showOptional && !required && <span className="ds-field__optional">(optional)</span>}
      </label>
      {hint && <p id={hintId} className="ds-field__hint">{hint}</p>}
      <div className={cx('ds-control', error && 'is-invalid', disabled && 'is-disabled')}>
        <textarea
          ref={setRef}
          id={inputId}
          rows={rows}
          maxLength={maxLength}
          className={cx(
            'ds-textarea__input',
            (resize === 'none' || autoGrow) && 'ds-textarea__input--no-resize',
            autoGrow && 'ds-textarea__input--auto-grow',
            capped && 'is-capped',
          )}
          style={heights}
          required={required}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, countId, errId].filter(Boolean).join(' ') || undefined}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          {...rest}
        />
      </div>
      {(error || counted) && (
        <div className="ds-textarea__footer">
          {error && (
            <p id={errId} className="ds-field__error">
              <Icon name="alert-circle" size="sm" />
              {error}
            </p>
          )}
          {counted && (
            <p id={countId} className={cx('ds-textarea__count', near && 'is-near')}>
              {length} / {maxLength}
            </p>
          )}
        </div>
      )}
      {maxLength !== undefined && (
        <span className="ds-visually-hidden" aria-live="polite">
          {announcement}
        </span>
      )}
    </div>
  );
});
