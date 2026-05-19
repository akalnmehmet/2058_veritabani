// Path: @/scenes/resetpassword/ResetPasswordPage.tsx

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../../redux/actions/authActions';
import { useTheme } from '@/global/useTheme';
import AppButton from '@/components/ui/AppButton';

// LoginScreen.js'den ikon bileşenleri
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


const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [token, setToken] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { isDark, toggleTheme } = useTheme();

  // 1. Sayfa yüklendiğinde URL'den token'ı al
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      setError('Geçersiz veya eksik sıfırlama bağlantısı.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // 2. Client-side doğrulamalar
    if (!token) {
      setError('Sıfırlama token\'ı bulunamadı.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    if (password.length < 6) { // Örnek bir kural, API'nize göre ayarlayın
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);

    try {
      // 3. Redux action'ı çağır
      await dispatch(resetPassword(token, password));
      setMessage('Şifreniz başarıyla sıfırlandı. Giriş sayfasına yönlendiriliyorsunuz...');
      
      // 4. Başarı sonrası yönlendirme
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setError('Şifre sıfırlanamadı. Bağlantı geçersiz veya süresi dolmuş olabilir.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4 relative font-sans">
      
      {/* Tema Butonu */}
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

      {/* Ana Kart */}
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl shadow-md border border-border">
        
        <img 
          src="/UELogo.png" 
          alt="UE Logo" 
          className="w-32 h-auto mx-auto" 
        />

        <div className="text-center">
          <h2 className="text-3xl font-semibold text-foreground">
            Yeni Şifre Belirleyin
          </h2>
          
          <p className="mt-2 text-base text-muted-foreground">
            Lütfen yeni şifrenizi girin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Şifre Alanı */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Yeni Şifre
            </label>
            <input
              type="password"
              id="password"
              className="input input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          {/* Şifre Tekrar Alanı */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
              Yeni Şifre (Tekrar)
            </label>
            <input
              type="password"
              id="confirmPassword"
              className="input input-bordered w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
          
          {/* Buton */}
          <AppButton
            type="submit"
            disabled={loading || !token}
            variant="kurumsalmavi"
            size="md"
            shape="none"
            className="w-full"
          >
            {loading ? 'Şifre Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
          </AppButton>
        </form>

        {/* Mesaj Alanı */}
        <div className="h-10 text-center">
          {message && (
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

        {/* Giriş'e Dön Linki */}
        <div className="pt-6 text-center border-t border-border">
          <Link 
            to="/login" 
            className="text-sm font-medium text-primary hover:underline"
          >
            &larr; Giriş Ekranına Dön
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
