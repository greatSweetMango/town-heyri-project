import { requireAdmin } from "@/lib/auth-guard";
import { AdminShell } from "./AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <AdminShell email={session.user.email ?? ""}>{children}</AdminShell>
  );
}
