// Path: @/scenes/diger_malzemeler/modals/DigerMalzemeUpsertModal.tsx
import React from "react";
import UpsertEntityModal, { type FieldConfig } from "@/shared/modals/UpsertEntityModal";

type DigerMalzemeEntity = {
  id: number | string;
  diger_malzeme_isim?: string;
  birim?: string;
  birim_agirlik?: number;
  hesaplama_turu?: "olculu" | "adetli";
  unit_price?: number;
};

type Values = {
  diger_malzeme_isim: string;
  birim: string;
  birim_agirlik: number;
  hesaplama_turu: "olculu" | "adetli";
  unit_price: number;
};

export default function DigerMalzemeUpsertModal({
  open,
  onOpenChange,
  mode,
  item,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  item?: DigerMalzemeEntity;
  onSave: (payload: Values & { id?: number | string }) => void | Promise<void>;
}) {
  const title = mode === "edit" ? "Malzemeyi Düzenle" : "Yeni Malzeme Ekle";
  const submitText = mode === "edit" ? "Güncelle" : "Kaydet";

  const initialValues: Values = {
    diger_malzeme_isim: mode === "edit" ? (item?.diger_malzeme_isim ?? "") : "",
    birim: mode === "edit" ? (item?.birim ?? "") : "",
    birim_agirlik: mode === "edit" ? Number(item?.birim_agirlik ?? 0) : 0,
    hesaplama_turu: mode === "edit" ? (item?.hesaplama_turu ?? "olculu") : "olculu",
    unit_price: mode === "edit" ? Number(item?.unit_price ?? 0) : 0,
  };

  const fields: FieldConfig[] = [
    {
      type: "text",
      name: "diger_malzeme_isim",
      label: "İsim",
      placeholder: "Örn: Fitil",
      required: true,
    },
    {
      type: "text",
      name: "birim",
      label: "Birim",
      placeholder: "Örn: mt",
      required: true,
    },
    {
      type: "number",
      name: "birim_agirlik",
      label: "Birim Ağırlık",
      min: 0,
    },
    {
      type: "number",
      name: "unit_price",
      label: "Birim Fiyat",
      min: 0,
    },
    {
      type: "select",
      name: "hesaplama_turu",
      label: "Hesaplama Türü",
      options: [
        { label: "ölçülü", value: "olculu" },
        { label: "adetli", value: "adetli" },
      ],
      required: true,
    },
  ];

  const validate = (v: Values) => {
    const e: any = {};
    if (!String(v.diger_malzeme_isim ?? "").trim()) e.diger_malzeme_isim = "İsim zorunlu.";
    if (!String(v.birim ?? "").trim()) e.birim = "Birim zorunlu.";
    if (Number(v.birim_agirlik) < 0) e.birim_agirlik = "0 veya daha büyük olmalı.";
    if (Number(v.unit_price) < 0) e.unit_price = "0 veya daha büyük olmalı.";
    if (v.hesaplama_turu !== "olculu" && v.hesaplama_turu !== "adetli") e.hesaplama_turu = "Geçersiz seçim.";
    return e;
  };

  const handleSubmit = async (v: Values) => {
    await onSave({
      ...(mode === "edit" ? { id: item?.id } : {}),
      ...v,
      birim_agirlik: Number(v.birim_agirlik ?? 0),
      unit_price: Number(v.unit_price ?? 0),
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
