"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteProduct } from "@/app/admin/productos/actions";

export function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteProduct(productId);
        setDialogOpen(false);
        router.refresh();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : "No fue posible eliminar el producto.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setDialogOpen(true)}
        disabled={pending}
        aria-label={`Eliminar ${productName}`}
        className="grid size-9 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 hover:text-red-800 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? <LoaderCircle size={17} className="animate-spin" /> : <Trash2 size={17} />}
      </button>

      {dialogOpen && (
        <div className="fixed inset-0 z-[70] grid place-items-center px-5">
          <button type="button" aria-label="Cerrar confirmación" className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => !pending && setDialogOpen(false)} />
          <div role="dialog" aria-modal="true" aria-labelledby={`delete-title-${productId}`} className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <span className="grid size-12 place-items-center rounded-full bg-red-50 text-red-600"><Trash2 size={22} /></span>
            <h2 id={`delete-title-${productId}`} className="mt-5 text-xl font-bold">¿Estás seguro de que deseas eliminar?</h2>
            <p className="mt-3 text-sm leading-6 text-stone-500">
              Se eliminará <strong className="text-stone-700">{productName}</strong>, sus imágenes y su historial de inventario. Esta acción no se puede deshacer.
            </p>
            <div className="mt-7 flex justify-end gap-3">
              <button type="button" onClick={() => setDialogOpen(false)} disabled={pending} className="rounded-lg border border-stone-200 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50">Cancelar</button>
              <button type="button" onClick={handleDelete} disabled={pending} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-wait disabled:opacity-60">
                {pending && <LoaderCircle size={17} className="animate-spin" />}
                {pending ? "Eliminando…" : "Sí, eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
