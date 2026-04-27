import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function currentUser() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  const user = await db.user.findUnique({ where: { id } });
  return user;
}

export async function requireUser() {
  const user = await currentUser();
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return user;
}
