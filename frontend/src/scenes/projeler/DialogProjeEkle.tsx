// Path: @/scenes/projeler/DialogProjeEkle.tsx
import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import AppButton from "@/components/ui/AppButton";

const initialForm = { project_name: "" };

const DialogProjeEkle = ({ onSave }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const resetForm = useCallback(() => setForm(initialForm), []);

  const handleOpenChange = (next) => {
    setOpen(next);
    if (!next) resetForm(); // modal kapandığında her durumda sıfırla
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const name = form.project_name.trim();
    if (!name) return; // boş/whitespace engelle
    await onSave?.({ project_name: name });
    setOpen(false); // kapanınca reset tetiklenecek
  };

  const submitOnEnter = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  const canSave = form.project_name.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <AppButton
          variant="kurumsalmavi"
          size="mdtxtlg"
          shape="xl"
          // ✅ Musteriler tarzı responsive:
          // mobilde full genişlik, sm+ da eski sabit genişlik
          className="w-full sm:w-40 sm:ml-auto shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
        >
          <span className="flex items-center gap-2 justify-center w-full">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Proje Ekle
          </span>
        </AppButton>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-card text-foreground border border-border/50 rounded-2xl shadow-xl backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Yeni Proje Ekle</DialogTitle>
        </DialogHeader>

        <div className="grid gap-2 py-4">
          <label htmlFor="project_name" className="text-sm font-medium text-muted-foreground ml-1">
            Proje Adı
          </label>
          <input
            id="project_name"
            name="project_name"
            value={form.project_name}
            onChange={handleChange}
            onKeyDown={submitOnEnter}
            placeholder="Projenize akılda kalıcı bir isim verin..."
            className="w-full px-4 py-3 bg-background border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            autoFocus
          />
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <DialogClose asChild>
            <AppButton variant="gri" shape="md" className="px-6" title="İptal et">
              Vazgeç
            </AppButton>
          </DialogClose>
          <AppButton
            variant="kurumsalmavi"
            shape="md"
            className="px-6 shadow-sm hover:shadow-md transition-shadow"
            onClick={handleSave}
            disabled={!canSave}
            title="Projeyi kaydet"
          >
            Kaydet
          </AppButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogProjeEkle;
