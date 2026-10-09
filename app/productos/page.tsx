import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Productos" };
export const instant = false;

type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  stock: number;
  categories: {
    name: string;
    slug: string;
  } | Array<{
    name: string;
    slug: string;
  }>;
  product_images: Array<{
    storage_path: string;
    alt_text: string;
    position: number;
  }>;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

function getCategoryName(value: Product["categories"]) {
  return Array.isArray(value) ? value[0]?.name ?? "Sin categoría" : value.name;
}

function getPrimaryImage(images: Product["product_images"]) {
  return images.reduce((primary, image) => image.position < primary.position ? image : primary, images[0]);
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  await connection();

  const supabase = await createClient();
  const { categoria } = await searchParams;
  const { data: categoryData } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("active", true)
    .neq("slug", "sin-categoria")
    .order("name");
  const categories = (categoryData ?? []) as Category[];
  const selectedCategory = categories.find((category) => category.slug === categoria);

  let productQuery = supabase
    .from("products")
    .select("id, slug, name, description, price_cents, stock, categories(name, slug), product_images(storage_path, alt_text, position)")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (selectedCategory) productQuery = productQuery.eq("category_id", selectedCategory.id);

  const { data, error } = await productQuery;
  const products = (data ?? []) as unknown as Product[];

  return (
    <main className="min-h-screen bg-amber-50 px-6 py-12 text-stone-900">
      <div className="mx-auto max-w-6xl">
        <header className="mb-12">
          <Link href="/" className="text-sm font-medium text-rose-700">← Inicio</Link>
          <h1 className="mt-4 text-4xl font-bold">Productos</h1>
          <p className="mt-2 text-stone-600">Piezas elaboradas a mano, una puntada a la vez.</p>
        </header>

        <nav aria-label="Filtrar productos por categoría" className="mb-10 flex flex-wrap gap-2">
          <Link
            href="/productos"
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${!selectedCategory ? "bg-stone-900 text-white" : "border border-stone-300 bg-white hover:border-stone-500"}`}
          >
            Todos
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/productos?categoria=${category.slug}`}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${selectedCategory?.id === category.id ? "bg-stone-900 text-white" : "border border-stone-300 bg-white hover:border-stone-500"}`}
            >
              {category.name}
            </Link>
          ))}
        </nav>

        {error ? (
          <div className="rounded-2xl border border-amber-300 bg-white p-8">
            <h2 className="font-semibold">El catálogo aún no está disponible</h2>
            <p className="mt-2 text-sm text-stone-600">Aplica la migración de Supabase para comenzar a publicar productos.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-12 text-center">
            <h2 className="text-xl font-semibold">Próximamente habrá productos</h2>
            <p className="mt-2 text-stone-600">Estamos preparando las primeras piezas de la colección.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const primaryImage = getPrimaryImage(product.product_images);
              return (
              <article key={product.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-rose-100 to-amber-100">
                  {primaryImage && (
                    <Image
                      src={supabase.storage.from("product-images").getPublicUrl(primaryImage.storage_path).data.publicUrl}
                      alt={primaryImage.alt_text || product.name}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  )}
                </div>
                <div className="space-y-3 p-5">
                  <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">{getCategoryName(product.categories)}</span>
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-semibold">{product.name}</h2>
                    <span className="font-semibold">{currency.format(product.price_cents / 100)}</span>
                  </div>
                  <p className="line-clamp-2 text-sm text-stone-600">{product.description || "Pieza tejida a mano."}</p>
                  <p className="text-sm font-medium text-emerald-700">
                    {product.stock > 0 ? `${product.stock} disponible${product.stock === 1 ? "" : "s"}` : "Agotado"}
                  </p>
                  <Link href={`/productos/${product.slug}`} className="inline-flex border-b border-stone-800 pb-1 text-sm font-semibold text-stone-800 transition hover:text-rose-700">
                    Ver detalle →
                  </Link>
                </div>
              </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
