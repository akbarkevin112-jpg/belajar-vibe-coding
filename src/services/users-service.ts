import { db } from "../db";
import { users } from "../db/schema";
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
