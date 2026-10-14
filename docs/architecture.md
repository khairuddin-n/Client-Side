# Arsitektur frontend

## Batas tanggung jawab

`app` mengatur entry dan routing. Halaman dimuat secara lazy, sehingga workspace admin dan pembuat PDF tidak dimuat saat login.

Setiap feature menyimpan adapter API, halaman, dan komponen domainnya sendiri. `shared` berisi HTTP client, layout, dialog, portofolio rekening, dan riwayat transaksi yang dipakai beberapa produk. Import internal memakai alias `@/`. Komponen tidak membuat Axios client sendiri.

Feature rekening tetap bernama `card` agar asal route lama mudah dikenali; UI menampilkan rekening, bukan kartu debit fiktif. `/mycard` diarahkan ke halaman rekening aktif. Route lama lainnya dipertahankan.

## Aliran data

1. Adapter feature memanggil endpoint backend dan mempertahankan nama field/payload API.
2. `useAsyncResource` mengelola loading/error, retry, pembatalan, dan kepemilikan respons. Respons request lama diabaikan saat resource berubah atau komponen unmount.
3. Halaman menormalisasi data ke props komponen bersama.
4. `useAsyncAction` mengunci submission yang sedang berjalan. Perubahan pembayaran, blokir, atau approval baru ditampilkan setelah server menerima operasi dan data dimuat ulang.

Kegagalan API tidak diganti data demo. Saldo nol, tidak ada data, error, dan loading memiliki tampilan berbeda. Token, password, dan respons API tidak dicetak ke console.

## Kontrak backend yang diperiksa

| Kebutuhan                           | Endpoint / respons                                                |
| ----------------------------------- | ----------------------------------------------------------------- |
| Daftar rekening lengkap             | POST `/api/v1/savings`, `accountList`                             |
| Detail rekening terpilih di backend | POST `/api/v1/account`, `data.targetAccountDetail`; bukan array   |
| Riwayat transaksi                   | POST `/api/v1/trx-history`, `transaction`                         |
| Life goal detail                    | POST `/api/v1/lifegoals-detail`, field `disbursmentAccountNumber` |
| Daftar aktivitas admin              | GET `/api/admin/activity/list`, field `actionFlow`                |
| Izin menu                           | GET `/api/admin/menu-access`, field `menu_id` dan `action_flow`   |

Pengambilan rekening memakai endpoint daftar tabungan agar semua rekening diperoleh dalam satu request tanpa N+1 request ke endpoint detail. ID rekening, tagihan, nasabah, dan aktivitas di URL membuat halaman detail dapat dipulihkan setelah refresh. Location state lama tetap didukung untuk kompatibilitas.

## Autentikasi dan izin

`session.js` menjadi pusat penyimpanan dan pembersihan sesi. Token harus bisa didekode, belum kedaluwarsa, dan memiliki peran yang dikenali. Role dari field sessionStorage terpisah tidak dipakai sebagai sumber routing.

Dekode JWT hanya untuk UX; browser tidak memverifikasi signature. Server wajib memverifikasi signature/expiry serta otorisasi kepemilikan rekening, nasabah, menu, dan workflow pada setiap request.

HTTP client menambahkan bearer token ke endpoint relatif `/api/`, memiliki timeout, dan membersihkan sesi pada 401 yang berasal dari token aktif. Respons 401 milik token lama tidak menghapus sesi baru. Endpoint login/reset tidak membawa bearer token. Idle logout membersihkan sesi segera dan mencoba revokasi backend tanpa menunggu respons; kedaluwarsa JWT juga mengakhiri sesi meskipun pengguna aktif.

UI blokir mengikuti izin menu yang dimuat dari API. UI approval hanya tersedia untuk checker/approver yang ditugaskan pada tahap aktif. Ini bukan pengganti kontrol server.

## UI dan aksesibilitas

Design tokens berada di `shared/styles/base`. Halaman menggunakan layout dan state bersama; styling autentikasi tidak lagi mengubah seluruh body aplikasi.

Navigasi, formulir, dan tabel menggunakan elemen semantik. Dialog memiliki nama, focus trap, Escape, pengembalian fokus, dan membuat konten latar inert. OTP menggunakan satu input dengan `inputMode=numeric` dan `autocomplete=one-time-code`, sehingga mendukung paste dan autofill. Animasi mengikuti `prefers-reduced-motion`.

Grafik dekoratif dan dependensi yang tidak diperlukan diganti ringkasan serta progress semantik. Tidak ada iklan/notifikasi dummy atau klaim perubahan password yang tidak diproses server.
