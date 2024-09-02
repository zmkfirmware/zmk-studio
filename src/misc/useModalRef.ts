import { MutableRefObject, useEffect, useRef } from "react";

export function useModalRef(
  open: boolean,
  onClose?: () => void,
): MutableRefObject<HTMLDialogElement | null> {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (open) {
      if (ref.current && !ref.current?.open) {
        ref.current?.showModal();
      }
    } else {
      ref.current?.close();
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        onClose &&
        open &&
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    const handleEscKey = (event: KeyboardEvent) => {
      if (onClose && event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [open, onClose]);

  return ref;
}
