# Fitur: Dapatkan Data User Saat Ini (GET /api/users/current)

## Deskripsi
Implementasikan fitur untuk mendapatkan data profil user yang sedang login berdasarkan token autentikasi (Bearer token). API ini akan membaca token dari header request, memvalidasinya melalui tabel `sessions`, lalu mengembalikan data user dari tabel `users`.

---

## API Specification

### Endpoint
`GET /api/users/current`

### Headers
Dibutuhkan header authorization dengan skema Bearer:
```
Authorization: Bearer <token_uuid_dari_proses_login>
```

### Response Body (Success - 200)
```json
{
    "data" : {
        "id": 1,
        "name": "kevin",
        "email": "kevin@localhost",
        "created_at": "2026-05-05T08:00:00.000Z"
    }
}
```

### Response Body (Error - 401 Unauthorized)
*(Digunakan apabila token tidak valid, tidak ditemukan di tabel sessions, atau header Authorization tidak ada)*
```json
{
    "Error" : "Unauthorized"
}
```

---

## Struktur Folder & File

Sesuai dengan arsitektur saat ini, kita akan menambahkan kode pada:

- **`src/routes/users-route.ts`**: Menangani route HTTP `GET /current`, mengekstrak token dari header `Authorization`, dan mengembalikan response.
- **`src/services/users-service.ts`**: Berisi fungsi logic utama untuk mencari user berdasarkan token di tabel `sessions`.

---

## Tahapan Implementasi

Berikut adalah panduan langkah demi langkah untuk junior programmer atau AI dalam mengimplementasikan fitur ini:

### Tahap 1: Buat Fungsi Pencarian User di Service
Buka file `src/services/users-service.ts`.
1. Buat fungsi baru bernama `getCurrentUser(token: string)`.
2. Lakukan query join menggunakan Drizzle ORM antara tabel `sessions` dan tabel `users` berdasarkan `sessions.userId = users.id`, dengan kondisi `sessions.token = token`. 
   *(Alternatif jika belum terbiasa dengan join: cari dulu `userId` di tabel `sessions`, jika ada, cari data di tabel `users` berdasarkan `userId` tersebut).*
3. Jika data tidak ditemukan (token tidak valid atau expired), lempar pesan error (throw new Error) `"Unauthorized"`.
4. Jika data ditemukan, kembalikan objek berisi `id`, `name`, `email`, dan `createdAt` dari tabel `users`. **Pastikan kolom `password` TIDAK di-return**.

### Tahap 2: Tambahkan Endpoint di Route
Buka file `src/routes/users-route.ts`.
1. Tambahkan method `.get('/current', ...)` ke dalam instance `userRoutes`.
2. Di dalam handler, ekstrak nilai token dari header. Di Elysia JS, kamu dapat mengambil header melalui parameter `headers`.
3. Validasi skema header: pastikan header `authorization` ada dan dimulai dengan `"Bearer "`. Jika tidak, return status `401` dengan pesan `{ "Error": "Unauthorized" }`.
4. Potong string `"Bearer "` untuk mendapatkan nilai token mentahnya (menggunakan `.replace("Bearer ", "")` atau `split(" ")[1]`).
5. Panggil fungsi `getCurrentUser(token)` dari `users-service.ts` di dalam blok `try...catch`.
6. Jika berhasil, return `{ data: user }` dengan status HTTP `200`.
7. Jika masuk blok `catch` dan `error.message === "Unauthorized"`, kembalikan status `401` dengan pesan `{ "Error": "Unauthorized" }`.
8. Untuk error lain, kembalikan status `500` (Internal Server Error).

### Tahap 3: Testing Endpoint
Gunakan Postman, cURL, atau Thunder Client untuk menguji endpoint:
1. Lakukan request `POST /api/users/login` terlebih dahulu untuk mendapatkan token.
2. Lakukan request `GET /api/users/current` **tanpa** header `Authorization`. Pastikan mendapat pesan `Unauthorized` (401).
3. Lakukan request `GET /api/users/current` dengan header `Authorization: Bearer <token_asal_asalan>`. Pastikan mendapat pesan `Unauthorized` (401).
4. Lakukan request `GET /api/users/current` dengan header `Authorization: Bearer <token_asli>`. Pastikan mendapat response 200 OK dengan detail data profil user.

---
## Checklist Implementasi
- [ ] Buat fungsi `getCurrentUser` di `src/services/users-service.ts` (pastikan password tidak ikut terkirim)
- [ ] Buat endpoint `GET /current` di `src/routes/users-route.ts` yang membaca `Authorization` header
- [ ] Test skenario berhasil
- [ ] Test skenario error (token tidak ada / token salah)
