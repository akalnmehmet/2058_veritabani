// Path: @/shared/modals/ImageAssetModal.tsx
import * as React from "react";
import ModalShell from "@/components/modals/ModalShell";
import AppButton from "@/components/ui/AppButton";

type UploadResult = void | string | { url?: string };

export default function ImageAssetModal({
  open,
  onOpenChange,

  title = "Görsel",
  description,

  fetchUrl,
  upload,
  remove,

  accept = "image/*",
  maxSizeMB = 10,
  recommendedText = "Önerilen: PNG/JPG",
  submitText = "Yükle",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  title?: React.ReactNode;
  description?: React.ReactNode;

  fetchUrl?: () => Promise<string | null> | string | null;

  upload: (file: File, onProgress?: (p: number) => void) => Promise<UploadResult>;
  remove?: () => Promise<void>;

  accept?: string;
  maxSizeMB?: number;
  recommendedText?: string;
  submitText?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const [currentUrl, setCurrentUrl] = React.useState<string | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const [busy, setBusy] = React.useState(false);
  const [progress, setProgress] = React.useState<number>(0);
  const [error, setError] = React.useState<string | null>(null);

  const resetLocal = React.useCallback(() => {
    setFile(null);
    setProgress(0);
    setError(null);
    setBusy(false);
  }, []);

  React.useEffect(() => {
    if (!open) return;

    let mounted = true;
    (async () => {
      try {
        setError(null);
        if (!fetchUrl) return;
        const v = await fetchUrl();
        if (!mounted) return;
        setCurrentUrl(v || null);
      } catch {
        if (!mounted) return;
        setCurrentUrl(null);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [open, fetchUrl]);

  React.useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const pickFile = () => inputRef.current?.click();

  const validateAndSetFile = (f: File | null) => {
    if (!f) return;
    setError(null);

    const maxBytes = (Number(maxSizeMB) || 10) * 1024 * 1024;
    if (f.size > maxBytes) {
      setError(`Dosya çok büyük. Maksimum ${maxSizeMB}MB.`);
      return;
    }
    setFile(f);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (busy) return;
    const f = e.dataTransfer.files?.[0];
    validateAndSetFile(f || null);
  };

  const onChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    validateAndSetFile(f || null);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setBusy(true);
      setProgress(0);
      setError(null);

      const res = await upload(file, (p) => {
        const n = Math.max(0, Math.min(100, Number(p) || 0));
        setProgress(n);
      });

      if (typeof res === "string") setCurrentUrl(res);
      else if (res && typeof res === "object" && res.url) setCurrentUrl(res.url);
      else if (fetchUrl) setCurrentUrl((await fetchUrl()) || null);

      onOpenChange(false);
      resetLocal();
    } catch {
      setError("Yükleme başarısız.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (!remove) return;
    try {
      setBusy(true);
      setError(null);
      await remove();
      setCurrentUrl(null);
      setFile(null);
      setProgress(0);
    } catch {
      setError("Silme başarısız.");
    } finally {
      setBusy(false);
    }
  };

  const shownUrl = previewUrl || currentUrl;

  return (
    <ModalShell
      open={open}
      onOpenChange={(v) => {
        if (busy) return;
        if (!v) resetLocal();
        onOpenChange(v);
      }}
      title={title}
      description={description}
      size="md"
      contentClassName="w-[94vw] max-w-md"
      footer={
        <div className="flex justify-end gap-3">
          <AppButton variant="kurumsalmavi" type="button" onClick={() => onOpenChange(false)} disabled={busy}>
            Vazgeç
          </AppButton>

          <AppButton
            variant="kurumsalmavi"
            type="button"
            onClick={handleUpload}
            disabled={busy || !file}
            loading={busy}
          >
            {submitText}
          </AppButton>
        </div>
      }
    >
      <div className="grid gap-4">
        {error ? (
          <div className="text-sm p-3 rounded-xl border border-red-500/40 bg-red-500/10">{error}</div>
        ) : null}

        <div
          className="rounded-2xl border border-border bg-muted/20 p-4 grid gap-3"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          <div className="text-sm font-semibold">Görsel seç</div>
          <div className="text-xs opacity-80">
            {recommendedText} · Maks: {maxSizeMB}MB
          </div>

          <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onChangeFile} disabled={busy} />

          <div className="flex gap-2">
            <AppButton variant="kurumsalmavi" type="button" onClick={pickFile} disabled={busy}>
              Dosya seç
            </AppButton>

            {currentUrl && remove ? (
              <AppButton variant="kirmizi" type="button" onClick={handleRemove} disabled={busy}>
                Kaldır
              </AppButton>
            ) : null}
          </div>

          {file ? (
            <div className="text-xs opacity-80 break-all">
              Seçilen: <b>{file.name}</b>
            </div>
          ) : null}

          {busy && progress > 0 ? (
            <div className="grid gap-1">
              <div className="text-xs opacity-80">Yükleniyor: {progress}%</div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-2 bg-primary" style={{ width: `${progress}%` }} />
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-2xl border border-border bg-muted/10 p-3">
          <div className="text-sm font-semibold mb-2">Önizleme</div>
          {shownUrl ? (
            <img
              src={shownUrl}
              alt="preview"
              className="w-full max-h-72 object-contain rounded-xl border border-border bg-background"
            />
          ) : (
            <div className="text-sm opacity-70">Henüz görsel yok.</div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}
