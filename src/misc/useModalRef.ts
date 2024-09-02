import { MutableRefObject, useEffect, useRef } from "react";

export function useModalRef(
  open: boolean,
  closeOnOutsideClick?: boolean,
): MutableRefObject<HTMLDialogElement | null> {
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (open) {
      if (ref.current && !ref.current?.open) {
        ref.current?.showModal();
      }
      if (closeOnOutsideClick) {
        const handleClickOutside = (e: MouseEvent) => {
          const target = e.target as HTMLDialogElement | null;
          if (!target) return;

          const { top, left, width, height } = target.getBoundingClientRect();
          const clickedInDialog =
            top <= e.clientY &&
            e.clientY <= top + height &&
            left <= e.clientX &&
            e.clientX <= left + width;

          if (!clickedInDialog) {
            target.close();
          }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
      }
    } else {
      ref.current?.close();
    }
  }, [open, closeOnOutsideClick]);

  return ref;
}
