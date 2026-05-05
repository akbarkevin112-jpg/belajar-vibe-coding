import { Elysia, t } from "elysia";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const userRoutes = new Elysia({ prefix: "/users" })
  // GET /users — list all
  .get("/", async () => {
    const allUsers = await db.select().from(users);
    return allUsers;
  })

  // GET /users/:id — get by id
  .get(
    "/:id",
    async ({ params, set }) => {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, Number(params.id)));

      if (!user) {
        set.status = 404;
        return { message: "User not found" };
      }

      return user;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )

  // POST /users — create
  .post(
    "/",
    async ({ body, set }) => {
      const result = await db.insert(users).values({
        name: body.name,
        email: body.email,
      });

      set.status = 201;
      return { message: "User created", id: Number(result[0].insertId) };
    },
    {
      body: t.Object({
        name: t.String(),
        email: t.String(),
      }),
    }
  )

  // PUT /users/:id — update
  .put(
    "/:id",
    async ({ params, body, set }) => {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.id, Number(params.id)));

      if (!existing) {
        set.status = 404;
        return { message: "User not found" };
      }

      await db
        .update(users)
        .set({ name: body.name, email: body.email })
        .where(eq(users.id, Number(params.id)));

      return { message: "User updated" };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        name: t.String(),
        email: t.String(),
      }),
    }
  )

  // DELETE /users/:id — delete
  .delete(
    "/:id",
    async ({ params, set }) => {
      const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.id, Number(params.id)));

      if (!existing) {
        set.status = 404;
        return { message: "User not found" };
      }

      await db.delete(users).where(eq(users.id, Number(params.id)));

      return { message: "User deleted" };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  );
