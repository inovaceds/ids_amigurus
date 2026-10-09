import { redirect } from "next/navigation";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";

export const instant = false;

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await connection();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) redirect("/auth/admin-login");

  const { data: role } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.claims.sub)
    .maybeSingle();

  if (role?.role !== "admin") redirect("/productos");

  return <AdminShell userEmail={String(data.claims.email ?? "Administrador")}>{children}</AdminShell>;
}
