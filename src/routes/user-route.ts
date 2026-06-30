import { Elysia, t } from "elysia";
import { registerUser, loginUser } from "../services/user-service";

export const userRoutes = new Elysia({ prefix: "/api" })
  .post("/users", async ({ body, set }) => {
    const { name, email, password } = body;

    const result = await registerUser(name, email, password);

    if (!result.success) {
      if (result.reason === "email_exists") {
        set.status = 400; // Or 409 Conflict
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
    const { email, password } = body;

    const result = await loginUser(email, password);

    if (!result.success) {
      set.status = 400; // Or 401 Unauthorized
      return { message: "Email atau Password salah" };
    }

    set.status = 200;
    return { message: result.token };
  }, {
    body: t.Object({
      email: t.String(),
      password: t.String(),
    })
  });
