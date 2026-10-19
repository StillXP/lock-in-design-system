import { useEffect, useId, useRef, type ReactNode, type RefObject } from 'react';
import { cx } from '../../utils/cx';
import { Button } from '../Button/Button';

export interface ModalProps {
  /** Whether the modal is shown. The parent owns this state. */
  open: boolean;
  /** Called on Escape, close button, or backdrop click. The parent owns `open`. */
  onClose: () => void;
  /** Dialog title — becomes the accessible name. Required. */
  title: ReactNode;
  /** Optional supporting text, linked via aria-describedby. */
  description?: ReactNode;
  /** Body content (scrolls if long). */
  children?: ReactNode;
  /** Action buttons. Put the primary action last (right-most). */
  footer?: ReactNode;
  /** Width 384 / 512 / 768px or fullscreen. */
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  /** alertdialog for confirmations that interrupt the user (e.g. "Delete team?"). */
  role?: 'dialog' | 'alertdialog';
  /** Close when clicking outside. */
  closeOnBackdropClick?: boolean;
  /** Hide the X button (ensure another way to close). */
  hideCloseButton?: boolean;
  /** Element to focus on open. Defaults to the first focusable element. */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** Accessible name of the X button. */
  closeLabel?: string;
  /** Extra class on the dialog. */
  className?: string;
}

/**
 * Modal dialog built on the native <dialog> element: showModal() makes the rest of
 * the page inert, traps focus, and handles Escape. We add focus return, scroll lock,
 * and a bottom-sheet layout on small screens.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  role = 'dialog',
  closeOnBackdropClick = role === 'dialog',
  hideCloseButton = false,
  initialFocusRef,
  closeLabel = 'Close',
  className,
}: ModalProps) {
  const id = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
      initialFocusRef?.current?.focus();
      document.documentElement.classList.add('ds-scroll-locked');
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialFocusRef]);

  useEffect(
    () => () => {
      document.documentElement.classList.remove('ds-scroll-locked');
    },
    [],
  );

  const handleClosed = () => {
    document.documentElement.classList.remove('ds-scroll-locked');
    returnFocusRef.current?.focus?.();
    if (open) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      role={role === 'alertdialog' ? 'alertdialog' : undefined}
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-desc` : undefined}
      className={cx('ds-modal', `ds-modal--${size}`, className)}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={handleClosed}
      onClick={(e) => {
        if (closeOnBackdropClick && e.target === dialogRef.current) onClose();
      }}
    >
      <div className="ds-modal__content">
        <header className="ds-modal__header">
          <div className="ds-modal__titles">
            <h2 id={`${id}-title`} className="ds-modal__title">{title}</h2>
            {description && <p id={`${id}-desc`} className="ds-modal__description">{description}</p>}
          </div>
          {!hideCloseButton && (
            <Button variant="tertiary" size="sm" iconOnly iconStart="close" aria-label={closeLabel} onClick={onClose} />
          )}
        </header>
        {children && <div className="ds-modal__body">{children}</div>}
        {footer && <footer className="ds-modal__footer">{footer}</footer>}
      </div>
    </dialog>
  );
}
