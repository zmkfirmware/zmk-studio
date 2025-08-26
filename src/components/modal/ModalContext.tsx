import React from "react";
import { Dispatch, PropsWithChildren, SetStateAction } from "react";

export type ModalContextType = PropsWithChildren<{
  id: string;
  open: boolean;
  onEscapeClose?: boolean;
  onBackdropClose?: boolean;
  onOpenChange: (open: boolean) => void | Dispatch<SetStateAction<boolean>>;
}>;

export const ModalContext = React.createContext<ModalContextType>(
  {} as ModalContextType,
);
