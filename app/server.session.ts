// app/session.server.ts
import { createCookieSessionStorage, redirect } from "react-router";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET!],
    secure: process.env.NODE_ENV === "production",
  },
});

// Session'a kullanıcı id'si kaydet
export async function createUserSession(userId: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

// Mevcut session'dan kullanıcıyı getir
export async function getUser(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  const userId = session.get("userId");
  if (!userId) return null;

  return db.query.users.findFirst({
    where: eq(users.id, userId),
  });
}

// Giriş yapmamışsa login'e yönlendir
export async function requireUser(request: Request) {
  const user = await getUser(request);
  if (!user) throw redirect("/login");
  return user;
}

// Çıkış yap
export async function logout(request: Request) {
  const session = await sessionStorage.getSession(request.headers.get("Cookie"));
  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}