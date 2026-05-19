// Path: @/scenes/kumandalar/DialogKumandaEkle.tsx
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

const initialForm = {
  kumanda_isim: '',
  kapasite: 0,
  price: 0
};

const DialogKumandaEkle = ({ onSave, children }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const resetForm = useCallback(() => setForm(initialForm), []);

  const handleOpenChange = (next) => {
    setOpen(next);
    if (!next) resetForm();
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value || 0) : value
    }));
  };

  const handleSave = async () => {
    await onSave?.(form);
    setOpen(false); // kapanınca reset
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
            className="w-full sm:w-auto sm:ml-auto"
            title="Yeni kumanda ekle"
          >
            + Kumanda Ekle
          </AppButton>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Kumanda Ekle</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <label>Kumanda İsmi</label>
          <input
            name="kumanda_isim"
            value={form.kumanda_isim}
            onChange={handleChange}
            className="input input-bordered"
          />

          <label>Kapasite</label>
          <input
            type="number"
            name="kapasite"
            value={form.kapasite}
            onChange={handleChange}
            className="input input-bordered"
            min={0}
          />

          <label>Fiyat</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="input input-bordered"
            min={0}
          />
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <DialogClose asChild>
            <AppButton shape="md" variant="gri">Vazgeç</AppButton>
          </DialogClose>
          <AppButton onClick={handleSave} variant="kurumsalmavi" size="md" shape="md" title="Kaydet ve kapat">
            Kaydet
          </AppButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogKumandaEkle;
