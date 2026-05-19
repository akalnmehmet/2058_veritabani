// Path: @/scenes/kumandalar/DialogKumandaDuzenle.tsx
import React, { useState, useEffect, useCallback } from 'react';
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

const DialogKumandaDuzenle = ({ kumanda, onSave, children }) => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const resetForm = useCallback(() => setForm(initialForm), []);

  useEffect(() => {
    if (kumanda) {
      setForm({
        kumanda_isim: kumanda.kumanda_isim || '',
        kapasite: Number(kumanda.kapasite) || 0,
        price: Number(kumanda.price) || 0
      });
    }
  }, [kumanda]);

  const handleOpenChange = (next) => {
    setOpen(next);
    if (!next) resetForm(); // modal kapanınca temizle
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value || 0) : value
    }));
  };

  const handleSave = () => {
    if (!kumanda?.id) return;
    onSave({ ...form, id: kumanda.id });
    setOpen(false); // kapanınca resetForm çalışır
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <AppButton variant="sari" size="sm" shape="md" title="Kumandayı düzenle">
            Düzenle
          </AppButton>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Kumanda Düzenle{kumanda?.kumanda_isim ? `: ${kumanda.kumanda_isim}` : ""}
          </DialogTitle>
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

        <DialogClose asChild>
          <AppButton
            onClick={handleSave}
            variant="kurumsalmavi"
            size="md"
            shape="md"
            title="Güncelle ve kapat"
          >
            Güncelle
          </AppButton>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogKumandaDuzenle;
