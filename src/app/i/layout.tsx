import { AppHeader } from "@/components/app-header";

export default function InvoiceLayout({ children }: LayoutProps<"/i">) {
  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-16 sm:px-6">{children}</main>
    </>
  );
}
