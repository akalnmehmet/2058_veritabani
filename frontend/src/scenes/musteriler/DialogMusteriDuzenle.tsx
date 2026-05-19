// Path: @/scenes/musteriler/DialogMusteriDuzenle.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import AppButton from "@/components/ui/AppButton";

const DialogMusteriDuzenle = ({ musteri, onSave, children }) => {
  const [guncelMusteri, setGuncelMusteri] = useState({
    company_name: '',
    name: '',
    phone: '',
    city: ''
  });

  useEffect(() => {
    setGuncelMusteri({
      company_name: musteri.company_name || '',
      name:         musteri.name         || '',
      phone:        musteri.phone        || '',
      city:         musteri.city         || ''
    });
  }, [musteri]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGuncelMusteri(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave({ ...guncelMusteri, id: musteri.id });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <AppButton
            variant="sari"
            size="sm"
            shape="md"
            className="shadow-sm hover:shadow-md transition-shadow"
            title="Müşteriyi düzenle"
          >
            Düzenle
          </AppButton>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg bg-card text-foreground border border-border/50 rounded-2xl shadow-xl backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            Müşteri Düzenle: {musteri.name}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-4 text-sm">
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-xs sm:text-sm text-muted-foreground ml-1">
              Şirket İsmi
            </label>
            <input
              name="company_name"
              value={guncelMusteri.company_name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-background border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-xs sm:text-sm text-muted-foreground ml-1">
              İsim
            </label>
            <input
              name="name"
              value={guncelMusteri.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-background border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-xs sm:text-sm text-muted-foreground ml-1">
              Telefon
            </label>
            <input
              name="phone"
              value={guncelMusteri.phone}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-background border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-xs sm:text-sm text-muted-foreground ml-1">
              Şehir
            </label>
            <input
              name="city"
              value={guncelMusteri.city}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-background border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-2">
          <DialogClose asChild>
            <AppButton variant="gri" shape="md" className="px-6" title="İptal et">
              Vazgeç
            </AppButton>
          </DialogClose>
          <DialogClose asChild>
            <AppButton
              onClick={handleSave}
              variant="kurumsalmavi"
              size="md"
              shape="md"
              className="px-6 shadow-sm hover:shadow-md transition-shadow"
              title="Güncelle ve kapat"
            >
              Güncelle
            </AppButton>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogMusteriDuzenle;
