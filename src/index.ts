import { Elysia } from "elysia";
import { env } from "./config/env";
import { userRoutes } from "./routes/users";

const app = new Elysia()
  .use(userRoutes)
  .get("/", () => ({ message: "Belajar Vibe Coding API is running 🚀" }))
  .listen(env.PORT);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);
