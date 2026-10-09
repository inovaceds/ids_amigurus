import { Boxes, CircleDollarSign, Package, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";

export const instant = false;

type DashboardProduct = {
  id: string;
  name: string;
  price_cents: number;
  stock: number;
  minimum_stock: number;
  status: "draft" | "published" | "archived";
  categories: { name: string } | Array<{ name: string }>;
};

const currency = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 });

function getCategoryName(value: DashboardProduct["categories"]) {
  return Array.isArray(value) ? value[0]?.name ?? "Sin categoría" : value.name;
}

export default async function AdminPage() {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, price_cents, stock, minimum_stock, status, categories(name)")
    .order("stock", { ascending: true });
  const products = (data ?? []) as unknown as DashboardProduct[];

  const totalUnits = products.reduce((total, product) => total + product.stock, 0);
  const inventoryValue = products.reduce((total, product) => total + product.price_cents * product.stock, 0);
  const lowStock = products.filter((product) => product.stock <= product.minimum_stock);
  const published = products.filter((product) => product.status === "published").length;

  const inventoryByCategory = Array.from(
    products.reduce((groups, product) => {
      const category = getCategoryName(product.categories);
      groups.set(category, (groups.get(category) ?? 0) + product.stock);
      return groups;
    }, new Map<string, number>()),
  ).sort((a, b) => b[1] - a[1]);
  const maxCategoryStock = Math.max(...inventoryByCategory.map(([, stock]) => stock), 1);

  const metrics = [
    { label: "Productos", value: products.length.toString(), detail: `${published} publicados`, icon: Package, color: "bg-rose-50 text-rose-600" },
    { label: "Piezas en inventario", value: totalUnits.toString(), detail: "Unidades disponibles", icon: Boxes, color: "bg-amber-50 text-amber-600" },
    { label: "Valor del inventario", value: currency.format(inventoryValue / 100), detail: "Precio de venta acumulado", icon: CircleDollarSign, color: "bg-emerald-50 text-emerald-600" },
    { label: "Inventario bajo", value: lowStock.length.toString(), detail: "Productos por atender", icon: TriangleAlert, color: "bg-red-50 text-red-600" },
  ];

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-sm font-semibold text-rose-600">Resumen general</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-stone-500">Una vista rápida del catálogo y sus existencias.</p>
        </div>
        <Link href="/admin/productos/nuevo" className="rounded-xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600">Nuevo producto</Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article key={metric.label} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-sm font-medium text-stone-500">{metric.label}</p><strong className="mt-2 block text-3xl font-bold tracking-tight">{metric.value}</strong></div>
                <span className={`grid size-11 place-items-center rounded-xl ${metric.color}`}><Icon size={21} /></span>
              </div>
              <p className="mt-4 text-xs text-stone-400">{metric.detail}</p>
            </article>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div><h2 className="text-lg font-semibold">Inventario por categoría</h2><p className="mt-1 text-sm text-stone-500">Cantidad de piezas disponibles.</p></div>
          <div className="mt-8 space-y-5">
            {inventoryByCategory.length ? inventoryByCategory.map(([category, stock]) => (
              <div key={category}>
                <div className="mb-2 flex items-center justify-between text-sm"><span className="font-medium">{category}</span><span className="text-stone-500">{stock} pzas.</span></div>
                <div className="h-3 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-rose-500" style={{ width: `${Math.max((stock / maxCategoryStock) * 100, stock ? 5 : 0)}%` }} /></div>
              </div>
            )) : <p className="py-12 text-center text-sm text-stone-400">Agrega productos para visualizar el inventario.</p>}
          </div>
        </article>

        <article className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold">Atención de inventario</h2><p className="mt-1 text-sm text-stone-500">Productos en su nivel mínimo.</p></div><Link href="/admin/productos" className="text-sm font-semibold text-rose-600">Ver todos</Link></div>
          <div className="mt-6 divide-y divide-stone-100">
            {lowStock.length ? lowStock.slice(0, 6).map((product) => (
              <div key={product.id} className="flex items-center justify-between gap-4 py-4">
                <div className="min-w-0"><p className="truncate text-sm font-semibold">{product.name}</p><p className="mt-1 text-xs text-stone-400">Mínimo configurado: {product.minimum_stock}</p></div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${product.stock === 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{product.stock} disponibles</span>
              </div>
            )) : <div className="py-14 text-center"><p className="font-medium text-emerald-700">Inventario saludable</p><p className="mt-1 text-sm text-stone-400">No hay productos por debajo del mínimo.</p></div>}
          </div>
        </article>
      </div>
    </section>
  );
}
