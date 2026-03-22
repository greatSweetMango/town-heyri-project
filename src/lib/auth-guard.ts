import { redirect } from "next/navigation";
import { auth } from "./auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");
  return session;
}

export async function requireShopOwnerOrAdmin() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "SHOP_OWNER" && session.user.role !== "ADMIN") redirect("/");
  return session;
}
