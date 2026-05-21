# Tümen Alüminyum - Bayi Yönetim ve Üretim Sistemi

![FastAPI](https://img.shields.io/badge/FastAPI-0.116-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-19-20232a?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=for-the-badge&logo=python&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-red?style=for-the-badge)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)

Tümen Alüminyum için geliştirilmiş; **bayi yönetimi**, **proje tekliflendirme**, **sipariş takibi** ve **üretim süreçlerini** dijitalleştiren tam yığın (full-stack) web uygulaması.

---

## Özellikler

- **Çoklu Rol Yönetimi** — Admin ve Bayi (Dealer) yetki seviyeleri
- **Dinamik Ürün Kataloğu** — Sistem, varyant, profil, cam, renk ve aksesuar yönetimi
- **Proje & Teklif Motoru** — Metraj, kesim listesi ve maliyet hesaplama
- **PDF Raporlama** — Teklif formu, imalat/kesim listesi, cam sipariş listesi
- **Üretim Takibi** — Boya, cam ve montaj durum yönetimi
- **Bayi Davet Sistemi** — E-posta ile davet, şifre belirleme ve sıfırlama
- **Müşteri Yönetimi** — Bayiye özel müşteri kayıtları
- **Sipariş Yönetimi** — Onaylanan tekliflerin siparişe dönüştürülmesi
- **Glassmorphism UI** — Modern, kurumsal arayüz tasarımı

---

## Teknoloji Yığını

### Backend
| Bileşen | Teknoloji |
|---------|-----------|
| Framework | FastAPI 0.116 |
| Dil | Python 3.14 |
| Veritabanı | PostgreSQL 18 |
| ORM | SQLAlchemy 2.0 |
| Migrasyon | Alembic |
| Veri Doğrulama | Pydantic v2 + pydantic-settings |
| Kimlik Doğrulama | OAuth2 + JWT (Access & Refresh Token) |
| Şifreleme | bcrypt + passlib |
| Sunucu | Uvicorn |

### Frontend
| Bileşen | Teknoloji |
|---------|-----------|
| Kütüphane | React 19 |
| Dil | TypeScript |
| Build Aracı | Vite 6 |
| Stil | Tailwind CSS v4 |
| Durum Yönetimi | Redux + React-Redux |
| HTTP İstemci | Axios + Fetch API |
| Tablo | TanStack Table v8 |
| PDF | jsPDF + html2pdf.js |

---

## Proje Yapısı

```
veritabani_odev/
├── backend/
│   ├── app/
│   │   ├── core/           # Ayarlar, güvenlik, e-posta
│   │   ├── crud/           # Veritabanı işlem katmanı (16 modül)
│   │   ├── db/             # SQLAlchemy engine & session
│   │   ├── models/         # ORM modelleri (20+ tablo)
│   │   ├── routes/         # API endpoint'leri (15 router)
│   │   ├── schemas/        # Pydantic request/response şemaları
│   │   ├── services/       # İş mantığı (token servisi)
│   │   └── utils/          # Yardımcı fonksiyonlar
│   ├── migrations/         # Alembic migrasyon dosyaları (40+ versiyon)
│   ├── main.py             # FastAPI uygulama giriş noktası
│   ├── requirements.txt    # Python bağımlılıkları
│   ├── Dockerfile          # Backend Docker imajı
│   ├── entrypoint.sh       # Migrasyon + sunucu başlatma betiği
│   └── .env                # Ortam değişkenleri (repo'ya dahil değil)
├── frontend/
│   ├── src/
│   │   ├── global/         # Layout, Sidebar, Topbar, AuthGuard
│   │   ├── scenes/         # Sayfa bileşenleri
│   │   ├── redux/          # Actions, reducers, store
│   │   ├── lib/            # API istemcisi, yardımcılar
│   │   └── components/     # Paylaşılan UI bileşenleri
│   ├── Dockerfile          # Çok aşamalı build (node → nginx)
│   ├── nginx.conf          # SPA yönlendirme + statik dosya cache
│   ├── .env.local          # Ortam değişkenleri (repo'ya dahil değil)
│   └── package.json
├── docker-compose.yml      # 3 servis: db · backend · frontend
└── README.md
```

---

## Kurulum

Projeyi iki farklı şekilde çalıştırabilirsiniz: **Docker ile (önerilen)** veya **Manuel kurulum**.

---

### 🐳 Docker ile Kurulum (Önerilen)

En hızlı ve taşınabilir yöntem. Tek komutla 3 servis (PostgreSQL, Backend, Frontend) ayağa kalkar.

#### Gereksinimler
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/macOS) veya Docker Engine (Linux)

#### 1. Repoyu Klonlayın

```bash
git clone https://github.com/akalnmehmet/2058_veritabani.git
cd 2058_veritabani
```

#### 2. Servisleri Başlatın

```bash
docker compose up -d --build
```

> İlk çalıştırmada imajlar build edilir (~3-5 dk). Alembic migrasyonları otomatik uygulanır.

#### 3. İlk Admin Kullanıcısını Oluşturun

```bash
docker exec tumen_backend python -c "
import sys; sys.path.insert(0,'.')
import app.models.app_user, app.models.order, app.models.customer
import app.models.project, app.models.system, app.models.color
import app.models.glass_type, app.models.other_material, app.models.profile
import app.models.remote, app.models.RefreshToken, app.models.user_token
import app.models.pdf, app.models.calculation_helper
import app.models.dealer_profile_picture, app.models.project_code_rule
import app.models.project_code_ledger, app.models.system_glass_template
import app.models.system_material_template, app.models.system_profile_template
import app.models.system_remote_template
import uuid
from app.db.session import SessionLocal
from app.models.app_user import AppUser
from app.core.security import get_password_hash
db = SessionLocal()
existing = db.query(AppUser).filter(AppUser.username == 'admin').first()
if existing:
    print('Admin zaten mevcut!')
else:
    db.add(AppUser(id=uuid.uuid4(), username='admin', password_hash=get_password_hash('admin123'), role='admin', name='Admin', email='admin@tumen.com', status='active'))
    db.commit()
    print('Admin olusturuldu.')
print('Kullanici adi: admin | Sifre: admin123')
db.close()
"
```

#### 4. Uygulamaya Erişin

| Servis | Adres |
|--------|-------|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |

#### Servisleri Durdurmak

```bash
docker compose down          # Servisleri durdur (veriler korunur)
docker compose down -v       # Servisleri durdur + veritabanını sil
```

#### Logları İzlemek

```bash
docker compose logs -f              # Tüm servisler
docker compose logs -f backend      # Sadece backend
docker compose logs -f frontend     # Sadece frontend
```

---

### 🔧 Manuel Kurulum

#### Gereksinimler
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

##### 2. Backend Kurulumu

```bash
cd backend

# Sanal ortam oluştur ve aktif et
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # Linux / macOS

# Bağımlılıkları yükle
pip install -r requirements.txt
```

**`.env` dosyası oluşturun** (`backend/.env`):

```env
DATABASE_URL=postgresql+psycopg2://postgres:SIFRE@localhost:5432/VERITABANI_ADI
SECRET_KEY=guclu-ve-rastgele-bir-gizli-anahtar
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=30
MEDIA_ROOT=media
FRONTEND_URL=http://localhost:5173
BACKEND_CORS_ORIGINS_RAW=http://localhost:5173,http://127.0.0.1:5173
DEBUG=True
```

**Veritabanı oluştur ve migrasyonları uygulayın:**

```bash
# PostgreSQL'de veritabanı oluştur
psql -U postgres -c "CREATE DATABASE VERITABANI_ADI;"

# Alembic migrasyonlarını çalıştır
alembic upgrade head
```

**İlk admin kullanıcısını oluşturun:**

```bash
python - <<'EOF'
import sys; sys.path.insert(0, '.')
import app.models.app_user, app.models.order, app.models.customer
import app.models.project, app.models.system, app.models.color
import app.models.glass_type, app.models.other_material, app.models.profile
import app.models.remote, app.models.RefreshToken, app.models.user_token
import app.models.pdf, app.models.calculation_helper
import app.models.dealer_profile_picture, app.models.project_code_rule
import app.models.project_code_ledger, app.models.system_glass_template
import app.models.system_material_template, app.models.system_profile_template
import app.models.system_remote_template
import uuid
from app.db.session import SessionLocal
from app.models.app_user import AppUser
from app.core.security import get_password_hash

db = SessionLocal()
admin = AppUser(id=uuid.uuid4(), username='admin',
    password_hash=get_password_hash('admin123'),
    role='admin', name='Admin', email='admin@tumen.com', status='active')
db.add(admin); db.commit(); db.close()
print("Admin oluşturuldu. Kullanıcı: admin / Şifre: admin123")
EOF
```

**Backend'i başlatın:**

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Frontend Kurulumu

```bash
cd frontend
npm install
```

**`.env.local` dosyası oluşturun** (`frontend/.env.local`):

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

**Frontend'i başlatın:**

```bash
npm run dev
```

---

## Erişim

| Servis | Adres |
|--------|-------|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |

**Varsayılan Admin Girişi** (ilk kurulumda yukarıdaki script ile oluşturulur):
- Kullanıcı adı: `admin`
- Şifre: `admin123`

---

## API Endpoint'leri

| Prefix | Açıklama |
|--------|----------|
| `POST /api/auth/token` | Giriş (access + refresh token) |
| `POST /api/auth/refresh` | Token yenileme |
| `POST /api/auth/logout` | Çıkış |
| `GET/POST /api/projects` | Proje yönetimi |
| `GET/POST /api/systems` | Sistem & varyant yönetimi |
| `GET/POST /api/customers` | Müşteri yönetimi |
| `GET/POST /api/dealers/invite` | Bayi davet & yönetimi |
| `GET/POST /api/colors` | Renk kataloğu |
| `GET/POST /api/catalog` | Katalog yayın yönetimi |
| `GET/POST /api/me/*` | Profil, PDF ayarları, proje kodu |

---

## Notlar

- **DEBUG=True** modunda e-posta gönderilemese bile bayi daveti tamamlanır; davet linki API response'unda `invite_link` alanında döner.
- Medya dosyaları (profil resimleri, sistem fotoğrafları) `backend/media/` dizininde tutulur.
- Production ortamında `DEBUG=False` yapılmalı ve geçerli bir SMTP sunucusu yapılandırılmalıdır.

---

## Geliştiriciler

Bu proje **Mehmet AKALIN**, **Serhat KABA** ve **Emre ÖZCAN** tarafından geliştirilmiştir.

---

## Lisans

Tüm telif hakları geliştiricilere ve projeyi talep eden kuruma aittir. İzinsiz kopyalanamaz veya çoğaltılamaz.
