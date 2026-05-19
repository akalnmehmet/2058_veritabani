// Path: @/shared/modals/ModalProvider.tsx
import * as React from "react";
import { modalRegistry, type ModalType } from "@/shared/modals/modalRegistry";

type OpenModal = <P extends object>(type: ModalType, props?: P) => void;

type ModalContextValue = {
  openModal: OpenModal;
  closeModal: () => void;
  isOpen: boolean;
  activeType: ModalType | null;
};

const ModalContext = React.createContext<ModalContextValue | null>(null);

export function useModal() {
  const ctx = React.useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within <ModalProvider />");
  return ctx;
}

export default function ModalProvider({ children }: { children: React.ReactNode }) {
  const [activeType, setActiveType] = React.useState<ModalType | null>(null);
  const [activeProps, setActiveProps] = React.useState<Record<string, unknown>>({});
  const [isOpen, setIsOpen] = React.useState(false);

  const openModal: OpenModal = React.useCallback((type, props = {}) => {
    setActiveType(type);
    setActiveProps(props as Record<string, unknown>);
    setIsOpen(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  const Active = activeType ? modalRegistry[activeType] : null;

  return (
    <ModalContext.Provider value={{ openModal, closeModal, isOpen, activeType }}>
      {children}

      {Active ? (
        <Active
          open={isOpen}
          onOpenChange={(v: boolean) => {
            setIsOpen(v);
          }}
          {...activeProps}
        />
      ) : null}
    </ModalContext.Provider>
  );
}
