# Wandoor Client

Frontend React untuk rekening, tabungan, deposito, life goals, dana pensiun, split bill, dan workspace admin. UI menggunakan desain minimalis dengan identitas hijau Wandoor.

## Prasyarat

- Node.js 24.19.0 (lihat `.nvmrc`) dan npm 11.
- Backend Wandoor untuk penggunaan aplikasi dengan data asli. Mode development tidak menyediakan login, OTP, atau data finansial dummy.
- Docker opsional untuk memeriksa image produksi.

## Development

```sh
npm ci
# Buat konfigurasi lokal jika belum ada; jangan menimpa konfigurasi pengguna.
cp -n .env.example .env.local
npm run dev
```

`VITE_API_BASE_URL` kosong mengirim request ke `/api` pada origin yang sama. Vite meneruskannya ke `API_PROXY_TARGET`, default `http://127.0.0.1:8081`. Untuk API HTTPS, verifikasi sertifikat tetap aktif. Jangan menyimpan kredensial dalam variabel `VITE_*`: nilainya masuk ke bundle browser.

Untuk checkout cloud yang sudah memiliki `.env` dengan origin lain, override untuk sesi lokal:

```sh
VITE_API_BASE_URL='' API_PROXY_TARGET=http://127.0.0.1:8081 npm run dev
```

## Pemeriksaan

```sh
npm run lint
npm run format:check
npm test
npm run build
npm audit
npx playwright install chromium
npm run test:e2e
```

`npm run check` menjalankan lint, unit/component tests, dan build. Browser tests menguji desktop dan mobile menggunakan respons API terkontrol; kredensial serta token uji hanya berada di file test. Pengujian ini tidak membuktikan autentikasi atau otorisasi backend produksi.

Bila Chromium sudah tersedia, gunakan `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`. Untuk menguji image produksi yang sudah berjalan, set `PLAYWRIGHT_BASE_URL` ke origin container tersebut.

Browser tests juga memeriksa WCAG secara otomatis; pemeriksaan otomatis bukan sertifikasi aksesibilitas menyeluruh.

## Struktur

```text
src/
  app/                 # Entry aplikasi, routing, lazy loading
  assets/              # Identitas visual Wandoor
  features/
    auth/              # Login, OTP, reset, dan sesi
    admin-dashboard/   # API admin, izin UI, tabel, dan workflow
    card/              # Rekening dan kompatibilitas route kartu lama
    dashboard/
    deposit/
    life-goals/
    pension-funds/
    profile/
    saving/
    split-bill/
  shared/
    api/               # HTTP client dan riwayat transaksi
    components/        # Layout, dialog, portofolio, dan statement
    hooks/             # Lifecycle async dan batas waktu sesi
    lib/               # Format uang/tanggal, CSV, dan normalisasi transaksi
    styles/            # Design tokens dan komponen bersama
  test/                # Setup dan helper test
e2e/                   # Browser tests; data uji tidak masuk bundle
deployment/            # Template Nginx dan header keamanan
docs/                  # Arsitektur, migrasi, dan hasil validasi
```

Detail keputusan ada di [arsitektur](docs/architecture.md) dan [catatan rework](docs/rework.md).

## Produksi

```sh
docker compose up --build -d
```

Compose menyediakan frontend pada port 8080 dan meneruskan `/api` ke backend host port 8081. Set `API_UPSTREAM` untuk alamat backend deployment sebenarnya. Image menggunakan same-origin API; variabel Vite di runtime container tidak mengubah bundle statis.

Pada Kubernetes atau reverse proxy, tetap sediakan routing `/api` ke service backend, atau set `API_UPSTREAM` pada container frontend. Default image menunjuk loopback port 8081; default Compose memakai host gateway. Gunakan terminasi HTTPS dan HSTS di ingress produksi. Nginx menyediakan SPA fallback, cache aset ber-hash, CSP, dan `Cache-Control: no-store` untuk respons API yang melewati proxy frontend.

Untuk jaringan yang memerlukan proxy dan CA organisasi, Dockerfile menerima CA melalui BuildKit secret `npm_ca`. Gunakan `--build-arg HTTP_PROXY`, `--build-arg HTTPS_PROXY`, dan `--secret id=npm_ca,src=/path/to/trusted-ca.pem`. CA hanya digunakan saat install; tidak disalin ke image. Jangan menonaktifkan verifikasi TLS.

CI menjalankan pemeriksaan wajib. Publishing image dan pembaruan repository infra yang sudah ada hanya berjalan pada push ke `staging` setelah pemeriksaan lolos; pull request tidak menjalankan deployment.
