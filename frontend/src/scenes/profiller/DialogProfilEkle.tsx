// Path: @/scenes/profiller/DialogProfilEkle.tsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import AppButton from "@/components/ui/AppButton";

const DialogProfilEkle = ({ onSave, children }) => {
  const [form, setForm] = useState({
    profil_kodu: '',
    profil_isim: '',
    birim_agirlik: 0,
    boy_uzunluk: 0,
    unit_price: 0,
    profil_kesit_fotograf: 'string'
  });

  const handleChange = e => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSave = () => {
    onSave(form);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <AppButton shape="md"
            variant="kurumsalmavi"
            size="mdtxtlg"
            className="w-full sm:w-auto sm:ml-auto"
            title="Yeni profil ekle"
          >
            + Profil Ekle
          </AppButton>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Profil Ekle</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <label>Profil Kodu</label>
          <input
            name="profil_kodu"
            value={form.profil_kodu}
            onChange={handleChange}
            className="input input-bordered"
          />

          <label>Profil Adı</label>
          <input
            name="profil_isim"
            value={form.profil_isim}
            onChange={handleChange}
            className="input input-bordered"
          />

          <label>Birim Ağırlık (kg)</label>
          <input
            type="number"
            name="birim_agirlik"
            value={form.birim_agirlik}
            onChange={handleChange}
            className="input input-bordered"
          />

          <label>Boy Uzunluk (mm)</label>
          <input
            type="number"
            name="boy_uzunluk"
            value={form.boy_uzunluk}
            onChange={handleChange}
            className="input input-bordered"
          />
        </div>

        <DialogClose asChild>
          <AppButton
            onClick={handleSave}
            variant="kurumsalmavi"
            size="md"
            shape="md"
            title="Kaydet ve kapat"
          >
            Kaydet
          </AppButton>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogProfilEkle;
