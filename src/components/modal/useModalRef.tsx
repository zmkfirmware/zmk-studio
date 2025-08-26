import { ModalContext, ModalContextType } from "./ModalContext";
import { useContext } from "react";

export function useModalRef(): ModalContextType {
  return useContext(ModalContext);
}
