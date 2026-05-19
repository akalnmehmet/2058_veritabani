// Path: @/scenes/sistemler/DialogSistemEkle.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from "react-redux";
import {
  AddOrUpdateSystemImageFromApi,
  getSystemImageFromApi,
  deleteSystemImageOnApi,
} from "@/redux/actions/actions_sistemler";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import AppButton from "@/components/ui/AppButton";

const DialogSistemEkle = ({ system, onSave }) => {
  const [form, setForm] = useState({ name: '', description: '',photo_url:"string",is_active:true,sort_index:0 });
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dispatch = useDispatch();
  const sysId = system?.id;
  const sysImage = useSelector(s => s.getSystemImageFromApiReducer?.[sysId]);
  const existingUrl = sysImage?.imageUrl;

  useEffect(() => {
    if (system) {
      setForm({ name: system.name, description: system.description || "",photo_url:"string",is_active:true,sort_index:0 });
      if (system.id) dispatch(getSystemImageFromApi(system.id));
    } else {
      setForm({ name: '', description: '',photo_url:"string",is_active:true,sort_index:0 });
    }
    setPhotoFile(null);
  }, [system, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target; 
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const localPreview = useMemo(() => {
    if (!photoFile) return null;
    try { return URL.createObjectURL(photoFile); } catch { return null; }
  }, [photoFile]);

  const handleSave = () => { onSave({ id: system?.id, ...form, photoFile }); };

  const handleUploadNow = async () => {
    if (!sysId || !photoFile) return;
    try {
      setUploading(true);
      await dispatch(AddOrUpdateSystemImageFromApi(sysId, photoFile));
      await dispatch(getSystemImageFromApi(sysId));
      setPhotoFile(null);
    } finally { setUploading(false); }
  };

  const handleDeletePhoto = async () => {
    if (!sysId) return;
    try {
      setDeleting(true);
      await dispatch(deleteSystemImageOnApi(sysId));
      setPhotoFile(null);
    } finally { setDeleting(false); }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {system ? (
          <AppButton size="sm" variant="sari" shape="md" className="shadow-sm hover:shadow-md transition-shadow">Düzenle</AppButton>
        ) : (
          <AppButton
            variant="kurumsalmavi"
            size="sm"
            shape="md"
            className="w-full sm:w-40 h-10 px-4 shadow-sm hover:shadow-md transition-shadow hover:-translate-y-0.5 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Sistem Ekle
          </AppButton>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md bg-card/80 backdrop-blur-2xl text-foreground border border-border/50 rounded-3xl shadow-2xl p-6 sm:p-8">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-bold tracking-tight">{system ? 'Sistem Düzenle' : 'Yeni Sistem Ekle'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">Sistem İsmi</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Örn: Katlanır Cam Sistemi"
              className="w-full px-4 py-2.5 bg-background/50 border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">Açıklama</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Sistem hakkında kısa bir açıklama girin..."
              className="w-full px-4 py-3 bg-background/50 border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm min-h-[80px]"
            />
          </div>

          <div className="mt-2">
            <label className="block mb-2 text-sm text-muted-foreground">Sistem Fotoğraf</label>

            <div className="w-full aspect-video bg-muted/20 rounded flex items-center justify-center overflow-hidden border border-border">
              {(localPreview || existingUrl) ? (
                <img
                  src={localPreview || existingUrl}
                  alt="Önizleme"
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-muted-foreground text-sm">Görsel yok</span>
              )}
            </div>

            {/* ✅ mobilde alt alta dizilsin */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-3">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="file-input file-input-bordered file-input-sm w-full sm:w-auto bg-background/50"
              />

              <AppButton
                size="sm"
                variant="kurumsalmavi"
                shape="md"
                onClick={handleUploadNow}
                disabled={!sysId || !photoFile || uploading}
                title={!sysId ? "Önce sistemi kaydedin" : (!photoFile ? "Önce dosya seçin" : "")}
                className="shadow-sm"
              >
                {uploading ? "Yükleniyor..." : "Yükle"}
              </AppButton>

              <AppButton
                size="sm"
                variant="kirmizi"
                shape="md"
                onClick={handleDeletePhoto}
                disabled={!sysId || deleting}
                title={!sysId ? "Kayıtlı sistemde kullanılabilir" : ""}
                className="shadow-sm"
              >
                {deleting ? "Siliniyor..." : "Sil"}
              </AppButton>
            </div>

            {!sysId && (
              <p className="text-xs text-muted-foreground mt-2">
                * Yeni sistem eklemede fotoğraf, <b>Kaydet</b>’e bastıktan sonra otomatik yüklenecektir.
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <DialogClose asChild>
            <AppButton variant="gri" shape="md" className="px-6 hover:bg-muted" title="İptal et">
              Vazgeç
            </AppButton>
          </DialogClose>
          <DialogClose asChild>
            <AppButton variant="kurumsalmavi" shape="xl" className="px-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all" onClick={handleSave}>
              {system ? 'Güncelle' : 'Kaydet'}
            </AppButton>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogSistemEkle;
