import { Elysia, t } from "elysia";
import { registerUser, loginUser, getCurrentUser } from "../services/users-service";

export const userRoutes = new Elysia({ prefix: "/api/users" })
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
        name: t.String(),
        email: t.String(),
        password: t.String(),
      }),
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
        email: t.String(),
        password: t.String(),
      }),
    }
  )
  .get("/current", async ({ headers, set }) => {
    try {
      const authHeader = headers["authorization"];
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        set.status = 401;
        return { Error: "Unauthorized" };
      }

      const token = authHeader.replace("Bearer ", "");
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
  });
