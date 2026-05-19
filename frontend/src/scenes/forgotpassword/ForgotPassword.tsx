// Path: @/scenes/forgotpassword/ForgotPassword.tsx

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { forgotPassword } from '@/redux/actions/authActions'; // Action path'inizi doğrulayın
import { useTheme } from '@/global/useTheme'; // useTheme hook'unu import ediyoruz
import AppButton from '@/components/ui/AppButton'; // AppButton'u import ediyoruz

// LoginScreen.js'den ikon bileşenlerini kopyalıyoruz
const SunIcon = () => (
  <svg
    className="swap-off w-5 h-5"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42zm10.48 0l1.79-1.8 1.41 1.41-1.8 1.79-1.4-1.4zM12 4V1h-0v3h0zm0 19v-3h0v3h0zM4 13H1v-0h3v0zm22 0h-3v0h3v0zM6.76 19.16l-1.42 1.42-1.79-1.8 1.41-1.41 1.8 1.79zM19.16 17.24l1.4 1.4-1.79 1.8-1.41-1.41 1.8-1.79zM12 8a4 4 0 100 8 4 4 0 000-8z" />
  </svg>
);

const MoonIcon = () => (
  <svg
    className="swap-on w-5 h-5"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M21.64 13a9 9 0 01-11.31-11.31A1 1 0 008.05.05 11 11 0 1023.95 15.95a1 1 0 00-1.64-0.95 8.94 8.94 0 01-0.67-.99z" />
  </svg>
);


const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  
  // Tema durumu hook'unu çağırıyoruz
  const { isDark, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await dispatch(forgotPassword(email));
      setMessage(response.message);
    } catch (err) {
      setError('Bir hata oluştu. Lütfen e-postanızı kontrol edin veya daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Ana konteyner: LoginScreen ile aynı tema sınıfları
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4 relative font-sans">
      
      {/* SAĞ ÜST: Tema butonu (LoginScreen'den kopyalandı) */}
      <div className="fixed top-4 right-4 z-50">
        <label
          className="btn btn-ghost btn-sm swap swap-rotate"
          aria-label="Temayı değiştir"
          title="Tema"
        >
          <input type="checkbox" checked={isDark} onChange={toggleTheme} />
          <SunIcon />
          <MoonIcon />
        </label>
      </div>

      {/* Kart: LoginScreen ile aynı tema sınıfları */}
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl shadow-md border border-border">
        
        <img 
          src="/Logo.png" 
          alt="Logo" 
          className="w-32 h-auto mx-auto" 
        />

        <div className="text-center">
          <h2 className="text-3xl font-semibold text-foreground">
            Şifrenizi mi Unuttunuz?
          </h2>
          
          <p className="mt-2 text-base text-muted-foreground">
            Endişelenmeyin. Kayıtlı e-posta adresinizi girin, size şifre sıfırlama talimatlarını gönderelim.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              E-posta Adresi
            </label>
            <input
              type="email"
              id="email"
              // Input: LoginScreen ile aynı tema sınıfı
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@mail.com"
              required
              disabled={loading}
            />
          </div>
          
          {/* Buton: LoginScreen'deki AppButton'u kullanıyoruz */}
          <AppButton
            type="submit"
            disabled={loading}
            variant="kurumsalmavi" // LoginScreen'deki gibi
            size="md"
            shape="none"
            className="w-full"
          >
            {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
          </AppButton>
        </form>

        {/* Mesaj alanları: LoginScreen'deki hata/başarı sınıflarına benzetildi */}
        <div className="h-10 text-center">
          {message && (
            // text-success (eğer temanızda tanımlıysa) veya DaisyUI alert'i
            <div className="text-sm font-medium text-success">
              {message}
            </div>
          )}
          {error && (
            <div className="text-sm font-medium text-error">
              {error}
            </div>
          )}
        </div>


        <div className="pt-6 text-center border-t border-border">
          <Link 
            to="/login" 
            // Link: LoginScreen'deki gibi text-primary kullanıldı
            className="text-sm font-medium text-primary hover:underline"
          >
            &larr; Giriş Ekranına Dön
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;