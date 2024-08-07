import { MutableRefObject, useEffect, useRef } from "react";

export function useModalRef(
  open: boolean
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

  return ref;
}
