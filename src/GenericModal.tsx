import React from 'react';

export interface GenericModalProps {
  onClose?: () => void;
  className?: string;
  children: React.ReactNode;
}

export const GenericModal = React.forwardRef(({ onClose, children, className }: GenericModalProps, ref: React.Ref<HTMLDialogElement>) => {
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className={`p-5 rounded-lg bg-base-100 text-base-content backdrop:bg-[rgba(0,0,0,0.5)] ${className}`}
    >
      {children}
    </dialog>
  );
});
