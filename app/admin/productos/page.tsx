import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Pencil } from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { DeleteProductButton } from "@/components/admin/delete-product-button";

export const instant = false;

const currency = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

function getCategoryName(value: unknown) {
  if (Array.isArray(value)) return value[0]?.name ?? "Sin categoría";
  if (value && typeof value === "object" && "name" in value) return String(value.name);
  return "Sin categoría";
}

function getPrimaryImage(images: Array<{ storage_path: string; alt_text: string; position: number }>) {
  return images.reduce((primary, image) => image.position < primary.position ? image : primary, images[0]);
}

export default async function AdminProductsPage() {
  await connection();

  const supabase = await createClient();
  const { data: products } = await supabase.from("products")
    .select("id, name, price_cents, stock, status, categories(name), product_images(storage_path, alt_text, position)")
    .order("created_at", { ascending: false });

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-rose-700">Catálogo</p>
          <h1 className="mt-2 text-3xl font-bold">Productos</h1>
        </div>
        <Link href="/admin/productos/nuevo" className="rounded-lg bg-stone-900 px-5 py-3 font-medium text-white">Nuevo producto</Link>
      </div>
      <div className="mt-8 overflow-hidden rounded-xl border border-stone-200 bg-white">
        {products?.length ? (
          <div className="divide-y divide-stone-200">
            {products.map((product) => {
              const primaryImage = getPrimaryImage(product.product_images);
              return (
              <div key={product.id} className="grid grid-cols-[1fr_auto] items-center gap-6 px-5 py-4 sm:grid-cols-[1fr_110px_100px_75px_75px_150px]">
                <div className="flex items-center gap-3">
                  <div className="relative size-12 overflow-hidden rounded-lg bg-amber-100">
                    {primaryImage && (
                      <Image
                        src={supabase.storage.from("product-images").getPublicUrl(primaryImage.storage_path).data.publicUrl}
                        alt={primaryImage.alt_text || product.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    )}
                  </div>
                  <span className="font-medium">{product.name}</span>
                </div>
                <span className="hidden sm:block">{currency.format(product.price_cents / 100)}</span>
                <span className="hidden text-sm text-stone-500 sm:block">{getCategoryName(product.categories)}</span>
                <span>{product.stock} pzas.</span>
                <span className="hidden capitalize text-stone-500 sm:block">{product.status}</span>
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/productos/${product.id}/editar`}
                    aria-label={`Editar ${product.name}`}
                    title="Editar producto"
                    className="grid size-9 place-items-center rounded-lg border border-stone-200 text-stone-600 transition hover:bg-stone-100 hover:text-stone-950"
                  >
                    <Pencil size={17} />
                  </Link>
                  <DeleteProductButton productId={product.id} productName={product.name} />
                </div>
                </div>
              );
            })}
          </div>
        ) : <p className="p-8 text-center text-stone-500">Aún no hay productos registrados.</p>}
      </div>
    </section>
  );
}
