// Path: @/scenes/sistemler/DialogSystemVariantFoto.tsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  postSystemVariantImageToApi,
  getSystemVariantImageFromApi,
  deleteSystemVariantImageFromApi,
} from "@/redux/actions/actions_sistemler";
import ImageAssetModal from "@/shared/modals/ImageAssetModal";

const DialogSystemVariantFoto = ({ open, onOpenChange, variantId }: any) => {
  const dispatch = useDispatch();

  const vimg = useSelector((s: any) => s.getSystemVariantImageFromApiReducer?.[variantId]);
  const existingUrl = vimg?.imageUrl || null;

  useEffect(() => {
    if (open && variantId) {
      dispatch(getSystemVariantImageFromApi(variantId) as any).catch(() => {});
    }
  }, [open, variantId, dispatch]);

  return (
    <ImageAssetModal
      open={open}
      onOpenChange={onOpenChange}
      title="Varyant Fotoğraf"
      description="Seçtiğiniz görsel varyanta atanır."
      accept="image/*"
      recommendedText="Önerilen: yatay (16:9) veya yüksek çözünürlük"
      submitText="Yükle"
      fetchUrl={async () => existingUrl}
      upload={async (file: File) => {
        if (!variantId) return;
        await dispatch(postSystemVariantImageToApi(variantId, file) as any);
        await dispatch(getSystemVariantImageFromApi(variantId) as any);
      }}
      remove={
        existingUrl
          ? async () => {
              if (!variantId) return;
              await dispatch(deleteSystemVariantImageFromApi(variantId) as any);
              await dispatch(getSystemVariantImageFromApi(variantId) as any).catch(() => {});
            }
          : undefined
      }
    />
  );
};

export default DialogSystemVariantFoto;
