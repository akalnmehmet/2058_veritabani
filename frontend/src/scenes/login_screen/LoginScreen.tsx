// Path: @/scenes/login_screen/LoginScreen.tsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "@/redux/actions/authActions";
import { useTheme } from "@/global/useTheme";
import AppButton from "@/components/ui/AppButton";

export default function LoginScreen() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector((state: any) => state.auth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Logo src with fallback
  const [logoSrc, setLogoSrc] = useState("/Logo_tumen.png");

  // Theme state
  const { isDark, toggleTheme } = useTheme();

  // Redirect on successful login
  useEffect(() => {
    if (token) {
      navigate("/", { replace: true });
    }
  }, [token, navigate]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    dispatch(loginUser(username, password, rememberMe) as any);
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const SunIcon = () => (
    <svg className="w-5 h-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zm10.48 0l1.79-1.8 1.41 1.41-1.8 1.79-1.4-1.4zM12 4V1h-0v3h0zm0 19v-3h0v3h0zM4 13H1v-0h3v0zm22 0h-3v0h3v0zM6.76 19.16l-1.42 1.42-1.79-1.8 1.41-1.41 1.8 1.79zM19.16 17.24l1.4 1.4-1.79 1.8-1.41-1.41 1.8-1.79zM12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  );

  const MoonIcon = () => (
    <svg className="w-5 h-5 text-indigo-500 dark:text-indigo-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.64 13a9 9 0 01-11.31-11.31A1 1 0 008.05.05 11 11 0 1023.95 15.95a1 1 0 00-1.64-0.95 8.94 8.94 0 01-0.67-.99z" />
    </svg>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-indigo-950 dark:to-blue-900 transition-colors duration-1000 flex items-center justify-center p-4">
      
      {/* 1. CSS Particles ve Custom Animasyonlar (Sadece bu sayfaya özel) */}
      <style>
        {`
          @keyframes floatUp {
            0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0; }
            20% { opacity: 0.3; }
            80% { opacity: 0.2; }
            100% { transform: translateY(-120vh) scale(1.5) rotate(360deg); opacity: 0; }
          }
          
          /* Aydınlık (Light) Mod Parçacıkları (Mavi Tonlar) */
          .particle {
            position: absolute;
            background: radial-gradient(circle, rgba(96,165,250,0.6) 0%, rgba(96,165,250,0) 70%);
            border-radius: 50%;
            bottom: -10vh;
            animation: floatUp linear infinite;
          }
          
          /* Karanlık (Dark) Mod Parçacıkları (Beyaz Tonlar) */
          .dark .particle {
            background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);
          }

          /* Aydınlık Mod Cam Kart */
          .glass-card {
            background: rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.6);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
          }
          
          /* Karanlık Mod Cam Kart */
          .dark .glass-card {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          }

          /* Aydınlık Mod Input */
          .glass-input {
            background: rgba(255, 255, 255, 0.6);
            border: 1px solid rgba(200, 210, 230, 0.8);
            color: #1e293b;
          }
          .glass-input:focus {
            background: rgba(255, 255, 255, 0.9);
            border-color: rgba(59, 130, 246, 0.5);
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.15);
          }
          
          /* Karanlık Mod Input */
          .dark .glass-input {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
          }
          .dark .glass-input:focus {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(96, 165, 250, 0.5);
            box-shadow: 0 0 15px rgba(96, 165, 250, 0.2);
          }
        `}
      </style>

      {/* 2. Parçacıkların Render Edilmesi */}
      {[...Array(20)].map((_, i) => {
        const size = Math.random() * 8 + 4; // 4px ile 12px arası
        const left = Math.random() * 100; // Ekranın %0 ile %100 arası konumu
        const duration = Math.random() * 15 + 10; // 10s ile 25s arası düşme hızı
        const delay = Math.random() * 10; // 0s ile 10s arası gecikme
        return (
          <div
            key={i}
            className="particle"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}vw`,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}

      {/* Ekstra devasa ve blur'lu zemin aydınlatmaları */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-300/40 dark:bg-blue-600/20 blur-[120px] pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-pulse transition-colors duration-1000"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-indigo-300/40 dark:bg-indigo-500/20 blur-[150px] pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-pulse transition-colors duration-1000" style={{ animationDelay: '2s' }}></div>

      {/* 3. Theme Toggle (Sağ Üst Sabit) */}
      <div className="absolute top-6 right-6 z-50">
        <button
          type="button"
          onClick={toggleTheme}
          className="p-3 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md shadow-lg hover:bg-white/90 dark:hover:bg-white/20 hover:scale-105 transition-all duration-300 border border-slate-200 dark:border-white/20 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Temayı değiştir"
          title="Tema"
        >
          {isDark ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>

      {/* Sol Üst Logo */}
      <div className="absolute top-6 left-6 z-50">
        <img
          src={logoSrc}
          alt="Logo"
          className="w-32 md:w-48 h-auto object-contain select-none transition-all duration-500 dark:brightness-110 dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:scale-105 dark:hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]"
          draggable={false}
          onError={() => {
            if (logoSrc !== "/logo_tumen.png") setLogoSrc("/logo_tumen.png");
          }}
        />
      </div>

      {/* 4. Merkezdeki Glassmorphism Form Kartı */}
      <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-700">
        
        {/* Asıl Kart Yapısı */}
        <div className="glass-card rounded-3xl p-8 sm:p-10 w-full relative overflow-hidden mt-12 md:mt-0 transition-colors duration-1000">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white mb-2 transition-colors duration-1000">
              Hoş Geldiniz
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-blue-100/70 transition-colors duration-1000">
              Sisteme erişmek için bilgilerinizi giriniz
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-1.5 relative group">
              <label htmlFor="username" className="text-sm font-semibold text-slate-700 dark:text-blue-100/90 pl-1 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-blue-300">
                Kullanıcı Adı
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full glass-input px-4 py-3.5 rounded-xl outline-none transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-white/30"
                placeholder="ornek_kullanici"
              />
            </div>

            <div className="space-y-1.5 relative group">
              <label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-blue-100/90 pl-1 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-blue-300">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full glass-input px-4 py-3.5 rounded-xl outline-none transition-all duration-300 placeholder:text-slate-400 dark:placeholder:text-white/30"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center space-x-2.5 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 rounded border border-slate-300 dark:border-white/30 bg-white/50 dark:bg-white/5 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500 peer-checked:border-blue-600 dark:peer-checked:border-blue-500 transition-all duration-200 shadow-inner"></div>
                  <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity duration-200 pointer-events-none drop-shadow-md" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-600 dark:text-blue-100/70 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  Beni hatırla
                </span>
              </label>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-bold text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-white transition-colors focus:outline-none drop-shadow-sm"
              >
                Şifremi unuttum?
              </button>
            </div>

            {/* Error & Loading State */}
            <div className="h-6 text-center flex items-center justify-center">
              {loading && (
                <p className="text-sm font-medium text-blue-600 dark:text-blue-200 animate-pulse">Giriş yapılıyor...</p>
              )}
              {error && <p className="text-red-600 dark:text-red-400 text-sm font-bold animate-in zoom-in duration-300 bg-red-100 dark:bg-red-500/10 px-3 py-1 rounded-md border border-red-200 dark:border-red-500/20">{error}</p>}
            </div>

            <AppButton
              type="submit"
              disabled={loading}
              variant="kurumsalmavi"
              shape="xl"
              className="w-full h-12 text-base font-bold tracking-wide shadow-xl shadow-blue-200 dark:shadow-blue-900/50 hover:shadow-blue-300 dark:hover:shadow-blue-500/50 transition-all duration-300 hover:-translate-y-1 border border-transparent dark:border-blue-400/20"
            >
              {loading ? "Yükleniyor..." : "Giriş Yap"}
            </AppButton>
          </form>
        </div>
        
        {/* Footer info */}
        <p className="text-center text-xs font-semibold text-slate-500 dark:text-white/40 mt-8 tracking-wider transition-colors duration-1000">
          © {new Date().getFullYear()} TÜMEN ALÜMİNYUM
        </p>
      </div>
    </div>
  );
}
