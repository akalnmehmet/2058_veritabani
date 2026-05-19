// Path: @/scenes/sistemler/DialogVaryantOlustur.tsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { addSystemVariantToApi } from "@/redux/actions/actions_sistemler";
import AppButton from "@/components/ui/AppButton";

const DialogVaryantOlustur = ({ systems = [], onCreated }) => {
  const dispatch = useDispatch();
  const [selectedSystem, setSelectedSystem] = useState("");
  const [variantName, setVariantName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSave = selectedSystem && variantName && !submitting;

  const handleSave = async () => {
    if (!canSave) return;
    try {
      setSubmitting(true);
      const payload = {
        systemId: selectedSystem,
        name: variantName,
        profile_templates: [],
        glass_templates: [],
        material_templates: [],
        remote_templates: [],
      };
      await dispatch(addSystemVariantToApi(payload));
      if (typeof onCreated === 'function') await onCreated();
      setSelectedSystem(""); setVariantName("");
      const closeBtn = document.getElementById('dlg-varyant-close');
      closeBtn?.click();
    } finally { setSubmitting(false); }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <AppButton
          variant="kurumsalmavi"
          size="sm"
          shape="md"
          className="w-full sm:w-40 h-10 px-4 shadow-sm hover:shadow-md transition-shadow hover:-translate-y-0.5 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Varyant Ekle
        </AppButton>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-card/80 backdrop-blur-2xl text-foreground border border-border/50 rounded-3xl shadow-2xl p-6 sm:p-8">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-bold tracking-tight">Yeni Varyant Oluştur</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">Sistem Seç</label>
            <select
              className="w-full px-4 py-2.5 bg-background/50 border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
              value={selectedSystem}
              onChange={(e) => setSelectedSystem(e.target.value)}
            >
              <option value="" disabled>— Bir sistem seçin —</option>
              {systems.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">Varyant Adı</label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-background/50 border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
              placeholder="Örn: Standart, Premium, XL..."
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
            />
          </div>
        </div>

        {/* ✅ Footer mobilde alt alta */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 mt-4">
          <DialogClose asChild>
            <AppButton variant="gri" shape="md" className="w-full sm:w-auto px-6 hover:bg-muted">Vazgeç</AppButton>
          </DialogClose>

          <DialogClose asChild>
            <button id="dlg-varyant-close" className="hidden" />
          </DialogClose>

          <AppButton
            variant="kurumsalmavi"
            shape="xl"
            onClick={handleSave}
            disabled={!canSave}
            className="w-full sm:w-auto px-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            title={!selectedSystem ? "Önce sistem seçin" : (!variantName ? "Varyant adı girin" : "")}
          >
            {submitting ? "Kaydediliyor..." : "Kaydet"}
          </AppButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogVaryantOlustur;
