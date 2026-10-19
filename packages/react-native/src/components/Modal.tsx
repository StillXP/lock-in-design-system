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
  /** fullscreen is not yet distinct on native; sheets cap at 85% height. */
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  /** alertdialog for urgent confirmations; disables backdrop-click close by default. */
  role?: 'dialog' | 'alertdialog';
  /** Close when clicking outside. */
  closeOnBackdropClick?: boolean;
}

export function Modal({ open, onClose, title, description, children, footer, role = 'dialog', closeOnBackdropClick = role === 'dialog' }: ModalProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      footer={footer}
      closeOnBackdropPress={closeOnBackdropClick}
      placement={role === 'alertdialog' ? 'center' : 'sheet'}
    >
      {children}
    </Sheet>
  );
}
