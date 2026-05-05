import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser, logoutUser } from "../services/users-service";

export const userRoutes = new Elysia({ prefix: "/api/users" })
  // Middleware untuk ekstraksi token (DRY)
  .derive(({ headers }) => {
    const authHeader = headers["authorization"];
    const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    return { token };
  })
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const result = await registerUser(body.name, body.email, body.password);
        set.status = 201;
        return { data: result };
      } catch (error: any) {
        if (error.message === "Email sudah terdaftar") {
          set.status = 400;
          return { Error: error.message };
        }
        set.status = 500;
        return { Error: "Internal Server Error" };
      }
    },
    {
      body: t.Object({
        name: t.String({ maxLength: 255 }),
        email: t.String({ format: "email", maxLength: 255 }),
        password: t.String({ minLength: 8, maxLength: 255 }),
      }),
      detail: {
        summary: "Register pengguna baru",
        description: "Mendaftarkan pengguna baru ke sistem dan menyimpannya ke database.",
        tags: ["Users"],
      },
    }
  )
  .post(
    "/login",
    async ({ body, set }) => {
      try {
        const token = await loginUser(body.email, body.password);
        return { data: token };
      } catch (error: any) {
        if (error.message === "Email atau password salah") {
          set.status = 401;
          return { Error: error.message };
        }
        set.status = 500;
        return { Error: "Internal Server Error" };
      }
    },
    {
      body: t.Object({
        email: t.String({ format: "email", maxLength: 255 }),
        password: t.String({ maxLength: 255 }),
      }),
      detail: {
        summary: "Login pengguna",
        description: "Melakukan login pengguna dan mengembalikan token sesi.",
        tags: ["Users"],
      },
    }
  )
  .get("/current", async ({ token, set }) => {
    try {
      if (!token) {
        set.status = 401;
        return { Error: "Unauthorized" };
      }

      const user = await getCurrentUser(token);
      return { data: user };
    } catch (error: any) {
      if (error.message === "Unauthorized") {
        set.status = 401;
        return { Error: "Unauthorized" };
      }
      set.status = 500;
      return { Error: "Internal Server Error" };
    }
  }, {
    detail: {
      summary: "Dapatkan profil pengguna",
      description: "Mengambil data pengguna yang saat ini sedang login berdasarkan token sesi.",
      tags: ["Users"],
    },
  })
  .delete("/logout", async ({ token, set }) => {
    try {
      if (!token) {
        set.status = 401;
        return { Error: "Unauthorized" };
      }

      await logoutUser(token);
      return { data: "OK" };
    } catch (error: any) {
      if (error.message === "Unauthorized") {
        set.status = 401;
        return { Error: "Unauthorized" };
      }
      set.status = 500;
      return { Error: "Internal Server Error" };
    }
  }, {
    detail: {
      summary: "Logout pengguna",
      description: "Menghapus sesi pengguna berdasarkan token yang diberikan.",
      tags: ["Users"],
    },
  });
