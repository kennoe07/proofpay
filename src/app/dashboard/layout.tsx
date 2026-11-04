import { AppHeader } from "@/components/app-header";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16 sm:px-6">{children}</main>
    </>
  );
}
