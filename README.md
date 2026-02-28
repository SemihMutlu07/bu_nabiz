# BÜ Nabız

Boğaziçi öğrencilerinin anonim haftalık yük duvarı. Her hafta ne kadar yorulduğunu, nerede tıkandığını anonim paylaş; başkalarının "ben de" dediğini gör.

## Kurulum

```bash
# 1. Bağımlılıkları yükle
npm install

# 2. .env.local dosyasını oluştur (aşağıya bak)
cp .env.example .env.local  # veya elle yaz

# 3. Firebase konsolunda Firestore'u etkinleştir ve güvenlik kurallarını uygula

# 4. Geliştirme sunucusunu başlat
npm run dev
```

`http://localhost:3000` adresine git — otomatik olarak mevcut haftaya yönlendirilirsin.

## Ortam Değişkenleri

`.env.local` dosyasına Firebase proje ayarlarını ekle:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Admin paneli için giriş kodu (MVP)
NEXT_PUBLIC_ADMIN_CODE=istedigin-bir-kod
```

## Admin Paneli

`/admin/seed` adresinde seed ve silme araçları bulunur.

Sayfaya gittiğinde bir **admin kodu** girmen istenir. Kod `.env.local` (veya Netlify/Vercel'deki environment variables) içindeki `NEXT_PUBLIC_ADMIN_CODE` değeriyle eşleşmelidir.

**Yerel geliştirme:** `.env.local` içinde `NEXT_PUBLIC_ADMIN_CODE=nabiz-admin` olarak tanımlıdır; `/admin/seed` adresine git ve `nabiz-admin` yaz.

**Production (Netlify):** Netlify dashboard → Site settings → Environment variables → `NEXT_PUBLIC_ADMIN_CODE` ekle, sonra yeni bir deploy tetikle.

## Rotalar

| Rota | Açıklama |
|------|----------|
| `/` | Mevcut haftaya yönlendir |
| `/w/[week]` | O haftanın paylaşım duvarı (ör. `/w/2026-W09`) |
| `/w/[week]/pulse` | O haftanın özet istatistikleri |

## Firestore Güvenlik Kuralları (MVP)

Firebase konsolunda **Firestore → Rules** sekmesine gidip aşağıdaki kuralları uygula:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /posts/{postId} {
      // Herkes okuyabilir
      allow read: if true;

      // Yeni post oluşturma: zorunlu alanlar ve me_too_count sıfır başlamalı
      allow create: if request.resource.data.keys().hasAll([
                        'week', 'category', 'status', 'intensity',
                        'me_too_count', 'created_at'
                      ])
                   && request.resource.data.me_too_count == 0
                   && request.resource.data.intensity is int
                   && request.resource.data.intensity >= 1
                   && request.resource.data.intensity <= 5;

      // Sadece me_too_count +1 artırımına izin ver
      allow update: if request.resource.data.diff(resource.data)
                         .affectedKeys().hasOnly(['me_too_count'])
                   && request.resource.data.me_too_count ==
                      resource.data.me_too_count + 1;
    }

    match /me_too_events/{eventId} {
      // Herkes okuyabilir ve oluşturabilir
      // Duplicate kontrolü uygulama katmanında (transaction) yapılır
      allow read, create: if true;
    }

  }
}
```

## Teknik Yığın

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4**
- **Firebase Firestore** — gerçek zamanlı veri tabanı
- Auth yok, login yok — tamamen anonim
