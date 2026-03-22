import { Form, useActionData } from "react-router";
import type { Route } from "./+types/register";
import { db } from "~/db";
import { users } from "~/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { createUserSession } from "app/server.session";
import { error } from "console";

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  if (!username || !email || !password)
    return { error: "Tüm alanları doldurun lütfen" };
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) return { error: "Bu kullanıcı zaten mevcut" };
  const hashedPassword = await bcrypt.hash(password, 10);
  const [newUser] = await db
    .insert(users)
    .values({ username, email, passwordHash: hashedPassword })
    .returning();
  return createUserSession(newUser.id, "/dashboard");
}

export default function Register() {
  const actionData = useActionData<typeof action>();
  const error = actionData?.error;
  return (
    <Form method="post">
      <input name="username" type="username" />
      <input name="email" type="email" />
      <input name="password" type="password" />
      <input type="submit" />
      
    </Form>
  );
}
