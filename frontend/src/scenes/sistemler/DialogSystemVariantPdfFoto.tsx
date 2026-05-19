// Path: @/scenes/sistemler/DialogSystemVariantPdfFoto.tsx
import React from "react";
import { useDispatch } from "react-redux";
import {
  putSystemVariantPdfPhoto,
  getSystemVariantPdfPhoto,
  deleteSystemVariantPdfPhoto,
} from "@/redux/actions/actionsPdf";
import ImageAssetModal from "@/shared/modals/ImageAssetModal";

const DialogSystemVariantPdfFoto = ({ open, onOpenChange, variantId }: any) => {
  const dispatch = useDispatch();

  return (
    <ImageAssetModal
      open={open}
      onOpenChange={onOpenChange}
      title="Varyant Pdf Fotoğraf"
      description="PDF’te kullanılan varyant görselini güncellersiniz."
      accept="image/*"
      recommendedText="Önerilen: şeffaf arka planlı PNG"
      submitText="Yükle"
      fetchUrl={async () => {
        if (!variantId) return null;
        try {
          const url = await dispatch(getSystemVariantPdfPhoto(variantId) as any);
          return url || null;
        } catch {
          return null;
        }
      }}
      upload={async (file: File) => {
        if (!variantId) return;
        await dispatch(putSystemVariantPdfPhoto(variantId, file) as any);
      }}
      remove={async () => {
        if (!variantId) return;
        await dispatch(deleteSystemVariantPdfPhoto(variantId) as any);
      }}
    />
  );
};

export default DialogSystemVariantPdfFoto;
