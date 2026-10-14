# Deployment Vercel tanpa instalasi lokal

Konfigurasi `vercel.json` membangun frontend dengan Node 24, menyediakan fallback untuk route React, dan meneruskan `/api/*` ke `https://api.wandoor.my.id/api/*`. Alamat tersebut berasal dari konfigurasi frontend yang sudah ada; ketersediaan backend publik belum diverifikasi dari environment cloud ini.

1. Buka https://vercel.com/new dan masuk menggunakan GitHub.
2. Import repository `khairuddin-n/Client-Side`.
3. Gunakan branch `refactor/client-side-rework` sebagai Production Branch untuk project pengujian ini. Jika import pertama memakai branch default, deployment pertama belum memuat rework; ubah Production Branch di Settings → Git lalu deploy ulang branch rework.
4. Pilih Node.js 24.x di Settings → Build and Deployment. Root directory adalah root repository. Build dan output memakai `vercel.json`.
5. Deploy lalu buka URL HTTPS yang diberikan Vercel. Tidak perlu menginstal Node, Docker, atau CLI di komputer Anda.

Build memaksa `VITE_API_BASE_URL` kosong agar browser memakai API pada origin frontend yang sama. Jika backend berbeda, ubah tujuan rewrite `/api` di `vercel.json` sebelum deployment. Jangan memasukkan token atau password ke variabel `VITE_*`.

Setelah deployment, periksa halaman login, refresh route React, respons aset, header keamanan, dan koneksi `/api`. Login dan OTP memerlukan backend publik yang aktif. Keberhasilan build lokal tidak membuktikan proxy Vercel atau backend publik bekerja.

Untuk deployment otomatis dari Codex, akun/project Vercel harus terhubung melalui kredensial yang disimpan aman dalam environment settings, dan akses jaringan ke API Vercel serta domain deployment harus diizinkan. Jangan kirim token melalui chat.
