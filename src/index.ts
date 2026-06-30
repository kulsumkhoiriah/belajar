import { Elysia, t } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";

const app = new Elysia()
  .get("/", () => "Hello World via ElysiaJS + Bun!")
  .get("/users", async () => {
    try {
      return await db.select().from(users);
    } catch (error) {
      return { error: "Database connection failed or table does not exist yet." };
    }
  })
  .post("/users", async ({ body }) => {
    try {
      await db.insert(users).values(body);
      return { success: true, message: "User created successfully" };
    } catch (error) {
      return { error: "Failed to insert user into database." };
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
    })
  })
  .listen(process.env.PORT || 3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
