# Fitur: Unit Testing untuk Seluruh API

## Deskripsi
Tugas ini bertujuan untuk menambahkan *unit tests* menggunakan framework bawaan **Bun Test** (`bun test`) guna memastikan kualitas dan keandalan fungsionalitas API yang sudah ada. Semua file *test* harus disimpan di dalam folder `test/`.

> **PENTING:** Setiap kali sebelum menjalankan sebuah skenario *test*, pastikan untuk menghapus data di dalam tabel (seperti tabel `users` dan `sessions`) yang berkaitan dengan *test* tersebut. Tujuannya adalah agar *test* berjalan di *environment* yang konsisten dan terhindar dari *flaky tests* (error karena sisa data dari test sebelumnya).

---

## Daftar Skenario Pengujian per API

Berikut adalah skenario pengujian minimal yang harus diimplementasikan untuk setiap endpoint. Silakan kembangkan atau tambahkan detail implementasinya.

### 1. Registrasi User (`POST /api/users`)
- **[SUKSES]** Registrasi dengan payload yang valid (name, email format benar, password cukup panjang) berhasil dan mengembalikan status 201.
- **[GAGAL]** Registrasi dengan email yang sama (duplikat) gagal dengan pesan error (400).
- **[GAGAL]** Registrasi gagal karena format email salah (422).
- **[GAGAL]** Registrasi gagal karena panjang password kurang dari batas minimum (422).
- **[GAGAL]** Registrasi gagal karena nama terlalu panjang melebihi 255 karakter (422).

### 2. Login User (`POST /api/users/login`)
- **[SUKSES]** Login dengan kredensial email dan password yang valid berhasil mengembalikan token session (200).
- **[GAGAL]** Login dengan email yang tidak terdaftar gagal (401 Unauthorized).
- **[GAGAL]** Login dengan email benar tetapi password salah gagal (401).
- **[GAGAL]** Login dengan format email yang tidak valid gagal di level validasi input (422).

### 3. Get Current User (`GET /api/users/current`)
- **[SUKSES]** Request data profil dengan menyertakan `Bearer <token>` yang valid dan aktif berhasil mengembalikan detail user tanpa *password* (200).
- **[GAGAL]** Request gagal jika tidak menyertakan header `Authorization` sama sekali (401).
- **[GAGAL]** Request gagal jika header `Authorization` tidak menggunakan format `Bearer ` (401).
- **[GAGAL]** Request gagal jika token tidak ditemukan di database (token salah atau *invalid*) (401).

### 4. Logout User (`DELETE /api/users/logout`)
- **[SUKSES]** Logout dengan `Bearer <token>` yang valid berhasil menghapus session di database dan mereturn status 200.
- **[GAGAL]** Logout dengan token yang salah atau tidak terdaftar di database gagal (401).
- **[GAGAL]** Logout tanpa menyertakan header `Authorization` gagal (401).
- **[GAGAL]** Percobaan melakukan `GET /current` menggunakan token yang *baru saja di-logout* akan gagal (membuktikan session benar-benar hilang).

---

## Petunjuk Eksekusi
Bagi developer / AI yang akan mengerjakan *issue* ini:
1. Buat folder `test` (jika belum ada).
2. Buat file-file *test* (misal `users.test.ts` atau dipisah per endpoint).
3. Buat utilitas fungsi untuk *reset/truncate* tabel database dan panggil fungsi tersebut di dalam *lifecycle hook* bun test (`beforeEach` atau `afterEach`).
4. Tulis implementasi *test cases* secara bebas sesuai dengan skenario di atas menggunakan *assertion* dari `bun:test`.
