// Path: @/scenes/boyalar/DialogCamBoyaDuzenle.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTrigger, DialogContent,
  DialogHeader, DialogTitle, DialogClose
} from "@/components/ui/dialog";
import AppButton from '@/components/ui/AppButton';

const DialogCamBoyaDuzenle = ({ color, onSave, children }) => {
  const [form, setForm] = useState({ name: '', unit_cost: 0 });

  useEffect(() => {
    if (color) setForm({ name: color.name, unit_cost: 0 });
  }, [color]);

  const handleChange = e => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSave = () => onSave({ id: color.id, ...form, type: 'glass' });

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ? children : <AppButton shape="md" variant="sari">Düzenle</AppButton>}
      </DialogTrigger>

      <DialogContent className="w-[94vw] max-w-md">
        <DialogHeader>
          <DialogTitle>Cam Boyası Düzenle</DialogTitle>
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

        <DialogClose asChild>
          <AppButton shape="md" variant="kurumsalmavi" onClick={handleSave} className="w-full sm:w-auto">
            Güncelle
          </AppButton>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogCamBoyaDuzenle;
