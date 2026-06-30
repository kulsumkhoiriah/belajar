import { Elysia } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";
import { userRoutes } from "./routes/user-route";

const app = new Elysia()
  .get("/", () => "Hello World via ElysiaJS + Bun!")
  .get("/users", async () => {
    try {
      return await db.select().from(users);
    } catch (error) {
      return { error: "Database connection failed or table does not exist yet." };
    }
  })
  .use(userRoutes)
  .listen(process.env.PORT || 3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

