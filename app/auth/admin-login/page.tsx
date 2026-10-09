import Link from "next/link";

import { AdminLoginForm } from "@/components/admin-login-form";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-amber-50 px-6 py-12 text-stone-900">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 inline-block text-sm font-medium text-rose-700">← Volver a la tienda</Link>
        <AdminLoginForm />
      </div>
    </main>
  );
}
