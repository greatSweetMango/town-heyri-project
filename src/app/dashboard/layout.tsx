import { requireShopOwnerOrAdmin } from "@/lib/auth-guard";
import { DashboardShell } from "./DashboardShell";
import { SessionWrapper } from "./SessionWrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireShopOwnerOrAdmin();

  return (
    <SessionWrapper>
      <DashboardShell
        user={{
          email: session.user.email!,
          name: session.user.name || undefined,
          role: session.user.role,
          storeId: session.user.storeId || undefined,
        }}
      >
        {children}
      </DashboardShell>
    </SessionWrapper>
  );
}
