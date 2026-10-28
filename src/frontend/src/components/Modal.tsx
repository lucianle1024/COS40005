import * as Dialog from '@radix-ui/react-dialog';
import { useRef } from 'react';
import type { ReactNode } from 'react';
import { Icon } from './Icons';

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  wide?: boolean;
}) {
  const opener = useRef<HTMLElement | null>(null);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay" />
        <Dialog.Content
          className={`modal-content ${wide ? 'modal-wide' : ''}`}
          onOpenAutoFocus={() => {
            opener.current =
              document.activeElement instanceof HTMLElement ? document.activeElement : null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            const previous = opener.current;
            const target =
              previous?.isConnected && !previous.matches(':disabled')
                ? previous
                : (document.querySelector<HTMLElement>(
                    'textarea[aria-label="Your reasoning"]:not(:disabled)',
                  ) ?? document.getElementById('workspace'));
            target?.focus();
          }}
        >
          <div className="modal-heading">
            <Dialog.Title>{title}</Dialog.Title>
            <Dialog.Close className="icon-button" aria-label="Close dialog">
              <Icon name="close" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="modal-description">{description}</Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
