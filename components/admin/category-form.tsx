"use client";

import { useActionState, useEffect, useRef } from "react";
import { LoaderCircle } from "lucide-react";

import { createCategory, type CategoryFormState } from "@/app/admin/categorias/actions";

const initialState: CategoryFormState = { status: "idle", message: "" };

export function CategoryForm() {
  const [state, action, pending] = useActionState(createCategory, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div><h2 className="text-lg font-semibold">Nueva categoría</h2><p className="mt-1 text-sm text-stone-500">Organiza el catálogo para facilitar la búsqueda.</p></div>
      <label className="block"><span className="text-sm font-medium">Nombre</span><input name="name" required minLength={2} maxLength={80} placeholder="Ej. Muñecos para bebé" className="mt-2 w-full rounded-lg border bg-white px-3 py-2 text-stone-900" /></label>
      <label className="block"><span className="text-sm font-medium">Descripción</span><textarea name="description" rows={4} placeholder="Describe qué tipo de productos contiene" className="mt-2 w-full rounded-lg border bg-white px-3 py-2 text-stone-900" /></label>
      {state.message && <p role="status" className={`rounded-lg p-3 text-sm ${state.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{state.message}</p>}
      <button type="submit" disabled={pending} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-wait disabled:opacity-60">
        {pending && <LoaderCircle size={18} className="animate-spin" />}
        {pending ? "Creando…" : "Crear categoría"}
      </button>
    </form>
  );
}
