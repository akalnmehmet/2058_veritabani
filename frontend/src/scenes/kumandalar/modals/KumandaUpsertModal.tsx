// Path: @/scenes/kumandalar/modals/KumandaUpsertModal.tsx
import React from "react";
import UpsertEntityModal, { type FieldConfig } from "@/shared/modals/UpsertEntityModal";

type KumandaEntity = {
  id: number | string;
  kumanda_isim?: string;
  kapasite?: number;
  price?: number;
};

type Values = {
  kumanda_isim: string;
  kapasite: number;
  price: number;
};

export default function KumandaUpsertModal({
  open,
  onOpenChange,
  mode,
  kumanda,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  kumanda?: KumandaEntity;
  onSave: (payload: Values & { id?: number | string }) => void | Promise<void>;
}) {
  const title =
    mode === "edit"
      ? `Kumanda Düzenle${kumanda?.kumanda_isim ? `: ${kumanda.kumanda_isim}` : ""}`
      : "Yeni Kumanda Ekle";

  const initialValues: Values = {
    kumanda_isim: mode === "edit" ? (kumanda?.kumanda_isim ?? "") : "",
    kapasite: mode === "edit" ? Number(kumanda?.kapasite ?? 0) : 0,
    price: mode === "edit" ? Number(kumanda?.price ?? 0) : 0,
  };

  const fields: FieldConfig[] = [
    {
      type: "text",
      name: "kumanda_isim",
      label: "Kumanda İsmi",
      placeholder: "Örn: 5 Kanallı",
      required: true,
    },
    {
      type: "number",
      name: "kapasite",
      label: "Kapasite",
      min: 0,
    },
    {
      type: "number",
      name: "price",
      label: "Fiyat",
      min: 0,
    },
  ];

  const validate = (v: Values) => {
    const e: any = {};
    if (!String(v.kumanda_isim ?? "").trim()) e.kumanda_isim = "Kumanda ismi zorunlu.";
    if (Number(v.kapasite) < 0) e.kapasite = "0 veya daha büyük olmalı.";
    if (Number(v.price) < 0) e.price = "0 veya daha büyük olmalı.";
    return e;
  };

  const submitText = mode === "edit" ? "Güncelle" : "Kaydet";

  const handleSubmit = async (v: Values) => {
    await onSave({
      ...(mode === "edit" ? { id: kumanda?.id } : {}),
      kumanda_isim: v.kumanda_isim,
      kapasite: Number(v.kapasite ?? 0),
      price: Number(v.price ?? 0),
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
