"use client";

import { ExternalLink, LayoutDashboard, Menu, Package, Tags, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { LogoutButton } from "@/components/logout-button";

const navigation = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/categorias", label: "Categorías", icon: Tags },
];

export function AdminShell({ children, userEmail }: { children: React.ReactNode; userEmail?: string }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const sidebar = (
    <>
      <div className="flex h-20 items-center justify-between border-b border-stone-800 px-6">
        <Link href="/admin" className="font-serif text-2xl font-semibold text-white">Amigurus<span className="text-rose-400">.</span></Link>
        <button type="button" onClick={() => setMenuOpen(false)} className="text-stone-400 lg:hidden" aria-label="Cerrar menú"><X /></button>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        <p className="px-3 pb-3 pt-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Administración</p>
        {navigation.map((item) => {
          const active = item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? "bg-rose-500 text-white" : "text-stone-300 hover:bg-stone-800 hover:text-white"}`}>
              <Icon size={19} /> {item.label}
            </Link>
          );
        })}
        <Link href="/productos" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-stone-300 transition hover:bg-stone-800 hover:text-white">
          <ExternalLink size={19} /> Ver tienda
        </Link>
      </nav>
      <div className="border-t border-stone-800 p-4">
        <p className="mb-3 truncate px-2 text-xs text-stone-500">{userEmail}</p>
        <LogoutButton redirectTo="/auth/admin-login" className="w-full border-stone-700 bg-transparent text-stone-200 hover:bg-stone-800 hover:text-white" />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f6f5f3] text-stone-900">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col bg-stone-950 lg:flex">{sidebar}</aside>
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Cerrar menú" className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <aside className="relative flex h-full w-72 flex-col bg-stone-950 shadow-2xl">{sidebar}</aside>
        </div>
      )}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200 bg-white/90 px-5 backdrop-blur lg:hidden">
          <button type="button" onClick={() => setMenuOpen(true)} className="grid size-10 place-items-center rounded-lg border border-stone-200" aria-label="Abrir menú"><Menu size={20} /></button>
          <span className="font-serif text-xl font-semibold">Amigurus Admin</span>
          <span className="size-10" />
        </header>
        <div className="mx-auto max-w-[1500px] px-5 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</div>
      </div>
    </div>
  );
}
