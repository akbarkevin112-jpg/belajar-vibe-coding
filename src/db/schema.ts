import {
  mysqlTable,
  int,
  varchar,
  timestamp,
  serial,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = mysqlTable("sessions", {
  id: serial().primaryKey(),
  token: varchar({ length: 255 }).notNull(),
  userId: int("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
