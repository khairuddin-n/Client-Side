# Hasil validasi

Validasi dilakukan pada 14 Oktober 2026 untuk branch `refactor/client-side-rework`.

| Pemeriksaan                                      | Hasil                                                               |
| ------------------------------------------------ | ------------------------------------------------------------------- |
| Instalasi dari lockfile: `npm ci`                | Lolos                                                               |
| ESLint                                           | Lolos tanpa warning                                                 |
| Prettier                                         | Lolos                                                               |
| Unit/component regression tests                  | 50 test lolos, 11 file; tidak ada skipped test                      |
| Playwright development                           | 30 test lolos, desktop dan mobile                                   |
| Playwright image produksi Nginx                  | 30 test lolos, desktop dan mobile                                   |
| Axe WCAG pada login, dashboard, dialog transaksi | Lolos di desktop/mobile; 0 violation pada cakupan tersebut          |
| Vite production build                            | Lolos                                                               |
| `npm audit`                                      | 0 temuan, dibandingkan 55 temuan pada baseline                      |
| Docker multi-stage build                         | Lolos                                                               |
| `nginx -t` dan `/healthz`                        | Lolos                                                               |
| Header keamanan dan proxy API produksi           | Lolos                                                               |
| Smoke frontend Nginx → backend asli → Oracle     | HTTP 401, `INVALID_CREDENTIALS` untuk kredensial uji yang tidak ada |
| Whitespace diff                                  | Lolos                                                               |

Pengujian browser mencakup login/OTP, reset password, masking saldo, navigasi/deep links, semua produk nasabah, daftar/detail admin, batas izin UI approval, error API, transaksi, CSV, validasi edit split bill, kegagalan pembayaran tanpa perubahan optimistis, dan PDF dengan nama peserta/tagihan sebenarnya dari fixture.

Container akhir berstatus `healthy`; favicon mengembalikan HTTP 200 dengan body PNG. Probe localhost mengabaikan proxy, dan aset statis dimiliki user Nginx agar permission checkout tidak menyebabkan HTTP 403. Runner development dan produksi memakai direktori artefak terpisah.

## Ukuran bundle

Bundle utama baseline sekitar 1.196 kB (379 kB gzip). Setelah rework sekitar 358 kB (112 kB gzip); React/vendor terpisah sekitar 51 kB dan fitur/halaman dimuat secara lazy. Pembuat PDF sekitar 418 kB dimuat hanya saat pengguna meminta PDF. Angka ini adalah ukuran file bundle, bukan pengukuran waktu muat atau Lighthouse.

## Kondisi lingkungan

Docker builder cloud tidak memiliki pemetaan DNS hostname proxy yang tersedia pada host. Build berhasil setelah menambahkan pemetaan hostname proxy yang sesuai resolusi host, meneruskan konfigurasi proxy, dan memasang CA tepercaya melalui BuildKit secret. Verifikasi TLS tetap aktif; sertifikat tidak disalin ke image. Ini penyesuaian invocation lokal, bukan hostname/IP yang di-hardcode ke konfigurasi repository.

`npm ci` juga lolos di container Node 24. Image produksi diuji dengan konfigurasi upstream lokal menuju backend yang sudah tersedia. Data dan kode backend tidak diubah.

## Batas pengujian

Browser tests memakai API fixture berbentuk respons backend. Token uji tidak valid untuk backend nyata. Smoke backend asli memverifikasi jalur proxy dan penolakan login yang salah; login positif, pengiriman email OTP, mutasi perbankan, dan otorisasi backend produksi belum diuji dengan kredensial nyata.

Axe menguji cakupan halaman di atas dan tidak membuktikan seluruh aplikasi memenuhi WCAG. Audit npm tidak mencakup semua kemungkinan kerentanan aplikasi atau image OS. Kebutuhan migrasi cookie HttpOnly dan kontrol backend dijelaskan di [SECURITY.md](../SECURITY.md).

Tidak dilakukan merge, push image registry, deployment staging, atau perubahan repository infra.
