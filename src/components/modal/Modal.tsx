import { X } from "lucide-react";
import {
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  forwardRef,
  useId,
} from "react";
import { ModalContext, ModalContextType } from "./ModalContext";

export const Modal: FC<PropsWithChildren<Omit<ModalContextType, "id">>> = ({
  children,
  onEscapeClose = true,
  onBackdropClose = true,
  open,
  onOpenChange,
}) => {
  const dialogId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current!;

    if (open) {
      dialog.showModal();
      requestAnimationFrame(() => {
        dialog.dataset.open = "";
        delete dialog.dataset.closing;
      });

      const handleEscape = (e: KeyboardEvent) => {
        e.preventDefault();

        if (!onEscapeClose) return;
        if (e.key !== "Escape") return;
        onOpenChange(false);
      };

      dialog.addEventListener("keydown", handleEscape);
      return () => void dialog.removeEventListener("keydown", handleEscape);
    } else {
      dialog.dataset.closing = "";
      delete dialog.dataset.open;

      const backdrop = dialog.firstElementChild as HTMLElement;
      const content = backdrop?.firstElementChild as HTMLElement;

      let transitionsComplete = 0;

      const handleTransitionEnd = () => {
        // Increment counter to track when both backdrop and content transitions are complete
        transitionsComplete++;

        // If both transitions are completee the dialog
        if (transitionsComplete >= 2) {
          dialog.close();
          backdrop?.removeEventListener("transitionend", handleTransitionEnd);
          content?.removeEventListener("transitionend", handleTransitionEnd);
        }
      };

      backdrop?.addEventListener("transitionend", handleTransitionEnd);
      content?.addEventListener("transitionend", handleTransitionEnd);

      return () => {
        backdrop.removeEventListener("transitionend", handleTransitionEnd);
        content?.removeEventListener("transitionend", handleTransitionEnd);
      };
    }
  }, [onEscapeClose, onOpenChange, open]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onBackdropClose) return;
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  return (
    <ModalContext.Provider value={{ id: dialogId, open, onOpenChange }}>
      <dialog id={dialogId} ref={dialogRef} className="group">
        <div className="fixed w-full h-full overflow-y inset-0 grid place-content-center bg-black/30 backdrop-blur-sm opacity-0 transition-all duration-300 ease-in-out group-data-[open]:opacity-100 group-data-[closing]:opacity-0">
          <div
            className="overflow-y-auto w-screen h-screen place-content-center scale-75 py-10 opacity-0 shadow-lg transition-all duration-300 ease-out group-data-[open]:scale-100 group-data-[open]:opacity-100 group-data-[closing]:scale-75 group-data-[closing]:opacity-0"
            onClick={handleBackdropClick}
          >
            {children}
          </div>
        </div>
      </dialog>
    </ModalContext.Provider>
  );
};

type ModalContentProps = PropsWithChildren<{
  className?: string;
  showCloseButton?: boolean;
}>;

export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  function ModalContent({ children, className, showCloseButton = true }, ref) {
    const { onOpenChange } = useContext(ModalContext);
    return (
      <div
        ref={ref}
        className={[
          "relative m-auto rounded-lg bg-base-100 text-base-content min-w-96 p-4 space-y-4",
          className,
        ].join(" ")}
      >
        {children}
        {showCloseButton && (
          <button
            className="absolute top-2.5 right-4 text-base-content opacity-50 hover:opacity-100 transition-opacity duration-300"
            onClick={() => onOpenChange(false)}
          >
            <span className="sr-only">Close</span>
            <X className="size-4" />
          </button>
        )}
      </div>
    );
  },
);
