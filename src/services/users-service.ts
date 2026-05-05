import { db } from "../db";
import { users, sessions } from "../db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

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
