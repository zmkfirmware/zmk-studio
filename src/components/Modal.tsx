import React, { useEffect, useState } from "react";

export interface ModalProps {
  usedFor: string;
  onClose?: () => void;
  type?: "btn";
  className?: string;
  customWidth?: string;
  modalButton: string | React.ReactNode;
  hideXButton?: boolean;
  hideCloseButton?: boolean;
  children: React.ReactNode;
}

export function Modal({
  onClose,
  children,
  type,
  className = "",
  customWidth,
  hideCloseButton = false,
  hideXButton = false,
  modalButton,
  usedFor,
}: ModalProps) {
  function openModal() {
    document.getElementById(`modal_${usedFor}`).showModal();
    console.log(hideCloseButton, hideXButton);
  }

  return (
    <>
      <span className={`cursor-pointer ${type}`} onClick={() => openModal()}>
        {modalButton}
      </span>
      <dialog
        id={`modal_${usedFor}`}
        className={`modal ${className}`}
        onClose={onClose}
      >
        <div className={`modal-box ${customWidth}`}>
          {children}
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className={`'btn ${hideCloseButton ? "hidden" : ""}'`}>
                Close
              </button>
              <button
                className={`btn btn-sm btn-circle btn-ghost absolute right-2 top-2 ${hideXButton ? "hidden" : ""}`}
              >
                ✕
              </button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  );
}
