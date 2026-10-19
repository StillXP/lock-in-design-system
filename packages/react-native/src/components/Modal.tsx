import type { ReactNode } from 'react';
import { Sheet } from './Sheet';

export interface ModalProps {
  /** Whether the modal is shown. The parent owns this state. */
  open: boolean;
  /** Called on backdrop press and Android back button. */
  onClose: () => void;
  /** Heading and accessible name. */
  title: string;
  /** Supporting text, linked via aria-describedby. */
  description?: string;
  /** Body content (scrolls if long). */
  children?: ReactNode;
  /** Action buttons; primary last. */
  footer?: ReactNode;
  /** Width 384 / 512 / 768 for a centered (alertdialog) modal, or fullscreen. A dialog docks to the bottom as a sheet at full width, so only fullscreen changes it. */
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  /** alertdialog for urgent confirmations; disables backdrop-click close by default. */
  role?: 'dialog' | 'alertdialog';
  /** Close when clicking outside. */
  closeOnBackdropClick?: boolean;
  /** Hide the X button (ensure another way to close). */
  hideCloseButton?: boolean;
  /** Accessible name of the X button. */
  closeLabel?: string;
}

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
  closeLabel = 'Close',
}: ModalProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={footer}
      closeOnBackdropPress={closeOnBackdropClick}
      placement={role === 'alertdialog' ? 'center' : 'sheet'}
      size={size}
      hideCloseButton={hideCloseButton}
      closeLabel={closeLabel}
    >
      {children}
    </Sheet>
  );
}
