// Path: @/scenes/bayiler/DialogBayiEkle.tsx
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

const DialogBayiEkle = ({ onSave, children }) => {
  const [yeniBayi, setYeniBayi] = useState({
    name: '',
    email: '',
    phone: '',
    owner_name: '',
    city: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setYeniBayi(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = () => {
    const bayiToSave = {
      name:       yeniBayi.name,
      email:      yeniBayi.email,
      phone:      yeniBayi.phone,
      owner_name: yeniBayi.owner_name,
      city:       yeniBayi.city
    };
    onSave(bayiToSave);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <AppButton
            variant="kurumsalmavi"
            size="sm"
            shape="md"
            className="w-full h-10 px-4 sm:w-auto shadow-sm hover:shadow-md transition-shadow flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Bayi Ekle
          </AppButton>
        )}
      </DialogTrigger>

      <DialogContent className="w-[94vw] max-w-lg bg-card/80 backdrop-blur-2xl border-border/50 shadow-2xl rounded-3xl p-6 sm:p-8">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground/90">Yeni Bayi Ekle</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">İsim</label>
            <input
              name="name"
              value={yeniBayi.name}
              onChange={handleChange}
              placeholder="Örn: Akın Alüminyum"
              className="w-full px-4 py-2.5 bg-background/50 border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">E-posta</label>
            <input
              name="email"
              type="email"
              value={yeniBayi.email}
              onChange={handleChange}
              placeholder="Örn: info@akinaluminyum.com"
              className="w-full px-4 py-2.5 bg-background/50 border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">Telefon</label>
            <input
              name="phone"
              value={yeniBayi.phone}
              onChange={handleChange}
              placeholder="Örn: 0555 123 45 67"
              className="w-full px-4 py-2.5 bg-background/50 border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">Sahip</label>
            <input
              name="owner_name"
              value={yeniBayi.owner_name}
              onChange={handleChange}
              placeholder="Örn: Ahmet Akın"
              className="w-full px-4 py-2.5 bg-background/50 border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-muted-foreground ml-1">Şehir</label>
            <input
              name="city"
              value={yeniBayi.city}
              onChange={handleChange}
              placeholder="Örn: İstanbul"
              className="w-full px-4 py-2.5 bg-background/50 border border-border/60 hover:border-border rounded-xl text-sm outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <DialogClose asChild>
            <AppButton
              variant="koyumavi"
              size="md"
              shape="xl"
              onClick={handleSaveClick}
              className="w-full sm:w-auto px-8 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              Kaydet
            </AppButton>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogBayiEkle;
