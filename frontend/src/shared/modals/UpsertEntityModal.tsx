// Path: @/shared/modals/UpsertEntityModal.tsx
import React from "react";
import ModalShell from "@/components/modals/ModalShell";
import AppButton from "@/components/ui/AppButton";

type FieldType = "text" | "number" | "select" | "textarea" | "toggle";

export type FieldOption = { label: string; value: string | number };

export type FieldConfig = {
  type: FieldType;
  name: string;
  label: React.ReactNode;

  placeholder?: string;
  required?: boolean;

  min?: number;
  max?: number;
  step?: number;

  options?: FieldOption[]; // select için

  helperText?: React.ReactNode;
  disabled?: boolean;
};

type Errors<T> = Partial<Record<keyof T & string, string>>;

export default function UpsertEntityModal<TValues extends Record<string, any>>({
  open,
  onOpenChange,

  title,
  description,

  initialValues,
  fields,

  validate,
  onSubmit,

  submitText = "Kaydet",
  cancelText = "Vazgeç",

  size = "md",
  contentClassName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title: React.ReactNode;
  description?: React.ReactNode;

  initialValues: TValues;
  fields: FieldConfig[];

  validate?: (values: TValues) => Errors<TValues>;
  onSubmit: (values: TValues) => void | Promise<void>;

  submitText?: string;
  cancelText?: string;

  size?: "sm" | "md" | "lg" | "xl";
  contentClassName?: string;
}) {
  const [values, setValues] = React.useState<TValues>(initialValues);
  const [errors, setErrors] = React.useState<Errors<TValues>>({});
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues, open]);

  const setField = (name: string, raw: any, fieldType: FieldType) => {
    setValues((prev) => {
      const next: any = { ...prev };

      if (fieldType === "number") {
        // boş string gelirse NaN yapmak yerine 0'a çekmiyoruz; validate karar versin
        next[name] = raw === "" ? "" : Number(raw);
        return next;
      }

      if (fieldType === "toggle") {
        next[name] = Boolean(raw);
        return next;
      }

      next[name] = raw;
      return next;
    });
  };

  const runValidate = (nextValues: TValues) => {
    const nextErrors = validate?.(nextValues) ?? {};
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    const ok = runValidate(values);
    if (!ok) return;

    try {
      setSubmitting(true);
      await onSubmit(values);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const fieldError = (name: string) => (errors as any)?.[name] as string | undefined;

  return (
    <ModalShell
      open={open}
      onOpenChange={(v) => {
        if (submitting) return;
        onOpenChange(v);
      }}
      title={title}
      description={description}
      size={size}
      contentClassName={contentClassName}
      footer={
        <div className="flex justify-end gap-3">
          <AppButton
            variant="kurumsalmavi"
            type="button"
            onClick={() => onOpenChange(false)}
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
      <div className="grid gap-4 py-4">
        {fields.map((f) => {
          const err = fieldError(f.name);

          if (f.type === "toggle") {
            return (
              <div key={f.name} className={`grid gap-2 ${f.disabled ? "opacity-60" : ""}`}>
                <label className="text-sm">{f.label}</label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={Boolean(values[f.name])}
                    onChange={(e) => setField(f.name, e.target.checked, f.type)}
                    disabled={f.disabled || submitting}
                  />
                  <span className="text-sm opacity-80">{f.helperText}</span>
                </label>
                {err ? <div className="text-xs text-red-500">{err}</div> : null}
              </div>
            );
          }

          if (f.type === "select") {
            return (
              <div key={f.name} className={`grid gap-2 ${f.disabled ? "opacity-60" : ""}`}>
                <label className="text-sm">{f.label}</label>
                <select
                  className="select select-bordered w-full"
                  value={String(values[f.name] ?? "")}
                  onChange={(e) => setField(f.name, e.target.value, f.type)}
                  disabled={f.disabled || submitting}
                >
                  {(f.options ?? []).map((opt) => (
                    <option key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {f.helperText ? <div className="text-xs opacity-70">{f.helperText}</div> : null}
                {err ? <div className="text-xs text-red-500">{err}</div> : null}
              </div>
            );
          }

          const inputCommon =
            f.type === "textarea"
              ? null
              : (
                <input
                  type={f.type === "number" ? "number" : "text"}
                  className="input input-bordered w-full"
                  value={values[f.name] ?? ""}
                  min={f.min}
                  max={f.max}
                  step={f.step}
                  placeholder={f.placeholder}
                  onChange={(e) => setField(f.name, e.target.value, f.type)}
                  disabled={f.disabled || submitting}
                />
              );

          return (
            <div key={f.name} className={`grid gap-2 ${f.disabled ? "opacity-60" : ""}`}>
              <label className="text-sm">{f.label}</label>

              {f.type === "textarea" ? (
                <textarea
                  className="textarea textarea-bordered w-full"
                  value={values[f.name] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => setField(f.name, e.target.value, f.type)}
                  disabled={f.disabled || submitting}
                />
              ) : (
                inputCommon
              )}

              {f.helperText ? <div className="text-xs opacity-70">{f.helperText}</div> : null}
              {err ? <div className="text-xs text-red-500">{err}</div> : null}
            </div>
          );
        })}
      </div>
    </ModalShell>
  );
}
