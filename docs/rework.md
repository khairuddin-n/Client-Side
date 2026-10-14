# Catatan rework

Baseline: branch `staging`, commit `845aedb3ddb5b79979d26d58fdcce840a705ee17`. Implementasi dikerjakan di `refactor/client-side-rework`.

## Perubahan

- Pemisahan `app`, adapter API feature, komponen domain, serta utilitas dan design tokens bersama.
- Desain minimalis baru berbahasa Indonesia dengan logo dan warna inti Wandoor.
- Penghapusan login/OTP hardcoded, fallback data dummy, UI perubahan password fiktif, CSS lama yang tidak dipakai, serta dependensi yang tidak diperlukan.
- HTTP client dan sesi bersama, logout saat idle/expiry, pencegahan submission ganda, serta perlindungan terhadap respons async lama.
- Perbaikan kontrak rekening, field detail life goal, tahun transaksi, pengurutan nominal/tanggal, pagination, deep links, dan status pembayaran.
- CSV dengan quoting dan mitigasi formula injection; PDF memakai data tagihan sebenarnya, mendukung halaman tabel lanjutan, dan dimuat saat diminta.
- UI admin menggunakan izin menu API dan penugasan workflow; tidak memberikan fallback izin saat API gagal.
- Node 24, lockfile sinkron, test/format/lint wajib di CI, serta pembatasan deployment ke push staging.
- Image Nginx dengan SPA fallback, same-origin API proxy, cache aset, dan header keamanan.

## Migrasi deployment

- Gunakan Node sesuai `.nvmrc` dan `npm ci`.
- Variabel `VITE_*` bersifat build-time dan publik. Konfigurasi Docker memakai `API_UPSTREAM` pada runtime atau routing `/api` di ingress.
- Periksa konfigurasi upstream di infra sebelum merilis image baru. Tidak ada perubahan pada repository backend atau infra selama rework ini.
- UI profil hanya menampilkan operasi yang benar-benar didukung. Reset password melalui halaman autentikasi; modal profil lama yang tidak memanggil API dihapus.
- API approval saat ini tidak memiliki field catatan penolakan; UI tidak mengklaim menyimpan catatan yang tidak didukung server.
- Keamanan cookie HttpOnly, server-side authorization, rate limiting, dan revokasi token tetap memerlukan dukungan backend.

## Validasi

Hasil akhir dicatat di [validation.md](validation.md). Browser tests menggunakan fixture dengan bentuk respons backend dan tidak memakai login ke layanan produksi. Pemeriksaan visual desktop/mobile memakai data uji.

Tidak ada merge ke `staging` atau `main`, deployment staging, push image, atau perubahan repository infra yang dijalankan oleh proses rework ini.
