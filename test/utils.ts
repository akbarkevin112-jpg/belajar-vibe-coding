import { db } from "../src/db";
import { users, sessions } from "../src/db/schema";
import { sql } from "drizzle-orm";

export const resetDatabase = async () => {
  // Hapus data dari tabel sessions dulu karena ada foreign key ke users (jika ada constraint)
  // Di schema kita tidak eksplisit set FK constraint di level DB (hanya logical di Drizzle), 
  // tapi urutan ini tetap lebih aman.
  await db.delete(sessions);
  await db.delete(users);
};
