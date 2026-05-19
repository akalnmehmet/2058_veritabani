// Path: @/scenes/musteriler/DialogMusteriEkle.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import AppButton from "@/components/ui/AppButton";

const DialogMusteriEkle = ({ onSave, children }) => {
  const [yeniMusteri, setYeniMusteri] = useState({
    company_name: '',
    name: '',
    phone: '',
    city: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setYeniMusteri(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = () => {
    const musteriToSave = {
      company_name: yeniMusteri.company_name,
      name:         yeniMusteri.name,
      phone:        yeniMusteri.phone,
      city:         yeniMusteri.city
    };
    onSave(musteriToSave);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <AppButton
            variant="kurumsalmavi"
            size="mdtxtlg"
            shape="xl"
            className="ml-auto w-full sm:w-40 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
            title="Yeni müşteri ekle"
          >
            <span className="flex items-center gap-2 justify-center w-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
              Müşteri Ekle
            </span>
          </AppButton>
        )}
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg bg-card text-foreground border border-border/50 rounded-2xl shadow-xl backdrop-blur-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Yeni Müşteri Ekle</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-4 text-sm">
          <div className="flex flex-col gap-1">
            <label className="font-semibold text-xs sm:text-sm text-muted-foreground ml-1">
              Şirket İsmi
            </label>
            <input
              name="company_name"
              value={yeniMusteri.company_name}
              onChange={handleChange}
              placeholder="Şirket İsmi"
              className="w-full px-4 py-2.5 bg-background border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-xs sm:text-sm text-muted-foreground ml-1">
              İsim
            </label>
            <input
              name="name"
              value={yeniMusteri.name}
              onChange={handleChange}
              placeholder="İsim"
              className="w-full px-4 py-2.5 bg-background border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-xs sm:text-sm text-muted-foreground ml-1">
              Telefon
            </label>
            <input
              name="phone"
              value={yeniMusteri.phone}
              onChange={handleChange}
              placeholder="Telefon"
              className="w-full px-4 py-2.5 bg-background border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-semibold text-xs sm:text-sm text-muted-foreground ml-1">
              Şehir
            </label>
            <input
              name="city"
              value={yeniMusteri.city}
              onChange={handleChange}
              placeholder="Şehir"
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
              onClick={handleSaveClick}
              variant="kurumsalmavi"
              size="md"
              shape="md"
              className="px-6 shadow-sm hover:shadow-md transition-shadow"
              title="Kaydet ve kapat"
            >
              Kaydet
            </AppButton>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogMusteriEkle;
