import { Elysia } from "elysia";
import { env } from "./config/env";
import { userRoutes } from "./routes/users-route";

export const app = new Elysia()
  .use(userRoutes)
  .get("/", () => ({ message: "Belajar Vibe Coding API is running 🚀" }));

if (process.env.NODE_ENV !== "test") {
  app.listen(env.PORT);
  console.log(
    `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
  );
}
