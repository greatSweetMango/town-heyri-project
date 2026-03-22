import BottomNav from "@/components/BottomNav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <BottomNav />
      {/* Spacer for bottom nav on mobile */}
      <div className="h-16 md:hidden" />
    </>
  );
}
