import { db } from "../db";
import { users, sessions } from "../db/schema";
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

export async function loginUser(email: string, password: string) {
  // Find user by email
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return { success: false };
  }

  // Verify password using Bun's built-in bcrypt verifier
  const isPasswordValid = await Bun.password.verify(password, user.password);
  if (!isPasswordValid) {
    return { success: false };
  }

  // Generate UUID token
  const token = crypto.randomUUID();

  // Save session to database
  await db.insert(sessions).values({
    token,
    userId: user.id,
  });

  return { success: true, token };
}

export async function getCurrentUser(token: string) {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .limit(1);

  if (result.length === 0) {
    return { success: false };
  }

  return { success: true, user: result[0] };
}

export async function logoutUser(token: string) {
  // Check if session exists
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.token, token))
    .limit(1);

  if (!session) {
    return { success: false };
  }

  // Delete session
  await db.delete(sessions).where(eq(sessions.token, token));

  return { success: true };
}


