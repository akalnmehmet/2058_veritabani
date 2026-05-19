// Path: @/scenes/teklifler/DialogProjeEkle.tsx
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
    if (!name) return;
    await onSave?.({ project_name: name });
    setOpen(false);
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
          size="sm"
          shape="md"
          className="w-full sm:w-40 h-10 px-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
          Teklif Ekle
        </AppButton>
      </DialogTrigger>

      <DialogContent className="max-w-md bg-card/80 backdrop-blur-2xl text-foreground border border-border/50 rounded-3xl shadow-2xl p-6 sm:p-8">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-bold tracking-tight">Yeni Teklif Ekle</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          <label htmlFor="project_name" className="text-sm font-medium text-muted-foreground ml-1">
            Teklif Adı
          </label>
          <input
            id="project_name"
            name="project_name"
            value={form.project_name}
            onChange={handleChange}
            onKeyDown={submitOnEnter}
            placeholder="Teklifinize akılda kalıcı bir isim verin..."
            className="w-full px-4 py-3 bg-background/50 border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            autoFocus
          />
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <DialogClose asChild>
            <AppButton variant="gri" shape="md" className="px-6 hover:bg-muted" title="İptal et">
              Vazgeç
            </AppButton>
          </DialogClose>
          <AppButton
            variant="kurumsalmavi"
            shape="xl"
            className="px-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            onClick={handleSave}
            disabled={!canSave}
            title="Teklifi kaydet"
          >
            Kaydet
          </AppButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogProjeEkle;
