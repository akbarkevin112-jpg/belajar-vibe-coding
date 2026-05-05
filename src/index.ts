import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { env } from "./config/env";
import { userRoutes } from "./routes/users-route";

export const app = new Elysia()
  .use(
    swagger({
      documentation: {
        info: {
          title: "Belajar Vibe Coding API",
          version: "1.0.0",
          description:
            "Dokumentasi interaktif untuk API Autentikasi Belajar Vibe Coding.",
        },
        tags: [
          {
            name: "Users",
            description: "Endpoint untuk autentikasi dan manajemen pengguna",
          },
        ],
      },
    })
  )
  .use(userRoutes)
  .get("/", () => ({ message: "Belajar Vibe Coding API is running 🚀" }));

if (process.env.NODE_ENV !== "test") {
  app.listen(env.PORT);
  console.log(
    `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
  );
}
