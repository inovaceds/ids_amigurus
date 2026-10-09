"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type CategoryFormState = { status: "idle" | "success" | "error"; message: string };

function createSlug(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function createCategory(_state: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) redirect("/auth/admin-login");

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const slug = createSlug(name);

  if (name.length < 2 || name.length > 80 || !slug) {
    return { status: "error", message: "Escribe un nombre de categoría válido." };
  }

  const { error } = await supabase.from("categories").insert({ name, slug, description });
  if (error?.code === "23505") return { status: "error", message: "Ya existe una categoría con ese nombre." };
  if (error) return { status: "error", message: `No fue posible crear la categoría: ${error.message}` };

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos/nuevo");
  revalidatePath("/productos");
  return { status: "success", message: "Categoría creada correctamente." };
}
