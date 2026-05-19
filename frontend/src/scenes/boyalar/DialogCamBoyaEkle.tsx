// Path: @/scenes/boyalar/DialogCamBoyaEkle.tsx
import React, { useState, useCallback } from 'react';
import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogTitle, DialogClose
} from "@/components/ui/dialog";
import AppButton from '@/components/ui/AppButton';

const initialForm = { name: '', unit_cost: 0 };

const DialogCamBoyaEkle = ({ onSave, children }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const resetForm = useCallback(() => setForm(initialForm), []);

  const handleOpenChange = (next) => {
    setOpen(next);
    if (!next) resetForm();
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'number' ? Number(value || 0) : value }));
  };

  const handleSave = async () => {
    await onSave?.({ ...form, type: 'glass' });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <AppButton shape="md"
            variant="kurumsalmavi"
            size="mdtxtlg"
            className="w-full md:w-40 md:ml-auto"
          >
            + Cam Boya Ekle
          </AppButton>
        )}
      </DialogTrigger>

      <DialogContent className="w-[94vw] max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Cam Boyası Ekle</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          <label className="font-semibold">Boya İsmi</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>

        <div className="mt-2 flex flex-col sm:flex-row justify-end gap-2">
          <DialogClose asChild>
            <AppButton shape="md" variant="gri" className="w-full sm:w-auto">Vazgeç</AppButton>
          </DialogClose>
          <AppButton shape="md" variant="kurumsalmavi" onClick={handleSave} className="w-full sm:w-auto">
            Kaydet
          </AppButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogCamBoyaEkle;
