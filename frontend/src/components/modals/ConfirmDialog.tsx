// Path: @/components/modals/ConfirmDialog.tsx
import * as React from "react";
import ModalShell from "@/components/modals/ModalShell";
import AppButton from "@/components/ui/AppButton";

type ConfirmVariant = "danger" | "default";

type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title?: React.ReactNode;
  description?: React.ReactNode;

  confirmText?: string;
  cancelText?: string;

  variant?: ConfirmVariant;
  loading?: boolean;

  /** onConfirm hata fırlatırsa modal açık kalır */
  onConfirm?: () => void | Promise<void>;
};

export default function ConfirmDialog({
  open,
  onOpenChange,
  title = "Emin misiniz?",
  description = "Bu işlem geri alınamaz.",
  confirmText = "Onayla",
  cancelText = "Vazgeç",
  variant = "default",
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm?.();
      onOpenChange(false);
    } catch {
      // hata durumunda modal açık kalsın (istersen toast basarsın)
    }
  };

  const confirmButtonVariant = variant === "danger" ? "kirmizi" : "kurumsalmavi";

  return (
    <ModalShell
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <AppButton
            variant="kurumsalmavi"
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelText}
          </AppButton>

          <AppButton
            variant={confirmButtonVariant}
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            loading={loading}
          >
            {confirmText}
          </AppButton>
        </div>
      }
    >
      <div />
    </ModalShell>
  );
}
