// Path: @/scenes/profiller/DialogProfilDuzenle.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import AppButton from "@/components/ui/AppButton";

const DialogProfilDuzenle = ({ profil, onSave, children }) => {
  // 1) Düzenlenen profil alanlarını tutacak state
  const [form, setForm] = useState({
    profil_kodu: '',
    profil_isim: '',
    birim_agirlik: 0,
    boy_uzunluk: 0,
    unit_price: 0,
  });

  // 2) Props değişince formu güncelle
  useEffect(() => {
    if (profil) {
      setForm({
        profil_kodu: profil.profil_kodu || '',
        profil_isim: profil.profil_isim || '',
        birim_agirlik: profil.birim_agirlik || 0,
        boy_uzunluk: profil.boy_uzunluk || 0,
        unit_price: 0,
        profil_kesit_fotograf: profil.profil_kesit_fotograf || 'string',
      });
    }
  }, [profil]);

  const handleChange = e => {
    const { name, value, type } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSave = () => {
    onSave({ ...form, id: profil.id });
  };

  return (
    <Dialog>
      {/* 3) Düzenle butonu (AppButton) */}
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <AppButton variant="sari" size="sm" shape="md" title="Profili düzenle">
            Düzenle
          </AppButton>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Profili Düzenle: {profil.profil_isim}</DialogTitle>
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

        {/* 4) Güncelle (AppButton) */}
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

export default DialogProfilDuzenle;
