import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

/**
 * Mendaftarkan pengguna baru ke dalam database.
 * Melakukan pengecekan email duplikat, hashing password, lalu menyimpan data pengguna.
 * 
 * @param name - Nama pengguna
 * @param email - Alamat email pengguna
 * @param password - Kata sandi pengguna
 * @returns String "OK" jika registrasi berhasil
 * @throws Error jika email sudah terdaftar
 */
export const registerUser = async (name: string, email: string, password: string) => {
  // 1. Cek duplikat email
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser) {
    throw new Error("Email sudah terdaftar");
  }

  // 2. Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. Insert ke database
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  // 4. Return hasil
  return "OK";
};

/**
 * Melakukan proses login pengguna.
 * Memvalidasi kredensial pengguna, menghasilkan token sesi, dan menyimpannya di database.
 * 
 * @param email - Alamat email pengguna
 * @param password - Kata sandi pengguna
 * @returns Token sesi (UUID) yang dihasilkan jika login berhasil
 * @throws Error jika email atau kata sandi tidak cocok
 */
export const loginUser = async (email: string, password: string) => {
  // 1. Cari User
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  // 2. Validasi Eksistensi
  if (!user) {
    throw new Error("Email atau password salah");
  }

  // 3. Cek Password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Email atau password salah");
  }

  // 4. Generate Token
  const token = crypto.randomUUID();

  // 5. Simpan Session
  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  // 6. Return
  return token;
};

/**
 * Mengambil informasi pengguna yang saat ini sedang login berdasarkan token sesi.
 * 
 * @param token - Token sesi pengguna
 * @returns Objek berisi id, nama, email, dan waktu pembuatan akun pengguna
 * @throws Error jika token tidak valid atau tidak ditemukan (Unauthorized)
 */
export const getCurrentUser = async (token: string) => {
  const [result] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token));

  if (!result) {
    throw new Error("Unauthorized");
  }

  return result;
};

/**
 * Mengeluarkan pengguna (logout) dengan cara menghapus token sesi mereka dari database.
 * 
 * @param token - Token sesi yang akan dihapus
 * @returns String "OK" jika penghapusan berhasil dilakukan
 */
export const logoutUser = async (token: string) => {
  // Langsung delete session. Jika token tidak ada, delete tidak akan melakukan apa-apa (idempotent).
  const result = await db.delete(sessions).where(eq(sessions.token, token));
  
  return "OK";
};
