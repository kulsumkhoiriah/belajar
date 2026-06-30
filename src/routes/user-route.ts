import { Elysia, t } from "elysia";
import { registerUser, loginUser, logoutUser } from "../services/user-service";
import { auth } from "../middlewares/auth";

export const userRoutes = new Elysia({ prefix: "/api" })
  .post("/users", async ({ body, set }) => {
    const result = await registerUser(body.name, body.email, body.password);

    if (!result.success) {
      if (result.reason === "email_exists") {
        set.status = 400;
        return { message: "Email Sudah Terdaftar" };
      }
      set.status = 500;
      return { message: "Terjadi kesalahan pada server" };
    }

    set.status = 201;
    return { message: "User Berhasil dibuat" };
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String(),
      password: t.String(),
    })
  })
  .post("/users/login", async ({ body, set }) => {
    const result = await loginUser(body.email, body.password);

    if (!result.success) {
      set.status = 400;
      return { message: "Email atau Password salah" };
    }

    set.status = 200;
    return { message: result.token };
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    })
  })
  // Apply auth middleware for protected routes below
  .use(auth)
  .post("/users/current", ({ user, set }) => {
    if (!user) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    set.status = 200;
    return { data: user };
  })
  .delete("/users/logout", async ({ user, token, set }) => {
    if (!user || !token) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    const result = await logoutUser(token);

    if (!result.success) {
      set.status = 401;
      return { error: "Unauthorized" };
    }

    set.status = 200;
    return { data: "OK" };
  });
