// Path: @/shared/modals/ConfirmProvider.tsx
import * as React from "react";
import AppButton from "@/components/ui/AppButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmVariant =
  | "kurumsalmavi"
  | "kirmizi"
  | "sari"
  | "gri"
  | "yesil"
  | "mor"
  | "turuncu"
  | "lacivert";

export type ConfirmOptions = {
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: ConfirmVariant;
};

type ConfirmFn = (opts: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = React.createContext<ConfirmFn | null>(null);

export function useConfirm() {
  const ctx = React.useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within <ConfirmProvider />");
  return ctx;
}

export default function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const resolverRef = React.useRef<((v: boolean) => void) | null>(null);

  const [opts, setOpts] = React.useState<ConfirmOptions>({
    title: "",
    description: "",
    confirmText: "Evet",
    cancelText: "Vazgeç",
    confirmVariant: "kirmizi",
  });

  const resolveAndClose = React.useCallback((value: boolean) => {
    const r = resolverRef.current;
    resolverRef.current = null;
    setOpen(false);
    r?.(value);
  }, []);

  const confirm: ConfirmFn = React.useCallback((next) => {
    setOpts({
      title: next.title,
      description: next.description,
      confirmText: next.confirmText ?? "Evet",
      cancelText: next.cancelText ?? "Vazgeç",
      confirmVariant: next.confirmVariant ?? "kirmizi",
    });

    setOpen(true);

    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <Dialog
        open={open}
        onOpenChange={(v) => {
          // ESC / overlay click gibi kapanmalarda "false" resolve et
          if (!v) resolveAndClose(false);
          else setOpen(true);
        }}
      >
        <DialogContent className="w-[94vw] max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{opts.title}</DialogTitle>
            {opts.description ? (
              <DialogDescription>{opts.description}</DialogDescription>
            ) : null}
          </DialogHeader>

          <DialogFooter className="flex justify-end gap-3">
            <AppButton variant="kurumsalmavi" type="button" onClick={() => resolveAndClose(false)}>
              {opts.cancelText ?? "Vazgeç"}
            </AppButton>

            <AppButton
              variant={opts.confirmVariant ?? "kirmizi"}
              type="button"
              onClick={() => resolveAndClose(true)}
            >
              {opts.confirmText ?? "Evet"}
            </AppButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}
