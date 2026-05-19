// Path: @/scenes/boyalar/modals/BoyaUpsertModal.tsx
import React from "react";
import UpsertEntityModal, { type FieldConfig } from "@/shared/modals/UpsertEntityModal";

type BoyaKind = "profile" | "glass";

type BoyaEntity = {
  id: number | string;
  name?: string;
};

type Values = {
  name: string;
};

export default function BoyaUpsertModal({
  open,
  onOpenChange,
  mode,
  kind,
  color,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  kind: BoyaKind;
  color?: BoyaEntity;
  onSave: (payload: { id?: number | string; name: string; kind: BoyaKind }) => void | Promise<void>;
}) {
  const title =
    mode === "edit"
      ? `${kind === "profile" ? "Profil Boyası" : "Cam Boyası"} Düzenle`
      : `${kind === "profile" ? "Profil Boyası" : "Cam Boyası"} Ekle`;

  const initialValues: Values = {
    name: mode === "edit" ? (color?.name ?? "") : "",
  };

  const fields: FieldConfig[] = [
    {
      type: "text",
      name: "name",
      label: "Boya İsmi",
      placeholder: "Örn: Antrasit",
      required: true,
    },
  ];

  const validate = (v: Values) => {
    const e: any = {};
    if (!String(v.name ?? "").trim()) e.name = "Boya ismi zorunlu.";
    return e;
    // (ileri adımda zod/rhf’e geçtiğimizde burası standardize olacak)
  };

  const submitText = mode === "edit" ? "Güncelle" : "Kaydet";

  const handleSubmit = async (v: Values) => {
    await onSave({
      ...(mode === "edit" ? { id: color?.id } : {}),
      name: v.name,
      kind,
    });
  };

  return (
    <UpsertEntityModal<Values>
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      initialValues={initialValues}
      fields={fields}
      validate={validate}
      onSubmit={handleSubmit}
      submitText={submitText}
      size="md"
      contentClassName="w-[94vw] max-w-md"
    />
  );
}
