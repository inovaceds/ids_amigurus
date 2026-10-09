import Link from "next/link";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/ui/submit-button";
import { createProduct } from "../actions";

export const instant = false;

export default async function NewProductPage() {
  await connection();
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .eq("active", true)
    .order("name");
  const inputClass = "mt-2 w-full rounded-lg border bg-white px-3 py-2 text-stone-900";
  return (
    <section className="max-w-2xl">
      <Link href="/admin/productos" className="text-sm font-medium text-rose-700">← Productos</Link>
      <h1 className="mt-4 text-3xl font-bold">Nuevo producto</h1>
      <form action={createProduct} className="mt-8 space-y-6 rounded-xl border border-stone-200 bg-white p-6">
        <label className="block">
          <span className="text-sm font-medium">Imágenes del producto</span>
          <input
            name="images"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            required
            className="mt-2 block w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-900 file:mr-4 file:rounded-md file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
          />
          <span className="mt-2 block text-xs text-stone-500">Selecciona hasta 8 imágenes. La primera será la portada. JPG, PNG o WebP; máximo 5 MB por archivo.</span>
        </label>
        <label className="block"><span className="text-sm font-medium">Nombre</span><input name="name" placeholder="Ej. Osito de crochet" required minLength={2} maxLength={120} className={inputClass} /></label>
        <label className="block">
          <span className="text-sm font-medium">Categoría</span>
          <select name="categoryId" required defaultValue="" className={inputClass}>
            <option value="" disabled>Selecciona una categoría</option>
            {categories?.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="block"><span className="text-sm font-medium">Descripción</span><textarea name="description" placeholder="Describe los materiales, colores, medidas y detalles de la pieza" rows={5} className={inputClass} /></label>
        <div className="grid gap-5 sm:grid-cols-3">
          <label><span className="text-sm font-medium">Precio MXN</span><input name="price" type="number" min="0" step="0.01" placeholder="350.00" required className={inputClass} /></label>
          <label><span className="text-sm font-medium">Existencias</span><input name="stock" type="number" min="0" step="1" placeholder="0" required className={inputClass} /></label>
          <label><span className="text-sm font-medium">Mínimo</span><input name="minimumStock" type="number" min="0" step="1" placeholder="1" required className={inputClass} /></label>
        </div>
        <label className="block"><span className="text-sm font-medium">Estado</span><select name="status" className={inputClass}><option value="draft">Borrador</option><option value="published">Publicado</option></select></label>
        <SubmitButton pendingText="Creando producto…">Crear producto</SubmitButton>
      </form>
    </section>
  );
}
