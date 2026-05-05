# Belajar Vibe Coding API

Belajar Vibe Coding API adalah aplikasi backend sederhana yang menyediakan layanan autentikasi pengguna. Aplikasi ini mengizinkan pengguna untuk mendaftar (register), masuk (login) untuk mendapatkan token sesi, mengambil data pengguna saat ini (current user) berdasarkan token, dan keluar (logout) untuk menghapus sesi dari database.

## Arsitektur dan Struktur File

Proyek ini dibangun dengan struktur modular untuk memisahkan antara konfigurasi, skema database, rute (endpoints), dan logika bisnis (services).

```text
├── drizzle/            # File migrasi database Drizzle ORM
├── src/
│   ├── config/         # Konfigurasi aplikasi (contoh: env.ts untuk environment variables)
│   ├── db/             # Koneksi database dan skema
│   │   ├── index.ts    # Setup koneksi Drizzle ke MySQL
│   │   └── schema.ts   # Definisi skema tabel (users dan sessions)
│   ├── routes/         # Definisi endpoint/rute API (ElysiaJS)
│   │   └── users-route.ts
│   ├── services/       # Logika bisnis dan interaksi dengan database
│   │   └── users-service.ts
│   └── index.ts        # Entry point utama aplikasi Elysia
├── test/               # File unit testing (menggunakan Bun test)
│   ├── users.test.ts
│   └── utils.ts
├── .env                # Variabel environment lokal
├── bun.lock            # Lockfile dependencies dari Bun
├── drizzle.config.ts   # Konfigurasi untuk Drizzle Kit
├── package.json        # Metadata proyek dan daftar dependencies
└── tsconfig.json       # Konfigurasi TypeScript
```

## API yang Tersedia

Semua endpoint berada di bawah prefix `/api/users`.

### 1. Register User
- **URL:** `/api/users/`
- **Method:** `POST`
- **Body:**
  - `name` (string, max 255)
  - `email` (string, format email, max 255)
  - `password` (string, min 8 karakter, max 255)
- **Response Sukses:** `201 Created` mengembalikan data pengguna baru.
- **Response Gagal:** `400 Bad Request` jika email sudah terdaftar, `500 Internal Server Error`.

### 2. Login User
- **URL:** `/api/users/login`
- **Method:** `POST`
- **Body:**
  - `email` (string, format email)
  - `password` (string)
- **Response Sukses:** `200 OK` mengembalikan `token` sesi.
- **Response Gagal:** `401 Unauthorized` jika email atau password salah.

### 3. Get Current User
- **URL:** `/api/users/current`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Response Sukses:** `200 OK` mengembalikan data pengguna saat ini.
- **Response Gagal:** `401 Unauthorized` jika token tidak valid atau tidak ada.

### 4. Logout User
- **URL:** `/api/users/logout`
- **Method:** `DELETE`
- **Headers:** `Authorization: Bearer <token>`
- **Response Sukses:** `200 OK` dengan pesan "OK" (sesi dihapus).
- **Response Gagal:** `401 Unauthorized` jika token tidak valid atau tidak ada.

## Schema Database

Database menggunakan MySQL dengan dua tabel utama:

### Tabel `users`
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `serial` | Primary Key, Auto Increment |
| `name` | `varchar(255)` | Nama pengguna, Tidak Boleh Null |
| `email` | `varchar(255)` | Email pengguna, Unik, Tidak Boleh Null |
| `password` | `varchar(255)` | Password yang di-hash, Tidak Boleh Null |
| `createdAt` | `timestamp` | Waktu pembuatan, Default waktu saat ini |

### Tabel `sessions`
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `serial` | Primary Key, Auto Increment |
| `token` | `varchar(255)` | Token sesi unik, Tidak Boleh Null |
| `userId` | `int` | ID pengguna (relasi ke `users.id`), Tidak Boleh Null |
| `createdAt` | `timestamp` | Waktu pembuatan, Default waktu saat ini |

## Technology Stack

- **Runtime:** [Bun](https://bun.sh/) (Cepat dan terintegrasi)
- **Framework:** [ElysiaJS](https://elysiajs.com/) (Framework web berkinerja tinggi untuk Bun)
- **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/) (ORM TypeScript modern)
- **Database:** MySQL
- **Bahasa Pemrograman:** TypeScript

## Library yang Digunakan
- `elysia` - Core framework web untuk membuat REST API.
- `drizzle-orm` - Library ORM untuk interaksi dengan database MySQL secara *typesafe*.
- `drizzle-kit` - CLI tool untuk menghasilkan (generate) dan menerapkan (migrate) perubahan skema database (dev dependency).
- `mysql2` - Driver database MySQL untuk eksekusi query.
- `bcryptjs` - Library untuk melakukan hashing pada password dengan aman.
- `esbuild` - Bundler (dev dependency).
- `@types/bun`, `@types/bcryptjs` - Definisi tipe data TypeScript.

## Cara Setup Project

1. **Clone repository:**
   ```bash
   git clone <url-repo>
   cd belajar-vibe-coding
   ```
2. **Install dependencies:**
   ```bash
   bun install
   ```
3. **Konfigurasi Environment:**
   Salin file `.env.example` menjadi `.env` dan isi konfigurasi koneksi database MySQL:
   ```bash
   cp .env.example .env
   ```
   *Contoh isi `.env`:*
   ```env
   PORT=3000
   DATABASE_URL="mysql://username:password@localhost:3306/nama_database"
   ```
4. **Setup Database (Generate & Migrate):**
   Pastikan server MySQL Anda berjalan dan database sudah dibuat. Lalu jalankan perintah migrasi Drizzle untuk membuat tabel:
   ```bash
   bun run db:generate
   bun run db:migrate
   ```

## Cara Run Aplikasi

Jalankan perintah berikut untuk menjalankan server dalam mode development. Mode ini akan menggunakan `bun --watch` yang secara otomatis akan me-restart server ketika ada perubahan kode:

```bash
bun run dev
```

Aplikasi akan berjalan di `http://localhost:3000` (atau port lain yang Anda tentukan di `.env`).

## Cara Test Aplikasi

Proyek ini menggunakan test runner bawaan dari Bun (`bun test`). Semua file test berada di dalam folder `test/`. Untuk menjalankan seluruh rangkaian unit test, gunakan perintah:

```bash
bun test
```
