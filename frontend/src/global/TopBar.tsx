// Path: @/global/TopBar.tsx
import React, { useState, useContext, useRef, useEffect } from "react";
import { SidebarContext } from "./SideBarContext";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "@/redux/actions/authActions";
import { useTheme } from "./useTheme";
import { getProfilePicture } from "@/redux/actions/actions_profilfoto"; // → dataURL dönen yardımcı

const FALLBACK_AVATAR = "/profilfoto.png"; // public klasörü

export default function TopBar() {
  const { expanded } = useContext(SidebarContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isDark, toggleTheme } = useTheme();

  // 🔹 Avatar kaynağı
  // getProfilePicture() bizim önerdiğimiz haliyle "data:image/jpeg;base64,..." döndürüyor.
  // Data URL’ler için revoke gerekmez ama güvenlik için blob: ihtimali varsa ele aldık.
  const [avatarSrc, setAvatarSrc] = useState(FALLBACK_AVATAR);
  const lastBlobUrlRef = useRef(null);

  // Dışarı tıklayınca profil menüsünü kapat
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Mount olduğunda profil fotoğrafını getir
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        // cacheBust: true → varsa tarayıcı cache’ini baypas et (sunucu 1 saat cache’liyor olabilir)
        const src = await getProfilePicture({ cacheBust: true });

        if (cancelled) return;

        // Eski blob URL varsa temizle (biz dataURL dönüyoruz; blob ihtimaline karşı güvenlik)
        if (lastBlobUrlRef.current && lastBlobUrlRef.current.startsWith("blob:")) {
          URL.revokeObjectURL(lastBlobUrlRef.current);
          lastBlobUrlRef.current = null;
        }

        setAvatarSrc(src || FALLBACK_AVATAR);
      } catch (err) {
        // Ağ hatası / yetki / 404 vb. durumda fallback kullan
        if (!cancelled) setAvatarSrc(FALLBACK_AVATAR);
      }
    })();

    return () => {
      cancelled = true;
      // Topbar unmount olurken olası blob URL’yi temizle
      if (lastBlobUrlRef.current && lastBlobUrlRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(lastBlobUrlRef.current);
        lastBlobUrlRef.current = null;
      }
    };
  }, []);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login", { replace: true });
  };

  return (
    <div
      className="sticky top-0 z-30 h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6 bg-background/80 backdrop-blur-lg border-b border-border/50 shadow-sm transition-all"
    >
      <div className="flex-1 flex items-center">
        {/* Placeholder for Breadcrumbs or Page Title could go here */}
        <h2 className="text-lg font-semibold text-foreground/80 hidden sm:block">Kontrol Paneli</h2>
      </div>

      {/* Tema anahtarı + profil */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* 🌗 Tema butonu */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-full hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/40"
          aria-label="Temayı değiştir"
          title="Tema"
        >
          {isDark ? (
            <svg
              className="w-5 h-5 text-indigo-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24" fill="currentColor"
            >
              <path d="M21.64 13a9 9 0 01-11.31-11.31A1 1 0 008.05.05 11 11 0 1023.95 15.95a1 1 0 00-1.64-.95 8.94 8.94 0 01-.67-.99z"/>
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-amber-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24" fill="currentColor"
            >
              <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zm10.48 0l1.79-1.8 1.41 1.41-1.8 1.79-1.4-1.4zM12 4V1h-0v3h0zm0 19v-3h0v3h0zM4 13H1v-0h3v0zm22 0h-3v0h3v0zM6.76 19.16l-1.42 1.42-1.79-1.8 1.41-1.41 1.8 1.79zM19.16 17.24l1.4 1.4-1.79 1.8-1.41-1.41 1.8-1.79zM12 8a4 4 0 100 8 4 4 0 000-8z"/>
            </svg>
          )}
        </button>

        {/* 👤 Profil resmi ve açılır menü */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setMenuOpen((open) => !open)}>
            <img
              src={avatarSrc}
              alt="Profil"
              className="w-10 h-10 rounded-full border-2 border-border/50 group-hover:border-primary/50 object-cover shadow-sm transition-colors duration-300"
              // Render sırasında <img> yüklenemezse (ör. bozuk base64), garanti fallback:
              onError={(e) => {
                if (avatarSrc !== FALLBACK_AVATAR) {
                  e.currentTarget.src = FALLBACK_AVATAR;
                  setAvatarSrc(FALLBACK_AVATAR);
                }
              }}
            />
            <svg className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${menuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
          
          {menuOpen && (
            <div
              className="absolute right-0 mt-3 w-48 z-50 rounded-xl border border-border/50 bg-card/95 backdrop-blur-md shadow-xl p-2 animate-in slide-in-from-top-2 fade-in duration-200"
            >
              <div className="px-3 py-2 border-b border-border/50 mb-1">
                <p className="text-sm font-medium text-foreground">Hesabım</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-red-500 hover:bg-red-500/10 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-500/20 dark:hover:text-red-300 transition-colors focus:outline-none flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
