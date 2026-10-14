# Keamanan Wandoor Client

Frontend dipelihara pada branch aktif `staging`. Gunakan lockfile yang direview, Node yang didukung, dan `npm ci`. Jangan memasukkan password, API key, JWT nyata, atau identitas nasabah dalam source, test, screenshot, log, atau variabel `VITE_*`.

## Kontrol frontend

- Login dan OTP selalu diproses API; tidak ada kredensial atau token fallback.
- Sesi divalidasi terhadap expiry/peran untuk routing, dengan penanganan 401, idle logout, dan pembersihan state autentikasi.
- Respons request lama tidak boleh mengganti data resource baru atau menghapus sesi baru.
- Payload API dipertahankan; mutasi menunggu respons server. Data gagal tidak diganti data finansial fiktif.
- React merender teks tanpa raw HTML. CSV menetralkan formula yang berasal dari input tidak tepercaya.
- Sertifikat HTTPS diverifikasi. Dependensi JS/CSS eksternal dari CDN dihapus.
- Deployment Nginx menyertakan CSP, proteksi framing, MIME sniffing, kebijakan referrer, dan cache API yang tidak disimpan.

## Batas dan kewajiban backend

JWT saat ini disimpan di sessionStorage agar kompatibel dengan kontrak bearer backend. Penyimpanan ini dapat diakses JavaScript dan tetap memiliki risiko jika terjadi XSS. Migrasi ke cookie `HttpOnly; Secure; SameSite` membutuhkan perubahan backend dan strategi CSRF yang sesuai.

Dekode token, route guard, dan tombol yang disembunyikan bukan kontrol otorisasi. Backend wajib memverifikasi signature/expiry, kepemilikan data, izin menu, penugasan approval, rate limiting login/OTP, dan revokasi token. Logout idle mencoba revokasi API, tetapi kegagalan jaringan tidak membuktikan token sudah dicabut di server.

CSP memakai `style-src 'unsafe-inline'` untuk style dinamis React; script tetap dibatasi ke same-origin. HSTS dan terminasi HTTPS harus diterapkan oleh ingress produksi. Hasil audit dependensi dan pemindaian WCAG otomatis bukan jaminan seluruh aplikasi bebas kerentanan.

## Pelaporan

Laporkan kerentanan melalui private vulnerability reporting repository bila tersedia, atau hubungi pemilik repository secara privat. Jangan membuka issue publik dengan token, data nasabah, atau langkah eksploitasi terhadap lingkungan aktif.
