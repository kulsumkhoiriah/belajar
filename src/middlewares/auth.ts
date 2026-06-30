import { Elysia } from "elysia";
import { getCurrentUser } from "../services/user-service";

export const auth = (app: Elysia) =>
  app.derive(async ({ headers, set }) => {
    const authHeader = headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { user: null, token: null };
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return { user: null, token: null };
    }

    const result = await getCurrentUser(token);
    return {
      user: result.success ? result.user : null,
      token: result.success ? token : null,
    };
  });
