// Path: @/components/ConfirmDeleteModal.tsx
import React from "react";
import ConfirmDialog from "@/components/modals/ConfirmDialog";

export default function ConfirmDeleteModal({
  open,
  onOpenChange,
  title = "Silmek istediğinize emin misiniz?",
  description = "Bu işlem geri alınamaz.",
  confirmText = "Evet, sil",
  cancelText = "Vazgeç",
  onConfirm,
  loading = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void | Promise<void>;
  loading?: boolean;
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmText={confirmText}
      cancelText={cancelText}
      onConfirm={onConfirm}
      loading={loading}
      variant="danger"
    />
  );
}
