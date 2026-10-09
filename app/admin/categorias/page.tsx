import { Package, Tags } from "lucide-react";
import { connection } from "next/server";

import { CategoryForm } from "@/components/admin/category-form";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export default async function CategoriesPage() {
  await connection();
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, description, active, products(id)")
    .order("name");

  return (
    <section>
      <div><p className="text-sm font-semibold text-rose-600">Organización</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Categorías</h1><p className="mt-2 text-sm text-stone-500">Crea y consulta las categorías disponibles para tus productos.</p></div>
      <div className="mt-8 grid items-start gap-6 xl:grid-cols-[380px_1fr]">
        <CategoryForm />
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="border-b border-stone-100 px-6 py-5"><h2 className="font-semibold">Categorías registradas</h2><p className="mt-1 text-sm text-stone-500">{categories?.length ?? 0} categorías en total</p></div>
          {categories?.length ? (
            <div className="divide-y divide-stone-100">
              {categories.map((category) => (
                <article key={category.id} className="flex items-center gap-4 px-6 py-5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600"><Tags size={19} /></span>
                  <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{category.name}</h3>{!category.active && <span className="rounded-full bg-stone-100 px-2 py-1 text-xs text-stone-500">Inactiva</span>}</div><p className="mt-1 truncate text-sm text-stone-500">{category.description || `/${category.slug}`}</p></div>
                  <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-600"><Package size={14} /> {category.products.length}</span>
                </article>
              ))}
            </div>
          ) : <p className="p-10 text-center text-sm text-stone-400">Todavía no hay categorías.</p>}
        </div>
      </div>
    </section>
  );
}
