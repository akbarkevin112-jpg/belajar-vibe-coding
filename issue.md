# Fitur: Logout User (DELETE /api/users/logout)

## Deskripsi
Implementasikan fitur logout untuk user yang sedang login. Fitur ini akan menerima token autentikasi (Bearer token) dari header request, memvalidasinya, dan jika valid, akan **menghapus data session** yang memiliki token tersebut dari tabel `sessions` di database.

---

## API Specification

### Endpoint
`DELETE /api/users/logout`

### Headers
Dibutuhkan header authorization dengan skema Bearer:
```
Authorization: Bearer <token_uuid_dari_proses_login>
```

### Response Body (Success - 200)
```json
{
    "data" : "OK"
}
```
*(Catatan: Selain mengembalikan response ini, token yang bersangkutan harus sudah terhapus dari tabel `sessions`)*

### Response Body (Error - 401 Unauthorized)
*(Digunakan apabila token tidak valid, tidak ditemukan di tabel sessions, atau header Authorization tidak ada)*
```json
{
    "Error" : "Unauthorized"
}
```

---

## Struktur Folder & File

Kode akan ditambahkan pada file yang sudah ada sesuai konvensi:

- **`src/routes/users-route.ts`**: Menangani route HTTP `DELETE /logout`, mengekstrak token dari header `Authorization`, memanggil service, dan mengembalikan response.
- **`src/services/users-service.ts`**: Berisi fungsi logic untuk menghapus record dari tabel `sessions` berdasarkan token.

---

## Tahapan Implementasi

Berikut adalah panduan langkah demi langkah untuk junior programmer atau AI dalam mengimplementasikan fitur ini:

### Tahap 1: Buat Fungsi Logout di Service
Buka file `src/services/users-service.ts`.
1. Buat fungsi baru bernama `logoutUser(token: string)`.
2. Pertama, lakukan pencarian data session di tabel `sessions` berdasarkan `token` menggunakan Drizzle ORM (`db.select()...where(eq(sessions.token, token))`).
3. Jika data session **tidak ditemukan**, lempar error (throw new Error) dengan pesan `"Unauthorized"`.
4. Jika data session **ditemukan**, lakukan operasi delete pada tabel `sessions` di mana `token` sama dengan parameter token. (`db.delete(sessions).where(eq(sessions.token, token))`).
5. Kembalikan string `"OK"`.

### Tahap 2: Tambahkan Endpoint di Route
Buka file `src/routes/users-route.ts`.
1. Tambahkan method `.delete('/logout', ...)` ke dalam instance `userRoutes`.
2. Di dalam handler, ekstrak nilai token dari header melalui parameter `headers`.
3. Validasi skema header: pastikan header `authorization` ada dan dimulai dengan `"Bearer "`. Jika tidak, langsung return status `401` dengan pesan `{ "Error": "Unauthorized" }`.
4. Potong string `"Bearer "` untuk mendapatkan nilai token mentahnya (misal dengan `.replace("Bearer ", "")`).
5. Panggil fungsi `logoutUser(token)` dari `users-service.ts` di dalam blok `try...catch`.
6. Jika berhasil, return `{ data: "OK" }` dengan status HTTP `200`.
7. Jika masuk blok `catch` dan `error.message === "Unauthorized"`, kembalikan status `401` dengan pesan `{ "Error": "Unauthorized" }`.
8. Untuk error tidak terduga lainnya, kembalikan status `500` dengan pesan `{ "Error": "Internal Server Error" }`.

### Tahap 3: Testing Endpoint
Gunakan Postman, cURL, atau Thunder Client untuk menguji endpoint:
1. Lakukan request `POST /api/users/login` untuk mendapatkan token baru.
2. Lakukan request `DELETE /api/users/logout` **tanpa** header `Authorization`. Pastikan mendapat pesan `Unauthorized` (401).
3. Lakukan request `DELETE /api/users/logout` dengan header `Authorization: Bearer <token_asli>`. Pastikan mendapat response 200 OK dengan data `"OK"`.
4. Cek database (opsional) untuk memastikan record di tabel `sessions` dengan token tersebut benar-benar sudah terhapus.
5. Coba lakukan request `GET /api/users/current` dengan token yang baru saja di-logout. Pastikan sekarang mendapat pesan `Unauthorized` (401) karena session sudah tidak ada.

---
## Checklist Implementasi
- [ ] Buat fungsi `logoutUser` di `src/services/users-service.ts` yang melakukan verifikasi dan penghapusan data di tabel `sessions`.
- [ ] Buat endpoint `DELETE /logout` di `src/routes/users-route.ts` yang membaca `Authorization` header.
- [ ] Test skenario berhasil (response 200 OK dan session terhapus).
- [ ] Test skenario error (token tidak ada / token salah / token sudah di-logout).
