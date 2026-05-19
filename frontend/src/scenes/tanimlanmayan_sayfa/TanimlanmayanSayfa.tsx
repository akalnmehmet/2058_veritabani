// Path: @/scenes/tanimlanmayan_sayfa/TanimlanmayanSayfa.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import AppButton from "@/components/ui/AppButton";

const TanimlanmayanSayfa = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-muted/30 p-6 text-center">
            {/* Büyük 404 rakamı */}
            <h1 className="text-7xl md:text-9xl font-extrabold text-primary mb-4 drop-shadow">
                404
            </h1>

            {/* Başlık */}
            <h2 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
                Sayfa Bulunamadı
            </h2>

            {/* Açıklama */}
            <p className="text-muted-foreground max-w-md mb-8">
                Aradığınız sayfa mevcut değil veya başka bir yere taşınmış olabilir.
            </p>

            {/* Geri dön butonu */}
            <AppButton
                text="Ana Sayfaya Dön"
                className="px-6 py-3 text-lg rounded-xl"
                onClick={() => navigate("/")}
            > Ana Sayfaya Dön </AppButton>
        </div>
    );
};

export default TanimlanmayanSayfa;
