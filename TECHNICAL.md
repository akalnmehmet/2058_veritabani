# Tümen Alüminyum — Teknik Doküman

**Versiyon:** 1.0  
**Tarih:** Mayıs 2026  
**Hazırlayanlar:** Mehmet AKALIN, Serhat KABA, Emre ÖZCAN

---

## İçindekiler

1. [Projeye Genel Bakış](#1-projeye-genel-bakış)
2. [Sistem Mimarisi](#2-sistem-mimarisi)
3. [Teknoloji Yığını](#3-teknoloji-yığını)
4. [Veritabanı Şeması](#4-veritabanı-şeması)
5. [Backend Mimari Detayları](#5-backend-mimari-detayları)
6. [Kimlik Doğrulama ve Yetkilendirme](#6-kimlik-doğrulama-ve-yetkilendirme)
7. [API Referansı](#7-api-referansı)
8. [Frontend Mimari Detayları](#8-frontend-mimari-detayları)
9. [PDF Motoru](#9-pdf-motoru)
10. [Docker Altyapısı](#10-docker-altyapısı)
11. [Ortam Değişkenleri](#11-ortam-değişkenleri)
12. [Güvenlik Notları](#12-güvenlik-notları)

---

## 1. Projeye Genel Bakış

Tümen Alüminyum Bayi Yönetim Sistemi; alüminyum doğrama sistemleri üreten bir firmanın **bayi ağını**, **proje/teklif süreçlerini** ve **üretim takibini** dijitalleştiren tam yığın (full-stack) bir web uygulamasıdır.

### Temel İş Akışı

```
Admin → Bayi Davet → Bayi Giriş → Müşteri Oluştur → Proje Oluştur
     → Sistem/Varyant Seç → Ölçü Gir → Hesapla → Teklif PDF Üret
     → Teklif Onayla → Sipariş → Üretim Takibi (Boya / Cam / Montaj)
```

### Kullanıcı Rolleri

| Rol | Açıklama | Erişim |
|-----|----------|--------|
| `admin` | Sistem yöneticisi | Tüm modüller + bayi yönetimi + katalog yönetimi |
| `dealer` | Yetkili bayi | Kendi müşterileri, projeleri ve teklifleri |

---

## 2. Sistem Mimarisi

```
┌─────────────────────────────────────────────────────┐
│                   KULLANICI TARAYICI                 │
│                  http://localhost:5173               │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/REST + JSON
                       │ Cookie (HttpOnly refresh_token)
┌──────────────────────▼──────────────────────────────┐
│              FRONTEND — nginx:alpine                 │
│   React 19 + Vite 6 + Redux + TypeScript            │
│   Port: 5173 (Docker: 5173→80)                      │
└──────────────────────┬──────────────────────────────┘
                       │ /api/* → HTTP/REST
                       │ /static/* → Media dosyaları
┌──────────────────────▼──────────────────────────────┐
│             BACKEND — python:3.14-slim               │
│   FastAPI 0.116 + SQLAlchemy 2.0 + Alembic          │
│   Port: 8000                                        │
└──────────────────────┬──────────────────────────────┘
                       │ psycopg2 (TCP 5432)
┌──────────────────────▼──────────────────────────────┐
│             VERİTABANI — postgres:17-alpine          │
│   PostgreSQL 17                                     │
│   Port: 5433 (host) → 5432 (container)             │
└─────────────────────────────────────────────────────┘
```

### İletişim Detayları

- Frontend → Backend: `VITE_API_BASE_URL` (build-time sabiti) üzerinden REST
- Backend → DB: SQLAlchemy connection pool, `DATABASE_URL` env değişkeninden
- Auth: Bearer token (Authorization header) + HttpOnly cookie (refresh token)
- Statik dosyalar (medya): Backend `/static/*` endpoint'i üzerinden servis edilir, nginx tarafından proxy edilmez (doğrudan `localhost:8000/static/` erişilir)

---

## 3. Teknoloji Yığını

### Backend

| Bileşen | Paket / Versiyon | Amaç |
|---------|-----------------|------|
| Web Framework | FastAPI 0.116 | REST API, OpenAPI otomasyonu |
| Runtime | Python 3.14 | |
| ASGI Sunucu | Uvicorn | HTTP/1.1 + WebSocket desteği |
| ORM | SQLAlchemy 2.0 | Model tanımı, sorgu oluşturma |
| Migrasyon | Alembic | Şema sürüm kontrolü (49 versiyon) |
| Veri Doğrulama | Pydantic v2 + pydantic-settings | Request/response şemaları, .env okuma |
| Veritabanı Sürücüsü | psycopg2-binary | PostgreSQL bağlantı adaptörü |
| Şifreleme | passlib[bcrypt] | Parola hash'leme |
| JWT | python-jose[cryptography] | Access token üretimi ve doğrulaması |
| E-posta | smtplib (stdlib) | Bayi davet maili |
| Dosya Servisi | Starlette StaticFiles | Medya dosyası sunumu |

### Frontend

| Bileşen | Paket / Versiyon | Amaç |
|---------|-----------------|------|
| UI Kütüphanesi | React 19 | Bileşen tabanlı UI |
| Dil | TypeScript 5 | Tip güvenliği |
| Build Aracı | Vite 6 | Geliştirme sunucusu, production bundle |
| Durum Yönetimi | Redux + react-redux | Global uygulama state |
| Middleware | redux-thunk | Async action desteği |
| Stil | Tailwind CSS v4 + daisyUI 5 | Utility-first CSS |
| Tablo | TanStack Table v8 | Sıralama, filtreleme, sayfalama |
| PDF | jsPDF + html2canvas | Teklif ve üretim PDF'leri |
| Form Doğrulama | React Hook Form + Zod | Form yönetimi ve validasyon |
| Bildirim | react-toastify | Toast mesajları |
| HTTP | Fetch API (custom `authFetch`) | Token yenileme, retry mekanizması |
| Router | React Router v6 | SPA yönlendirme |

### Altyapı

| Bileşen | Teknoloji | Amaç |
|---------|-----------|------|
| Konteyner | Docker + Docker Compose | Tekrarlanabilir ortam |
| Web Sunucusu | nginx:alpine | React SPA servisi, statik cache |
| Veritabanı | PostgreSQL 17-alpine | İlişkisel veri depolama |

---

## 4. Veritabanı Şeması

### 4.1 Varlık-İlişki Diyagramı (Özet)

```
app_user ──< customer ──< project ──< project_system ──< project_system_profile
    │                         │              │          ──< project_system_glass
    │                         │              │          ──< project_system_material
    │                         │              │          ──< project_system_remote
    │                         │              │
    │                         │              ├──< project_extra_profile
    │                         │              ├──< project_extra_glass
    │                         │              ├──< project_extra_material
    │                         │              └──< project_extra_remote
    │                         │
    │                         └──< sales_order ──< order_item ──< order_item_profile
    │                                                          ──< order_item_glass
    │                                                          ──< order_item_material
    │
    └──< refresh_token
    └──< user_token
    └── dealer_profile_picture

system ──< system_variant ──< system_profile_template
                          ──< system_glass_template
                          ──< system_material_template
                          ──< system_remote_template

profile (alüminyum profil)
glass_type (cam türü)
other_material (diğer malzeme)
remote (kumanda)
color (renk)
pdf_setting (pdf ayarı)
project_code_rule (proje kodu kuralı)
project_code_ledger (kodu ledger sayacı)
calculation_helper (hesaplama yardımcısı)
```

### 4.2 Tablo Detayları

#### `app_user` — Kullanıcılar
| Kolon | Tip | Kısıt | Açıklama |
|-------|-----|-------|----------|
| id | UUID | PK | Auto UUID4 |
| username | VARCHAR(50) | UNIQUE, NULLABLE | Giriş adı (davet aşamasında null) |
| password_hash | VARCHAR(200) | NULLABLE | bcrypt hash |
| role | VARCHAR(20) | NOT NULL, default='dealer' | 'admin' veya 'dealer' |
| name | VARCHAR(100) | | Firma / kullanıcı adı |
| email | VARCHAR(200) | | E-posta |
| phone | VARCHAR(20) | | Telefon |
| owner_name | VARCHAR(100) | | Firma sahibi adı |
| city | VARCHAR(100) | | Şehir |
| is_deleted | BOOLEAN | NOT NULL, default=false | Soft delete |
| status | VARCHAR(20) | CHECK('invited','active','suspended') | Hesap durumu |
| password_set_at | TIMESTAMPTZ | | Şifre son belirlenme zamanı |
| created_at / updated_at | TIMESTAMPTZ | | Zaman damgaları |

#### `refresh_token` — Yenileme Token'ları
| Kolon | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| user_id | UUID | FK → app_user(CASCADE) |
| token_hash | VARCHAR(64) | SHA-256 hash (plain token sunucuda saklanmaz) |
| user_agent | VARCHAR(256) | Cihaz bilgisi |
| ip_address | VARCHAR(64) | Kaynak IP |
| created_at / expires_at | DATETIME | Geçerlilik süresi |
| revoked_at | DATETIME | Çıkış yapıldığında set edilir |
| replaced_by | UUID | Rotasyon takibi |

#### `user_token` — Davet/Parola Sıfırlama Token'ları
| Kolon | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| user_id | UUID | FK → app_user |
| token_hash | VARCHAR(64) | SHA-256 hash |
| token_type | VARCHAR(20) | 'invite', 'password_reset' |
| expires_at | TIMESTAMPTZ | |
| used_at | TIMESTAMPTZ | Tek kullanım |

#### `customer` — Müşteriler
| Kolon | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| dealer_id | UUID | FK → app_user (bayi sahipliği) |
| name | VARCHAR | Müşteri adı |
| phone / email / address | VARCHAR | İletişim bilgileri |
| is_deleted | BOOLEAN | Soft delete |

#### `project` — Projeler
| Kolon | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| project_kodu | VARCHAR(50) | Otomatik oluşturulan proje kodu |
| project_name | VARCHAR(100) | |
| customer_id | UUID | FK → customer (SET NULL on delete) |
| created_by | UUID | FK → app_user |
| is_teklif | BOOLEAN | true=teklif, false=sipariş/onaylı |
| profile_color_id | UUID | FK → color |
| glass_color_id | UUID | FK → color |
| paint_status | VARCHAR(50) | Boya üretim durumu |
| glass_status | VARCHAR(50) | Cam temin durumu |
| production_status | VARCHAR(50) | Genel üretim durumu |
| approval_date | TIMESTAMPTZ | Teklif onay zamanı |
| press_price / painted_price | NUMERIC | Baskı/boyalı ağırlık fiyatı |

> **Unique:** `(created_by, project_kodu)` — Her bayi kendi proje kodunu bir kez kullanabilir.

#### `project_system` — Proje İçindeki Sistemler
Her projede birden fazla sistem (pencere/kapı tipi) bulunabilir.

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| project_id | UUID | FK → project (CASCADE) |
| system_variant_id | UUID | FK → system_variant |
| width_mm / height_mm | NUMERIC | Ölçüler |
| quantity | INTEGER | Adet |

#### `project_system_profile` / `_glass` / `_material` / `_remote`
Bir project_system'in içeriği. Her bir malzeme satırı için ayrı tablo. Tümünde 6 adet PDF çıktı bayrağı bulunur:

```
cam_ciktisi | profil_aksesuar_ciktisi | boya_ciktisi |
siparis_ciktisi | optimizasyon_detayli_ciktisi | optimizasyon_detaysiz_ciktisi
```

Bu bayraklar hangi PDF türünde o satırın yer alacağını kontrol eder.

#### `system` — Alüminyum Sistemler (Ürün Aileleri)
| Kolon | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| name | VARCHAR(100) | UNIQUE — sistem adı |
| sort_index | INTEGER | Görüntüleme sırası |
| is_published | BOOLEAN | Bayilere görünür mü |
| is_active / is_deleted | BOOLEAN | Durum yönetimi |
| photo_url | VARCHAR | Sistem görseli |

#### `system_variant` — Sistem Varyantları
Bir sisteme (ör: "Sürgülü Kapı") ait farklı yapısal varyantlar (ör: "2 Kanat", "3 Kanat").

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| system_id | UUID | FK → system (CASCADE) |
| sort_index | INTEGER | Sistem içi sıralama |
| pdf_foto_cikti | VARCHAR | PDF'te kullanılacak özel görsel |

> **ORM Trigger:** `System.is_active = False` yapıldığında tüm varyantları otomatik pasife alır (`SQLAlchemy after_update event`).

#### `system_profile_template` / `_glass_template` / `_material_template` / `_remote_template`
Bir varyant seçildiğinde projeye otomatik kopyalanan şablon malzeme listeleri. Her satırda formül tabanlı metraj ifadeleri bulunur (ör: `W * 2 + H - 50`).

#### `profile` — Alüminyum Profiller (Katalog)
| Kolon | Tip | Açıklama |
|-------|-----|----------|
| id | UUID | PK |
| kod | VARCHAR | Profil kodu |
| tanim | VARCHAR | Tanım |
| ag_mm | NUMERIC | Ağırlık (kg/m) |
| kg_fiyat | NUMERIC | kg başına fiyat |
| foto_url | VARCHAR | Kesit fotoğrafı |

#### `glass_type` — Cam Türleri
| Kolon | Tip | Açıklama |
|-------|-----|----------|
| belirtec_1 / belirtec_2 | VARCHAR | Isı / ses geçirgenlik değerleri |
| m2_fiyat | NUMERIC | m² fiyatı |

#### `other_material` — Diğer Malzemeler
Conta, vida, köpük, v.b. Birim: adet veya uzunluk (mm).

#### `remote` — Kumandalar
Motorlu sistemlerde kullanılan kumanda cihazları.

#### `color` — Renkler
`renk_turu`: `'profil'` veya `'cam'` olarak ayrılır.

#### `pdf_setting` — PDF Ayarları
Kullanıcıya özgü: firma logosu, başlık, alt bilgi vb. alanlar.

#### `project_code_rule` ve `project_code_ledger`
Proje kodu otomatik oluşturma sistemi. Kural şablonu (ör: `{YIL}-{BAYI}-{SIRA}`) ve her bayi için ayrı sayaç.

#### `calculation_helper` — Hesaplama Yardımcıları
Optimizasyon motoru için profil kesim boyu, fire payı ve diğer katsayıları tutar.

#### `dealer_profile_picture` — Bayi Profil Fotoğrafları
Blob olarak değil, dosya sistemi yolu olarak saklanır; binary veri `backend/media/` altında tutulur.

---

## 5. Backend Mimari Detayları

### 5.1 Katman Mimarisi

```
HTTP Request
    │
    ▼
FastAPI Router (app/routes/*.py)
    │  → Request doğrulama (Pydantic şema)
    │  → Auth bağımlılığı (get_current_user / get_current_admin)
    ▼
CRUD Katmanı (app/crud/*.py)
    │  → SQLAlchemy ORM sorguları
    │  → İş kuralları (ownership kontrolü vb.)
    ▼
SQLAlchemy Session (app/db/session.py)
    │
    ▼
PostgreSQL
```

### 5.2 Uygulama Başlatma (`main.py`)

1. `MEDIA_ROOT` dizini yoksa oluşturulur
2. CORS middleware yapılandırılır (`BACKEND_CORS_ORIGINS_RAW` env'den liste parse edilir)
3. `/static` → media dizini olarak mount edilir
4. Tüm router'lar `/api` prefix'i altında kayıt edilir

### 5.3 Bağımlılık Enjeksiyonu

```python
# app/api/deps.py
def get_current_admin(current_user: AppUser = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(403, "Admin yetkisi gerekli")
    return current_user
```

Admin gerektiren endpoint'ler `dependencies=[Depends(get_current_admin)]` ile korunur.

### 5.4 Sahiplik Kontrolü (`app/utils/ownership.py`)

Bayiler yalnızca kendi kayıtlarına erişebilir. Admin ise tüm kayıtlara erişir:

```python
def assert_owner_or_admin(resource_owner_id, current_user):
    if current_user.role == "admin":
        return
    if resource_owner_id != current_user.id:
        raise HTTPException(403, "Bu kaynağa erişim yetkiniz yok")
```

### 5.5 Bayi Davet Akışı

```
Admin POST /api/dealers/invite
    │
    ├── E-posta kontrolü (zaten kayıtlı mı?)
    ├── AppUser oluştur (status='invited', username=None)
    ├── UserToken oluştur (type='invite', TTL=48 saat)
    ├── Link: {FRONTEND_URL}/set-password?token={plain_token}
    ├── E-posta gönder (SMTP)
    │       └── Hata varsa: DEBUG=True → devam et, link response'da döner
    │                       DEBUG=False → HTTP 500
    └── DealerOut döner

Bayi POST /api/auth/set-password?token=XXX
    │
    ├── UserToken doğrula (hash, expire, used_at)
    ├── username + password al
    ├── AppUser güncelle (status='active', password_hash=bcrypt)
    └── UserToken.used_at = now()
```

### 5.6 Proje Kodu Otomasyonu

`project_code_rule` tablosunda şablon saklanır. Proje oluşturulduğunda:
1. Kuraldan token'lar çözümlenir (`{YIL}`, `{AY}`, `{SIRA}` vb.)
2. `project_code_ledger`'da o bayi için sayaç atomik olarak artırılır
3. Oluşan kod `project.project_kodu`'na yazılır
4. `UNIQUE(created_by, project_kodu)` kısıtı çakışmayı engeller

### 5.7 Alembic Migrasyonları

49 versiyon, baştan sona çalışır. `entrypoint.sh` içinde container her başlatıldığında:

```sh
alembic upgrade head
```

---

## 6. Kimlik Doğrulama ve Yetkilendirme

### 6.1 Token Stratejisi

```
┌─────────────────────────────────────────────────────┐
│  Access Token (JWT)                                  │
│  • Ömür: 30 dakika (yapılandırılabilir)             │
│  • Taşıma: Authorization: Bearer <token>            │
│  • Payload: { sub: user_id, exp: timestamp }        │
│  • Sunucuda saklanmaz → stateless                   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Refresh Token (Opaque)                              │
│  • Ömür: 1 gün (normal) / 30 gün (beni hatırla)    │
│  • Taşıma: HttpOnly Cookie (JS erişemez)            │
│  • Sunucuda: SHA-256 hash olarak saklanır           │
│  • Her kullanımda rotasyon (yeni token üretilir)    │
│  • Kullanılan eski token anında geçersizleşir       │
└─────────────────────────────────────────────────────┘
```

### 6.2 Giriş Akışı

```
POST /api/auth/token  (form: username, password, remember_me)
    │
    ├── Kullanıcı doğrulama (bcrypt verify)
    ├── Durum kontrolü: status='active', is_deleted=False
    ├── Access token üret (JWT, 30 dk)
    ├── Refresh token mint et (random bytes → hash → DB)
    ├── HttpOnly cookie set et
    └── { access_token, token_type, is_admin, role } döner
```

### 6.3 Token Yenileme Akışı

```
POST /api/auth/refresh  (cookie: refresh_token)
    │
    ├── Cookie'den plain token al
    ├── SHA-256 hash → DB'de bul
    ├── Süresi dolmamış mı? revoked_at null mı?
    ├── Eski token'ı iptal et (revoked_at = now)
    ├── Yeni refresh token üret → DB → cookie
    └── Yeni access token döner
```

### 6.4 Frontend Token Yönetimi (`authFetch.ts`)

Tüm API istekleri `fetchWithAuth()` üzerinden geçer:

```
fetchWithAuth(url, options)
    │
    ├── Authorization: Bearer {accessToken} header ekle
    ├── İsteği yap
    ├── 401 döndüyse:
    │       └── POST /api/auth/refresh (otomatik)
    │               ├── Başarılı → yeni token kaydet → isteği tekrarla
    │               └── Başarısız → store'u temizle → /login yönlendir
    └── Yanıtı döndür
```

---

## 7. API Referansı

### Authentication

| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| POST | `/api/auth/token` | — | Giriş; access token + refresh cookie |
| POST | `/api/auth/refresh` | Cookie | Token yenile + rotasyon |
| POST | `/api/auth/logout` | Cookie | Mevcut cihaz çıkışı |
| POST | `/api/auth/logout-all` | Bearer | Tüm cihazlar çıkışı |
| GET | `/api/auth/me` | Bearer | Oturum bilgileri |

### Bayi Yönetimi (Admin)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/dealers` | Bayi listesi (sayfalı, filtreli) |
| POST | `/api/dealers/invite` | Bayi davet et |
| PUT | `/api/dealers/{id}` | Bayi güncelle |
| DELETE | `/api/dealers/{id}` | Soft delete |
| POST | `/api/dealers/{id}/reactivate` | Askıya alınmış bayiyi aktifleştir |
| POST | `/api/dealers/resend-invite/{id}` | Daveti yeniden gönder |
| POST | `/api/dealers/admin-setup` | Admin hesabını ilk kurulum |

### Profil (Me)

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET/PUT/DELETE | `/api/me/profile-picture` | Profil fotoğrafı |
| GET/PUT | `/api/me/pdf-titles` | PDF başlık ayarları |
| GET/PUT | `/api/me/pdf-brands` | PDF marka/logo ayarları |
| GET/PUT | `/api/me/project-code` | Proje kodu kuralı |
| GET/PUT | `/api/me/calculation-helpers` | Hesaplama yardımcıları |
| POST | `/api/auth/change-username` | Kullanıcı adı değiştir |
| POST | `/api/auth/change-password` | Şifre değiştir |

### Müşteriler

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/customers` | Liste (bayi: sadece kendi) |
| POST | `/api/customers` | Yeni müşteri |
| PUT | `/api/customers/{id}` | Güncelle |
| DELETE | `/api/customers/{id}` | Soft delete |

### Projeler

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/projects` | Liste (is_teklif filtresi destekli) |
| POST | `/api/projects` | Yeni proje |
| GET | `/api/projects/{id}` | Proje detayı (tüm sistemler dahil) |
| PUT | `/api/projects/{id}` | Proje güncelle |
| DELETE | `/api/projects/{id}` | Sil |
| POST | `/api/projects/{id}/approve` | Teklifi onayla → sipariş |

### Proje Sistemleri

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/projects/{id}/systems` | Projeye sistem ekle |
| PUT | `/api/projects/{id}/systems/{sid}` | Sistem güncelle |
| DELETE | `/api/projects/{id}/systems/{sid}` | Sistem sil |

### Katalog (Sistemler & Varyantlar) — Admin

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET/POST | `/api/systems` | Sistem listesi / oluştur |
| PUT/DELETE | `/api/systems/{id}` | Güncelle / sil |
| POST | `/api/systems/{id}/variants` | Varyant oluştur |
| PUT/DELETE | `/api/variants/{id}` | Varyant güncelle / sil |
| GET | `/api/variants/{id}/full` | Varyant + tüm şablonlar |
| PUT | `/api/variants/{id}/profiles` | Profil şablonları güncelle |
| PUT | `/api/variants/{id}/glasses` | Cam şablonları güncelle |
| PUT | `/api/variants/{id}/materials` | Malzeme şablonları güncelle |
| PUT | `/api/variants/{id}/remotes` | Kumanda şablonları güncelle |

### Diğer Katalog Endpoint'leri

| Prefix | Açıklama |
|--------|----------|
| `/api/colors` | Renk kataloğu (CRUD) |
| `/api/catalog/profiles` | Profil kataloğu (CRUD + fotoğraf) |
| `/api/catalog/glass-types` | Cam türleri (CRUD) |
| `/api/catalog/materials` | Diğer malzemeler (CRUD) |
| `/api/catalog/remotes` | Kumandalar (CRUD) |

---

## 8. Frontend Mimari Detayları

### 8.1 Dizin Yapısı

```
src/
├── App.tsx                 # Root: ModalProvider > ConfirmProvider > SidebarProvider
├── main.tsx                # Redux store bağlantısı, BrowserRouter
│
├── global/
│   ├── ContentArea.tsx     # Layout + route tanımları
│   ├── SideBar.tsx         # Sol navigasyon (rol tabanlı)
│   ├── TopBar.tsx          # Üst bar: tema, profil avatar, çıkış
│   ├── SideBarContext.tsx  # Sidebar açık/kapalı state'i
│   └── useTheme.ts         # Dark/light mode toggle (localStorage)
│
├── scenes/                 # Sayfa bileşenleri
│   ├── login_screen/       # Giriş formu
│   ├── setpassword/        # Bayi ilk şifre belirleme
│   ├── forgotpassword/     # Şifre sıfırlama talebi
│   ├── resetpassword/      # Şifre sıfırlama
│   ├── projeler/           # Proje listesi
│   ├── projeekle/          # Proje oluşturma/düzenleme + PDF üretimi
│   ├── sistemler/          # Sistem/varyant yönetimi (Admin)
│   ├── sistemsec/          # Projeye sistem seçme sihirbazı
│   ├── sistem_ekle/        # Seçilen sistemi projeye ekleme (metraj)
│   ├── bayiler/            # Bayi yönetimi (Admin)
│   ├── musteriler/         # Müşteri yönetimi
│   ├── teklifler/          # Teklif yönetimi
│   ├── profiller/          # Alüminyum profil kataloğu (Admin)
│   ├── camlar/             # Cam kataloğu (Admin)
│   ├── boyalar/            # Renk kataloğu (Admin)
│   ├── diger_malzemeler/   # Malzeme kataloğu (Admin)
│   ├── kumandalar/         # Kumanda kataloğu (Admin)
│   └── ayarlar/            # Kullanıcı ayarları
│
├── redux/
│   ├── actions/            # API çağrıları + action creator'lar
│   │   ├── authActions.ts  # Giriş, çıkış, initAuth, token yenileme
│   │   ├── authFetch.ts    # fetchWithAuth: otomatik token yenileme
│   │   └── actions_*.ts    # Her domain için ayrı dosya
│   └── reducers/
│       ├── configureStore.ts   # Store yapılandırması
│       ├── index.ts            # Root reducer (combineReducers)
│       ├── authReducer.ts      # Kullanıcı oturumu + isAdmin türetimi
│       └── get*Reducer.ts      # Domain verileri (liste, yükleniyor, hata)
│
├── shared/
│   ├── modals/
│   │   ├── ModalProvider.tsx       # Global modal state yönetimi
│   │   ├── modalRegistry.tsx       # Modal adı → bileşen eşlemesi
│   │   ├── ImageAssetModal.tsx     # Fotoğraf yükleme modal'ı
│   │   ├── UpsertEntityModal.tsx   # Ekle/düzenle genel modal'ı
│   │   └── ConfirmProvider.tsx     # Onay diyaloğu
│   └── forms/
│       ├── useZodForm.ts           # React Hook Form + Zod entegrasyonu
│       └── rhfFields.tsx           # Ortak form alanı bileşenleri
│
└── lib/
    ├── api.ts              # API base URL sabiti
    ├── toast.ts            # toastSuccess / toastError yardımcıları
    └── utils.ts            # Ortak yardımcı fonksiyonlar
```

### 8.2 Redux State Yapısı

```typescript
{
  auth: {
    isLoggedIn: boolean,
    isAdmin: boolean,        // role === 'admin' türetimi
    bootstrapped: boolean,   // initAuth tamamlandı mı
    user: UserOut | null,
    accessToken: string | null,
  },
  projeler: { list, loading, error },
  sistemler: { list, loading, error },
  musteriler: { list, loading, error },
  bayiler: { list, loading, error },
  profiller: { list, loading, error },
  camlar: { list, loading, error },
  boyalar: { list, loading, error },
  digerMalzemeler: { list, loading, error },
  kumandalar: { list, loading, error },
  // ... diğer domain reducer'lar
}
```

### 8.3 Kimlik Doğrulama Başlatma (`initAuth`)

Uygulama her açıldığında:

```
initAuth() dispatch edilir
    │
    ├── localStorage'da accessToken var mı?
    │       ├── Evet → /api/auth/me çağır
    │       │       ├── 200 → store güncelle, bootstrapped=true
    │       │       └── 401 → refresh dene
    │       └── Hayır → refresh dene
    │
    └── POST /api/auth/refresh
            ├── 200 → yeni token kaydet, bootstrapped=true
            └── Hata → logout, /login yönlendir
```

### 8.4 Rol Tabanlı Erişim Kontrolü

`ContentArea.tsx` içinde `isAdmin` flag'ine göre iki farklı route seti render edilir. Admin olmayanlar katalog ve bayi yönetimi sayfalarına erişemez. `SideBar.tsx`'te menü öğeleri de aynı flag'e göre filtrelenir.

### 8.5 Modal Sistemi

`ModalProvider` context üzerinden global modal yönetimi sağlar:

```typescript
const { openModal } = useModal();
openModal("image.asset", { title: "...", upload: async (file) => { ... } });
```

`modalRegistry.tsx`'te modal adı → bileşen eşlemesi yapılır. Bu mimari sayesinde herhangi bir bileşenden modal açılabilir, prop drilling olmaz.

### 8.6 Gerçek Zamanlı Profil Fotoğrafı Senkronizasyonu

Upload tamamlandığında `window.dispatchEvent(new Event("profilePhotoUpdated"))` fırlatılır. `TopBar` bu event'i dinler ve avatarı yeniden yükler. React Context veya Redux kullanılmadan saf DOM event ile çözüldü.

---

## 9. PDF Motoru

### 9.1 PDF Türleri

| PDF | Açıklama |
|-----|----------|
| Teklif PDF | Müşteriye sunulan proje özeti ve fiyatlandırma |
| Sipariş Listesi PDF | Onaylı projeler için siparişe gönderilecek liste |
| Profil/Aksesuar PDF | Kesim listesi ve aksesuar detayları |
| Cam PDF | Cam sipariş listesi (boyutlar, adet, alan) |
| Boya PDF | Boyaya gönderilecek profil listesi |
| Optimizasyon PDF (Detaylı) | Bar optimizasyonu sonuçları + kesim planı |
| Optimizasyon PDF (Detaysız) | Sadece özet optimizasyon tablosu |

### 9.2 Mimari

```
ProjeDuzenle.tsx (kullanıcı PDF butonuna tıklar)
    │
    ▼
pdf/ dizini
├── engine/
│   ├── PdfEngine.ts        # Ana orchestrator
│   ├── expressions.ts      # Formül parser (W, H, Q token'ları)
│   └── resolvers.ts        # Veri çözümleme katmanı
├── registry/
│   └── dataSources.ts      # Veri kaynağı kayıt defteri
├── mappers/
│   └── glass.mapper.ts     # Cam verisi dönüştürücü
├── themes/
│   └── defaultTheme.ts     # Tablo renkleri, fontlar, margin
├── pdfCommon.ts            # Ortak header/footer/tablo yardımcıları
├── pdfGlass.ts             # Cam PDF oluşturucu
├── pdfOrder.ts             # Sipariş PDF oluşturucu
├── pdfPaint.ts             # Boya PDF oluşturucu
├── pdfOptimizeProfiles.ts  # Optimizasyon PDF oluşturucu
└── pdfProfileAccessory.ts  # Profil/aksesuar PDF oluşturucu
```

### 9.3 Formül Motoru

Sistem şablonlarında profil kesim uzunluğu gibi değerler formül olarak saklanır:

```
"W * 2 + H - 50"   → Genişlik*2 + Yükseklik - 50mm
"W / 3"            → Genişlik / 3
"Q"                → Adet
```

`expressions.ts` bu ifadeleri parse eder; `W`, `H`, `Q` token'ları gerçek proje boyutlarıyla değiştirilir.

### 9.4 Bar Optimizasyonu (`optimizasyon.ts`)

Alüminyum profiller standart boy çubuklardan (ör: 6000mm) kesilir. Optimizasyon algoritması:
- Her profil türü için gereken kesim listesini alır
- First Fit Decreasing (FFD) algoritmasıyla çubukları doldurur
- Fire payını (kerf) hesaba katar
- Sonucu `optimizasyon_detayli_ciktisi` / `_detaysiz_ciktisi` bayraklarına göre PDF'e yazar

### 9.5 PDF Çıktı Bayrağı Sistemi

Her malzeme satırı 6 bağımsız PDF bayrağı taşır. Bu sayede:
- Aynı veri farklı PDF türlerinde farklı şekilde görülebilir
- Kullanıcı hangi malzemenin hangi çıktıda yer alacağını kontrol edebilir
- PDF motorunun veri kaynağı seçimi bu bayraklara göre yapılır

---

## 10. Docker Altyapısı

### 10.1 Servisler

```yaml
services:
  db:          # postgres:17-alpine
  backend:     # python:3.14-slim (custom)
  frontend:    # node:20-alpine → nginx:alpine (multi-stage)
```

### 10.2 Backend Dockerfile

```dockerfile
FROM python:3.14-slim
# Sistem bağımlılıkları: libpq-dev (psycopg2), gcc (derleme)
RUN apt-get install -y libpq-dev gcc
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["sh", "entrypoint.sh"]
```

**`entrypoint.sh`:**
```sh
alembic upgrade head   # Migrasyonlar otomatik uygulanır
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 10.3 Frontend Dockerfile (Çok Aşamalı)

```dockerfile
# Aşama 1: Build
FROM node:20-alpine AS builder
ARG VITE_API_BASE_URL=http://localhost:8000/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm ci --silent && npm run build

# Aşama 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

`VITE_API_BASE_URL` build-time değişkenidir; Vite bu değeri bundle içine sabitler. Production'da `docker-compose.yml` içinden farklı URL verilebilir.

### 10.4 nginx Yapılandırması

```nginx
location / {
    try_files $uri $uri/ /index.html;  # SPA routing
}
location ~* \.(js|css|png|jpg|svg|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";  # Statik asset cache
}
gzip on;
```

### 10.5 Healthcheck ve Bağımlılık Zinciri

```
db (postgres:17) → healthcheck (pg_isready)
    └── backend (depends_on: db healthy) → başlar
            └── frontend (depends_on: backend) → başlar
```

Backend, veritabanı hazır olmadan başlamaz; bu sayede migrasyon hataları önlenir.

### 10.6 Volume Yapısı

| Volume | Amaç |
|--------|------|
| `postgres_data` | Veritabanı dosyaları (kalıcı) |
| `media_data` | Profil fotoğrafları ve sistem görselleri (kalıcı) |

---

## 11. Ortam Değişkenleri

### Backend (`backend/.env`)

| Değişken | Varsayılan | Açıklama |
|----------|-----------|----------|
| `DATABASE_URL` | — | `postgresql+psycopg2://user:pass@host:port/db` |
| `SECRET_KEY` | — | JWT imzalama anahtarı (min. 32 karakter önerilir) |
| `ALGORITHM` | `HS256` | JWT algoritması |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Access token ömrü (dakika) |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `30` | Refresh token ömrü (gün) |
| `MEDIA_ROOT` | `media` | Medya dosyası dizini |
| `FRONTEND_URL` | `http://localhost:5173` | Davet linklerinde kullanılır |
| `BACKEND_CORS_ORIGINS_RAW` | — | Virgülle ayrılmış izin verilen origin'ler |
| `DEBUG` | `False` | True ise SMTP hatası üretimi atlanır |
| `SMTP_HOST` | `localhost` | SMTP sunucu adresi |
| `SMTP_PORT` | `1025` | SMTP portu |
| `SMTP_USER` | `""` | SMTP kullanıcı adı |
| `SMTP_PASSWORD` | `""` | SMTP şifresi |
| `SMTP_FROM` | `no-reply@example.com` | Gönderici adresi |
| `SMTP_USE_SSL` | `False` | Port 465 için `True` |
| `SMTP_STARTTLS` | `False` | Port 587 için `True` |
| `REFRESH_COOKIE_SECURE` | `False` | Production'da `True` (HTTPS zorunlu) |
| `REFRESH_COOKIE_SAMESITE` | `lax` | `lax`, `strict` veya `none` |
| `REFRESH_COOKIE_DOMAIN` | `None` | Production domain (ör: `.tumenaluminyum.com`) |

### Frontend (`frontend/.env.local`)

| Değişken | Değer | Açıklama |
|----------|-------|----------|
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | Backend API adresi (build-time) |

> `.env.local` dosyası `.env`'i override eder ve Vite'ın öncelik sırasında en yüksektedir.

---

## 12. Güvenlik Notları

### 12.1 Mevcut Güvenlik Önlemleri

| Önlem | Uygulama |
|-------|----------|
| Şifre hash'leme | bcrypt (work factor: passlib varsayılanı ~12) |
| Access token | JWT, kısa ömürlü (30 dk), sunucuda saklanmaz |
| Refresh token | Opaque, SHA-256 hash olarak DB'de, HttpOnly cookie |
| Token rotasyonu | Her yenilemede yeni token, eski anında iptal |
| CORS | Sadece izin verilen origin'ler |
| Sahiplik kontrolü | Her CRUD işleminde `assert_owner_or_admin` |
| Soft delete | Kullanıcılar fiziksel silinmez; `is_deleted=True` |
| Admin kısıtı | Katalog ve bayi endpoint'leri `get_current_admin` ile korunur |
| Davet token tek kullanım | `user_token.used_at` null ise geçerli |

### 12.2 Production için Yapılması Gerekenler

```env
# backend/.env (production)
DEBUG=False
SECRET_KEY=<en-az-64-karakterlik-rastgele-deger>
REFRESH_COOKIE_SECURE=True
REFRESH_COOKIE_SAMESITE=strict
REFRESH_COOKIE_DOMAIN=.tumenaluminyum.com

# SMTP gerçek ayarları
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_STARTTLS=True
SMTP_USER=apikey
SMTP_PASSWORD=<sendgrid-api-key>
SMTP_FROM=no-reply@tumenaluminyum.com
```

### 12.3 Bilinen Kısıtlamalar

- **Rate limiting yok:** Giriş endpoint'inde brute-force koruması mevcut değil. Production'da nginx veya bir API gateway'de rate limiting uygulanmalıdır.
- **Refresh token yenileme yarış koşulu:** Çoklu sekme açık olduğunda aynı refresh token'ı eş zamanlı kullanma durumunda ikinci istek 401 alabilir. `authFetch.ts` bunu yeniden deneme mekanizmasıyla kısmen çözür.
- **Medya dosyaları doğrulama:** `PUT /api/me/profile-picture` yalnızca MIME type kontrolü yapar; dosya içerik doğrulaması yapılmaz.

---

*Bu doküman projenin `aa07206` commit'ine karşılık gelir.*
