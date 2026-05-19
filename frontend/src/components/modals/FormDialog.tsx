// Path: @/components/modals/FormDialog.tsx
import * as React from "react";
import ModalShell from "@/components/modals/ModalShell";
import AppButton from "@/components/ui/AppButton";

type FormDialogProps = {
  trigger: React.ReactElement;

  title: React.ReactNode;
  description?: React.ReactNode;

  children: React.ReactNode;

  submitText?: string;
  cancelText?: string;

  /** başarılı olursa modal kapanır; hata fırlatırsa modal açık kalır */
  onSubmit: () => void | Promise<void>;

  size?: "sm" | "md" | "lg" | "xl";
  contentClassName?: string;
};

export default function FormDialog({
  trigger,
  title,
  description,
  children,
  submitText = "Kaydet",
  cancelText = "Vazgeç",
  onSubmit,
  size = "md",
  contentClassName,
}: FormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await onSubmit();
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onOpenChange={(v) => {
        if (submitting) return;
        setOpen(v);
      }}
      trigger={trigger}
      title={title}
      description={description}
      size={size}
      contentClassName={contentClassName}
      footer={
        <div className="flex justify-end gap-3">
          <AppButton
            variant="kurumsalmavi"
            type="button"
            onClick={() => setOpen(false)}
            disabled={submitting}
          >
            {cancelText}
          </AppButton>

          <AppButton
            variant="kurumsalmavi"
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            loading={submitting}
          >
            {submitText}
          </AppButton>
        </div>
      }
    >
      {children}
    </ModalShell>
  );
}
