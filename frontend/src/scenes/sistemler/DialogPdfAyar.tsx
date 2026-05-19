// Path: @/scenes/sistemler/DialogPdfAyar.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import AppButton from "@/components/ui/AppButton";

/**
 * Tüm alanların tekil default’u – state bütünlüğü için tüm anahtarları koruyoruz
 */
const DEFAULT_PDF = {
  optimizasyonDetayliCiktisi: true,
  optimizasyonDetaysizCiktisi: true,
  siparisCiktisi: true,          // Üretim Çıktısı
  boyaCiktisi: true,
  profilAksesuarCiktisi: true,
  camCiktisi: true,
};

/**
 * Tek satır checkbox bileşeni
 */
const Row = ({ label, checked, onChange }) => (
  <label className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
    <span className="text-sm text-muted-foreground">{label}</span>
    <input
      type="checkbox"
      className="checkbox checkbox-primary"
      checked={!!checked}
      onChange={(e) => onChange(e.target.checked)}
    />
  </label>
);

/**
 * Section bazlı görünürlük/force kuralları
 * - visible: bu section’da kullanıcıya gösterilecek alanlar
 * - force: bu section’da arka uca zorunlu gönderilecek (state’te de zorlanan) alanlar
 *
 * NOT: “Profiller” section’ında Cam Çıktısı görünmeyecek ve her zaman TRUE gönderilecek – force ile sağlanıyor.
 * Camlar/Diğer Malzemeler/Kumandalar section’larındaki gizlenecek alanlar visible’dan çıkarıldı.
 */
const SECTION_RULES = {
  profile: {
    visible: [
      "optimizasyonDetayliCiktisi",
      "optimizasyonDetaysizCiktisi",
      "siparisCiktisi",
      "boyaCiktisi",
      "profilAksesuarCiktisi",
      // "camCiktisi" — görünmeyecek
    ],
    force: { camCiktisi: true },
  },
  glass: {
    // Camlar: (❌) OptDetaylı, OptDetaysız, Boya, Profil Aksesuar görünmeyecek
    visible: [
      "siparisCiktisi",
      "camCiktisi",
    ],
    force: {},
  },
  material: {
    // Diğer Malzemeler: (❌) OptDetaylı, OptDetaysız, Boya, Cam görünmeyecek
    visible: [
      "siparisCiktisi",
      "profilAksesuarCiktisi",
    ],
    force: {},
  },
  remote: {
    // Kumandalar: (❌) OptDetaylı, OptDetaysız, Boya, Cam görünmeyecek
    visible: [
      "siparisCiktisi",
      "profilAksesuarCiktisi",
    ],
    force: {},
  },
};

/**
 * Etiket haritası – UI metinleri tek yerden yönetilir
 */
const LABELS = {
  optimizasyonDetayliCiktisi: "Optimizasyon Detaylı Çıktısı",
  optimizasyonDetaysizCiktisi: "Optimizasyon Detaysız Çıktısı",
  siparisCiktisi: "Üretim Çıktısı",
  boyaCiktisi: "Boya Çıktısı",
  profilAksesuarCiktisi: "Profil Aksesuar Çıktısı",
  camCiktisi: "Cam Çıktısı",
};

const DialogPdfAyar = ({
  open,
  onOpenChange,
  initial = DEFAULT_PDF,
  onSave,
  title = "PDF Çıktı Ayarları",
  /**
   * section: 'profile' | 'glass' | 'material' | 'remote'
   * SistemVaryantDuzenle içinden set ediliyor – hangi tablo satırından geldiğimizi belirtir.
   */
  section = "profile",
}) => {
  const [form, setForm] = useState({ ...DEFAULT_PDF });

  /**
   * Dialog açıldığında:
   * 1) DEFAULT + initial birleştirilir (tüm anahtarlar garanti)
   * 2) Section RULES.force uygulanır (örn: profile.camCiktisi = true)
   */
  useEffect(() => {
    if (!open) return;
    const merged = { ...DEFAULT_PDF, ...initial };
    const force = SECTION_RULES[section]?.force || {};
    const enforced = { ...merged, ...force };
    setForm(enforced);
  }, [open, initial, section]);

  const setField = (k, v) =>
    setForm((s) => {
      const next = { ...s, [k]: v };
      // “force” alanları kullanıcı değiştiriyor olsa bile anında tekrar zorla
      const force = SECTION_RULES[section]?.force || {};
      return { ...next, ...force };
    });

  const handleOpenChange = (v) => onOpenChange?.(v);

  /**
   * Kaydet:
   * - force alanları bir kez daha uygula (çift emniyet)
   * - tüm alanları (gizli olanlar dahil) geri döndür ki payload tam olsun
   */
  const handleSave = () => {
    const force = SECTION_RULES[section]?.force || {};
    const finalData = { ...form, ...force };
    onSave?.(finalData);
    onOpenChange?.(false);
  };

  // Bu section’da görünecek satırlar (sadece visible listesi)
  const visibleKeys = useMemo(() => SECTION_RULES[section]?.visible || [], [section]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md bg-card text-foreground border border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="mt-2 divide-y divide-border">
          {visibleKeys.map((k) => (
            <Row
              key={k}
              label={LABELS[k]}
              checked={!!form[k]}
              onChange={(v) => setField(k, v)}
            />
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <DialogClose asChild>
            <AppButton size="sm" variant="gri">Vazgeç</AppButton>
          </DialogClose>
          <AppButton size="sm" variant="kurumsalmavi" onClick={handleSave}>Kaydet</AppButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DialogPdfAyar;
