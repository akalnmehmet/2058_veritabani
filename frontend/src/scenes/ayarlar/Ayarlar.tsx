// Path: @/scenes/ayarlar/Ayarlar.tsx
// File: Ayarlar.jsx (ana çatı)
// =============================
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppButton from "@/components/ui/AppButton";
import BrandSection from "./BrandSection";
import TitleSection from "./TitleSection";
import RuleSection from "./RuleSection";
import PasswordSection from "./PasswordSection";
import ProfilePhotoSection from "./ProfilePhotoSection";

import OptimizationSection from "./OptimizationSection";
import UsernameSection from "./UsernameSection";
import { getCalculationHelpers } from "@/redux/actions/actions_calc_helpers";

export default function Ayarlar() {
  const SECTIONS = [
    { id: "brand", label: "PDF Üst Başlık" },
    { id: "title", label: "PDF Başlık Alanları" },
    { id: "rule", label: "Proforma Kuralı" },
    { id: "optimizasyon", label: "Optimizasyon" },     // ✅ yeni
    { id: "username", label: "Kullanıcı Adı" },         // ✅ yeni
    { id: "password", label: "Şifre Değiştir" },
    { id: "profilfoto", label: "Profil Fotoğrafı" },
  ];

  const [active, setActive] = useState("brand");

  const dispatch = useDispatch();
  const calc = useSelector((s: any) => s.calcHelpers?.data);
  const calcLoading = useSelector((s: any) => s.calcHelpers?.loading);

  // ✅ preload (uygulama açılışında veya ayarlar açılınca)
  useEffect(() => {
    if (!calc && !calcLoading) {
      dispatch<any>(getCalculationHelpers()).catch(() => {});
    }
  }, [dispatch]);

  return (
    <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl p-5 sm:p-6 shadow-sm text-foreground">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Mobil: üst yatay sekme menü / Desktop: sol dikey menü */}
        <aside className="md:col-span-3">
          <nav
            className="
              sticky top-4
              flex md:block gap-2
              md:pr-2
              overflow-x-auto md:overflow-visible
              pb-2 md:pb-0
            "
          >
            {SECTIONS.map((s) => {
              const isActive = active === s.id;
              return (
                <AppButton
                  key={s.id}
                  onClick={() => setActive(s.id)}
                  variant="seffaf"
                  size="md"
                  shape="xl"
                  className={[
                    "shrink-0 md:shrink w-auto md:w-full",
                    "mb-0 md:mb-3 text-left px-4 py-2.5 transition-all duration-200",
                    "rounded-xl font-medium shadow-sm border",
                    isActive
                      ? "border-primary/50 bg-primary/10 text-primary"
                      : "border-border/40 bg-background/30 hover:bg-background/80 hover:border-border/80 text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  {s.label}
                </AppButton>
              );
            })}
          </nav>
        </aside>

        {/* Sağ içerik */}
        <main className="md:col-span-9">
          {active === "brand" && <BrandSection />}
          {active === "title" && <TitleSection />}
          {active === "rule" && <RuleSection />}

          {/* ✅ yeni */}
          {active === "optimizasyon" && <OptimizationSection />}
          {active === "username" && <UsernameSection />}

          {active === "password" && <PasswordSection />}
          {active === "profilfoto" && <ProfilePhotoSection />}
        </main>
      </div>
    </div>
  );
}
