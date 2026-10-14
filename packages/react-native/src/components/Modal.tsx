import type { ReactNode } from 'react';
import { Sheet } from './Sheet';

export interface ModalProps {
  open: boolean;
  /** Called on backdrop press and Android back button. */
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  /** fullscreen is not yet distinct on native; sheets cap at 85% height. */
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  role?: 'dialog' | 'alertdialog';
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
