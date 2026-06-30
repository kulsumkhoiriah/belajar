import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export async function registerUser(name: string, email: string, password: string) {
  // Check if email already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return { success: false, reason: "email_exists" };
  }

  // Hash password using Bun's built-in bcrypt implementation
  const hashedPassword = await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  // Insert new user
  await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  });

  return { success: true };
}
