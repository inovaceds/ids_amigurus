import { ArrowLeft, Check, Heart, MessageCircle, PackageCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { ProductGallery } from "@/components/product-gallery";

export const instant = false;

type CategoryRelation = { name: string; slug: string } | Array<{ name: string; slug: string }>;

function getCategory(value: CategoryRelation) {
  return Array.isArray(value) ? value[0] : value;
}

const currency = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
});

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, slug, description, price_cents, stock, minimum_stock, categories(name, slug), product_images(storage_path, alt_text, position)")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (!data) notFound();

  const product = data as unknown as {
    id: string;
    name: string;
    slug: string;
    description: string;
    price_cents: number;
    stock: number;
    minimum_stock: number;
    categories: CategoryRelation;
    product_images: Array<{ storage_path: string; alt_text: string; position: number }>;
  };
  const category = getCategory(product.categories);
  const galleryImages = [...product.product_images]
    .sort((a, b) => a.position - b.position)
    .map((image, index) => ({
      url: supabase.storage.from("product-images").getPublicUrl(image.storage_path).data.publicUrl,
      alt: image.alt_text || `${product.name} - imagen ${index + 1}`,
    }));
  const whatsappMessage = encodeURIComponent(`Hola, me interesa el producto ${product.name}. ¿Podrían darme más información?`);

  return (
    <main className="min-h-screen bg-[#faf8f5] text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
          <Link href="/" className="font-serif text-2xl font-semibold">Amigurus<span className="text-rose-600">.</span></Link>
          <Link href="/productos" className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-950"><ArrowLeft size={17} /> Catálogo</Link>
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10 lg:py-12">
        <nav aria-label="Ruta de navegación" className="mb-7 flex items-center gap-2 overflow-hidden text-sm text-stone-400">
          <Link href="/" className="hover:text-stone-700">Inicio</Link><span>/</span><Link href="/productos" className="hover:text-stone-700">Productos</Link><span>/</span><span className="truncate text-stone-600">{product.name}</span>
        </nav>

        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_16px_60px_rgba(51,43,38,0.07)]">
          <div className="grid lg:grid-cols-2">
            <div className="bg-[#f3f0ec]"><ProductGallery images={galleryImages} productName={product.name} /></div>

            <div className="flex flex-col p-6 sm:p-10 lg:p-12 xl:p-14">
              <div>
                {category && <Link href={`/productos?categoria=${category.slug}`} className="text-xs font-bold uppercase tracking-[0.18em] text-rose-600 hover:text-rose-800">{category.name}</Link>}
                <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">{product.name}</h1>
                <p className="mt-5 text-3xl font-bold tracking-tight">{currency.format(product.price_cents / 100)}</p>
              </div>

              <div className="mt-7 rounded-2xl border border-stone-200 bg-[#faf9f7] p-5">
                <div className="flex items-center gap-4">
                  <span className={`grid size-11 shrink-0 place-items-center rounded-full ${product.stock > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}><PackageCheck size={21} /></span>
                  <div className="flex-1"><p className="font-semibold">{product.stock > 0 ? "Disponible para pedido" : "Agotado temporalmente"}</p><p className="mt-1 text-sm text-stone-500">{product.stock > 0 ? `${product.stock} pieza${product.stock === 1 ? "" : "s"} disponible${product.stock === 1 ? "" : "s"}` : "Consulta el tiempo estimado de elaboración"}</p></div>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-400">Descripción</h2>
                <p className="mt-3 whitespace-pre-line text-base leading-8 text-stone-600">{product.description || "Pieza tejida cuidadosamente a mano, creada para acompañar momentos especiales."}</p>
              </div>

              <div className="mt-8 space-y-3 border-t border-stone-200 pt-7 text-sm text-stone-600">
                <p className="flex items-center gap-3"><Check size={17} className="text-emerald-600" /> Elaborado artesanalmente</p>
                <p className="flex items-center gap-3"><Check size={17} className="text-emerald-600" /> Cada pieza puede tener variaciones únicas</p>
                <p className="flex items-center gap-3"><Check size={17} className="text-emerald-600" /> Atención personalizada antes de confirmar</p>
              </div>

              <div className="mt-auto pt-9">
                <a href={`https://wa.me/?text=${whatsappMessage}`} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 px-7 py-4 font-semibold text-white transition hover:bg-rose-700">
                  <MessageCircle size={20} /> Consultar este producto
                </a>
                <p className="mt-3 text-center text-xs leading-5 text-stone-400">Te ayudaremos a confirmar disponibilidad, detalles y tiempo de entrega.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-600"><Heart size={18} /></span><div><p className="text-sm font-semibold">Creado con cariño</p><p className="mt-1 text-xs text-stone-500">Puntada a puntada</p></div></div>
          <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-600"><Sparkles size={18} /></span><div><p className="text-sm font-semibold">Pieza única</p><p className="mt-1 text-xs text-stone-500">Detalles artesanales</p></div></div>
          <div className="flex items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5"><span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600"><MessageCircle size={18} /></span><div><p className="text-sm font-semibold">Atención directa</p><p className="mt-1 text-xs text-stone-500">Resolvemos tus dudas</p></div></div>
        </section>
      </div>
    </main>
  );
}
