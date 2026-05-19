# Tümen Alüminyum - Üretim ve Yönetim Sistemi 🚀

Modern, güvenilir ve yüksek performanslı **Alüminyum ve Cam Üretim Yönetim Sistemi**. Bu proje, kurumsal üretim süreçlerini optimize etmek, maliyetleri en aza indirmek ve müşterilere hızlı teklifler sunabilmek amacıyla geliştirilmiştir. Premium **Glassmorphism** tasarım diliyle hazırlanmış arayüzü sayesinde son derece şık ve kullanıcı dostu bir deneyim sunar.

![Glassmorphism UI](https://img.shields.io/badge/UI-Glassmorphism-blue?style=for-the-badge)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)

---

## 🌟 Öne Çıkan Özellikler

* **Müşteri ve Teklif Yönetimi:** Müşteri kayıtlarını tutma, onlara özel dinamik alüminyum ve cam sistem teklifleri hazırlama.
* **Premium Arayüz (Glassmorphism):** Saydam yüzeyler, arka plan bulanıklığı (backdrop-blur) ve yumuşatılmış köşeler ile modern, göz yormayan bir tasarım.
* **Malzeme Yönetimi:** Profiller, Camlar, Boyalar, Kumandalar ve Diğer Malzemelerin birim fiyat, ağırlık ve özellik bazında detaylı takibi.
* **Sistem ve Varyant Altyapısı:** Birleştirilebilir profil ve camlardan oluşan dinamik üretim sistemlerinin kurgulanması.
* **Optimizasyon Motoru:** Bıçak ve boya firelerini hesaplayarak optimum üretim maliyetini çıkaran gelişmiş algoritmalar.
* **Dinamik PDF Üretimi:** Teklif ve siparişlerin saniyeler içinde markaya özel PDF belgelerine dönüştürülmesi.
* **Sipariş ve Üretim Takibi:** Tekliften üretime geçen siparişlerin durumlarını yönetme ve takip etme.

---

## 🛠️ Teknoloji Yığını

### Frontend (İstemci)
* **Kütüphane:** React 18
* **Derleyici:** Vite
* **Tasarım:** Tailwind CSS & DaisyUI
* **Durum Yönetimi:** Redux & React-Redux
* **Stil Mimarisi:** Custom Glassmorphism UI

### Backend (Sunucu)
* **Framework:** FastAPI (Python)
* **Veritabanı:** PostgreSQL
* **ORM:** SQLAlchemy
* **Migration:** Alembic
* **Kimlik Doğrulama:** JWT (JSON Web Tokens)

---

## 🚀 Kurulum ve Çalıştırma

### 1. Gereksinimler
- Node.js (v16 veya üzeri)
- Python (v3.9 veya üzeri)
- PostgreSQL

### 2. Backend Kurulumu
```bash
cd backend
python -m venv venv
# Windows için: venv\Scripts\activate
# Mac/Linux için: source venv/bin/activate

pip install -r requirements.txt

# Veritabanını oluşturma ve migrasyonlar (alembic.ini yapılandırmasını kontrol edin)
alembic upgrade head

# Sunucuyu başlatma
uvicorn app.main:app --reload
```

### 3. Frontend Kurulumu
```bash
cd frontend
npm install

# Geliştirme sunucusunu başlatma
npm run dev
```

---

## 🎨 Tasarım Detayları (UI/UX)
Sistem baştan aşağı yenilenerek, modern uygulamaların trendi olan **Glassmorphism** yapısına bürünmüştür:
* **Kartlar ve Tablolar:** Yarı saydam arka planlar (`bg-card/50`), yumuşak gölgeler (`shadow-sm`) ve `backdrop-blur-md` efektleri.
* **Form Elemanları:** Dinamik odaklanma efektleri (`focus:ring-primary/10`) ile temiz input ve buton yapıları.
* **Renk Paleti:** Kurumsal kimliği yansıtan modern lacivert ve gri tonlar.

---

## 📝 Lisans
Bu projenin tüm telif hakları geliştiricisine ve projeyi talep eden kuruma aittir. İzinsiz kopyalanamaz veya çoğaltılamaz.
