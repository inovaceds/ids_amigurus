import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/ui/submit-button";
import { updateProduct } from "../../actions";

export const instant = false;

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("id, name, description, price_cents, stock, minimum_stock, status, category_id, product_images(id, storage_path, alt_text, position)")
      .eq("id", id)
      .maybeSingle(),
    supabase.from("categories").select("id, name").eq("active", true).order("name"),
  ]);

  if (!product) notFound();

  const currentImages = [...product.product_images].sort((a, b) => a.position - b.position);
  const inputClass = "mt-2 w-full rounded-lg border bg-white px-3 py-2 text-stone-900";
  const action = updateProduct.bind(null, product.id);

  return (
    <section className="max-w-2xl">
      <Link href="/admin/productos" className="text-sm font-medium text-rose-700">← Productos</Link>
      <h1 className="mt-4 text-3xl font-bold">Editar producto</h1>
      <form action={action} className="mt-8 space-y-6 rounded-xl border border-stone-200 bg-white p-6">
        <div className="block">
          <span className="text-sm font-medium">Galería actual</span>
          <span className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {currentImages.map((image, index) => {
              const imageUrl = supabase.storage.from("product-images").getPublicUrl(image.storage_path).data.publicUrl;
              return (
                <span key={image.id} className="relative overflow-hidden rounded-lg border bg-amber-100">
                  <span className="relative block aspect-square"><Image src={imageUrl} alt={image.alt_text || `${product.name} ${index + 1}`} fill className="object-cover" sizes="200px" /></span>
                  <label htmlFor={`remove-${image.id}`} className="flex cursor-pointer items-center gap-2 bg-white px-3 py-2 text-xs">
                    <input id={`remove-${image.id}`} name="removeImageIds" type="checkbox" value={image.id} className="size-4 accent-red-600" />
                    <span>{index === 0 ? "Portada · " : ""}Eliminar</span>
                  </label>
                </span>
              );
            })}
          </span>
          <span className="mt-5 block text-sm font-medium">Agregar imágenes</span>
          <input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple className="mt-2 block w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-900 file:mr-4 file:rounded-md file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white" />
          <span className="mt-2 block text-xs text-stone-500">Puedes conservar, eliminar o agregar imágenes. Máximo 8 en total y 5 MB por archivo.</span>
        </div>
        <label className="block"><span className="text-sm font-medium">Nombre</span><input name="name" defaultValue={product.name} placeholder="Ej. Osito de crochet" required minLength={2} maxLength={120} className={inputClass} /></label>
        <label className="block">
          <span className="text-sm font-medium">Categoría</span>
          <select name="categoryId" required defaultValue={product.category_id} className={inputClass}>
            {categories?.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>
        <label className="block"><span className="text-sm font-medium">Descripción</span><textarea name="description" defaultValue={product.description} placeholder="Describe los materiales, colores, medidas y detalles de la pieza" rows={5} className={inputClass} /></label>
        <div className="grid gap-5 sm:grid-cols-3">
          <label><span className="text-sm font-medium">Precio MXN</span><input name="price" type="number" min="0" step="0.01" defaultValue={product.price_cents / 100} required className={inputClass} /></label>
          <label><span className="text-sm font-medium">Existencias</span><input name="stock" type="number" min="0" step="1" defaultValue={product.stock} required className={inputClass} /></label>
          <label><span className="text-sm font-medium">Avisar cuando queden</span><input name="minimumStock" type="number" min="0" step="1" defaultValue={product.minimum_stock} required className={inputClass} /></label>
        </div>
        <label className="block">
          <span className="text-sm font-medium">Estado</span>
          <select name="status" defaultValue={product.status} className={inputClass}>
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
        </label>
        <div className="flex gap-3">
          <SubmitButton pendingText="Guardando cambios…">Guardar cambios</SubmitButton>
          <Link href="/admin/productos" className="rounded-lg border px-5 py-3 font-medium">Cancelar</Link>
        </div>
      </form>
    </section>
  );
}
