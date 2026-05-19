// Path: @/scenes/ayarlar/ProfilePhotoSection.tsx
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import AppButton from "@/components/ui/AppButton";
import { CellSpinner } from "./Spinner";
import { useModal } from "@/shared/modals/ModalProvider";
import {
  getProfilePicture,
  updateProfilePicture,
  deleteProfilePicture,
} from "@/redux/actions/actions_profilfoto";

async function toSquareJpegBlob(file: File, size = 512, quality = 0.92): Promise<Blob> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = reject;
    el.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context yok.");

  const sw = img.naturalWidth;
  const sh = img.naturalHeight;
  const s = Math.min(sw, sh);
  const sx = Math.floor((sw - s) / 2);
  const sy = Math.floor((sh - s) / 2);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("blob üretilemedi"))), "image/jpeg", quality);
  });

  return blob;
}

export default function ProfilePhotoSection() {
  const dispatch = useDispatch();
  const { openModal } = useModal();

  const FALLBACK_IMG = "/profilfoto.png";

  const [pfLoading, setPfLoading] = useState(false);
  const [pfDeleting, setPfDeleting] = useState(false);
  const [pfSrc, setPfSrc] = useState<string | null>(null);

  async function loadProfilePhoto() {
    setPfLoading(true);
    try {
      const dataUrl = await getProfilePicture({ cacheBust: true });
      setPfSrc(dataUrl);
    } catch {
      setPfSrc(null);
    } finally {
      setPfLoading(false);
    }
  }

  useEffect(() => {
    loadProfilePhoto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openProfilePhotoModal = () => {
    openModal("image.asset", {
      title: "Profil Fotoğrafı",
      description: "Seçtiğiniz görsel otomatik 512x512 kare olarak hazırlanıp yüklenir.",
      accept: "image/*",
      maxSizeMB: 10,
      recommendedText: "Önerilen: net yüz fotoğrafı (kareye otomatik kırpılır)",
      submitText: "Kaydet",
      fetchUrl: async () => {
        try {
          return await getProfilePicture({ cacheBust: true });
        } catch {
          return null;
        }
      },
      upload: async (file: File) => {
        const blob = await toSquareJpegBlob(file, 512, 0.92);
        await dispatch(updateProfilePicture(blob) as any);
        await loadProfilePhoto();
      },
      remove: async () => {
        await dispatch(deleteProfilePicture() as any);
        setPfSrc(null);
      },
    });
  };

  const handleDelete = async () => {
    try {
      setPfDeleting(true);
      await dispatch(deleteProfilePicture() as any);
      setPfSrc(null);
    } finally {
      setPfDeleting(false);
    }
  };

  return (
    <section className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-sm">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <h2 className="text-base sm:text-lg font-semibold">Profil Fotoğrafı</h2>
        <div className="flex gap-2">
          <AppButton onClick={loadProfilePhoto} disabled={pfLoading} loading={pfLoading} size="md" variant="gri">
            Yenile
          </AppButton>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-sm text-muted-foreground">Mevcut Fotoğraf</span>
          <div className="border border-border rounded-2xl p-3 flex items-center justify-center bg-muted/30 min-h-[140px]">
            {pfLoading ? (
              <CellSpinner />
            ) : (
              <img
                src={pfSrc || FALLBACK_IMG}
                alt="Profil Fotoğrafı"
                className="max-h-64 rounded-full object-cover aspect-square"
              />
            )}
          </div>
          {!pfSrc && !pfLoading && (
            <p className="text-xs text-muted-foreground">Mevcut fotoğraf bulunamadı. Varsayılan görsel gösteriliyor.</p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap gap-2">
            <AppButton
              onClick={openProfilePhotoModal}
              size="md"
              variant="yesil"
              className="w-full sm:w-auto"
            >
              Fotoğrafı Düzenle
            </AppButton>

            <AppButton
              onClick={handleDelete}
              disabled={pfDeleting}
              loading={pfDeleting}
              size="md"
              variant="kirmizi"
              className="w-full sm:w-auto"
            >
              Sil
            </AppButton>
          </div>

          <p className="text-xs text-muted-foreground">
            Not: İstersen sonraki adımda bu modalın içine tekrar “elle crop” da ekleyebiliriz.
          </p>
        </div>
      </div>
    </section>
  );
}
