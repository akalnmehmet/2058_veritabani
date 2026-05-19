// Path: @/scenes/bayiler/DialogBayiDuzenle.tsx
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

const DialogBayiDuzenle = ({ bayi, onSave, children }) => {
  const [guncelBayi, setGuncelBayi] = useState({
    name: '',
    email: '',
    phone: '',
    owner_name: '',
    city: '',
    status: ''
  });

  useEffect(() => {
    setGuncelBayi({
      name:       bayi?.name       || '',
      email:      bayi?.email      || '',
      phone:      bayi?.phone      || '',
      owner_name: bayi?.owner_name || '',
      city:       bayi?.city       || '',
      status:     bayi?.status     || ''
    });
  }, [bayi]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGuncelBayi(prev => ({ ...prev, [name]: value }));
  };

  const handleGuncelle = () => {
    onSave({ ...guncelBayi, id: bayi.id });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <AppButton variant="sari" size="sm">
            Düzenle
          </AppButton>
        )}
      </DialogTrigger>

      <DialogContent className="w-[94vw] max-w-[42rem]">
        <DialogHeader>
          <DialogTitle>Bayi Düzenle: {bayi?.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 sm:gap-4 py-4">
          <label className="font-semibold">İsim</label>
          <input
            name="name"
            value={guncelBayi.name}
            onChange={handleChange}
            className="input input-bordered w-full"
          />

          <label className="font-semibold">E-posta</label>
          <input
            name="email"
            value={guncelBayi.email}
            onChange={handleChange}
            className="input input-bordered w-full"
          />

          <label className="font-semibold">Telefon</label>
          <input
            name="phone"
            value={guncelBayi.phone}
            onChange={handleChange}
            className="input input-bordered w-full"
          />

          <label className="font-semibold">Sahip</label>
          <input
            name="owner_name"
            value={guncelBayi.owner_name}
            onChange={handleChange}
            className="input input-bordered w-full"
          />

          <label className="font-semibold">Şehir</label>
          <input
            name="city"
            value={guncelBayi.city}
            onChange={handleChange}
            className="input input-bordered w-full"
          />

          <label className="font-semibold">Durum</label>
          <select
            name="status"
            value={guncelBayi.status}
            onChange={handleChange}
            className="select select-bordered w-full"
          >
            <option value="">Seçiniz</option>
            <option value="active">Aktif</option>
            <option value="suspended">Askıda</option>
          </select>
        </div>

        <DialogClose asChild>
          <AppButton variant="koyumavi" size="md" onClick={handleGuncelle} className="w-full sm:w-auto">
            Güncelle
          </AppButton>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default DialogBayiDuzenle;
