// Path: @/shared/modals/modalRegistry.tsx
import type * as React from "react";
import CamUpsertModal from "@/scenes/camlar/modals/CamUpsertModal";
import BoyaUpsertModal from "@/scenes/boyalar/modals/BoyaUpsertModal";
import DigerMalzemeUpsertModal from "@/scenes/diger_malzemeler/modals/DigerMalzemeUpsertModal";
import KumandaUpsertModal from "@/scenes/kumandalar/modals/KumandaUpsertModal";
import ImageAssetModal from "@/shared/modals/ImageAssetModal";

export type ModalType =
  | "cam.upsert"
  | "boya.upsert"
  | "digerMalzeme.upsert"
  | "kumanda.upsert"
  | "image.asset";

export type ModalComponentProps<P = {}> = P & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const modalRegistry: Record<ModalType, React.ComponentType<any>> = {
  "cam.upsert": CamUpsertModal,
  "boya.upsert": BoyaUpsertModal,
  "digerMalzeme.upsert": DigerMalzemeUpsertModal,
  "kumanda.upsert": KumandaUpsertModal,
  "image.asset": ImageAssetModal,
};
