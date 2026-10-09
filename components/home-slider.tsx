"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    eyebrow: "Hecho a mano con cariño",
    title: "Pequeños personajes, grandes historias",
    description: "Amigurumis tejidos puntada a puntada para acompañar momentos especiales y convertirse en recuerdos inolvidables.",
    imageLabel: "Fotografía principal de una colección de amigurumis",
  },
  {
    eyebrow: "Creaciones personalizadas",
    title: "Una pieza tan única como tú",
    description: "Elige colores, detalles y personalidad. Creamos una pieza especial inspirada en la historia que quieras contar.",
    imageLabel: "Fotografía de una pieza personalizada",
  },
  {
    eyebrow: "Regalos con significado",
    title: "Detalles que se quedan para siempre",
    description: "Celebra nacimientos, cumpleaños y días importantes con un regalo artesanal creado con tiempo y dedicación.",
    imageLabel: "Fotografía de un amigurumi listo para regalo",
  },
];

export function HomeSlider() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, []);

  const goTo = (index: number) => setActiveSlide((index + slides.length) % slides.length);

  return (
    <section className="relative overflow-hidden bg-[#f7f1e8]">
      <div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <div className="relative z-10 max-w-xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-[#a65b46]">{slides[activeSlide].eyebrow}</p>
          <h1 className="font-serif text-5xl font-semibold leading-[1.05] tracking-tight text-[#302a27] sm:text-6xl lg:text-7xl">{slides[activeSlide].title}</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-[#716762]">{slides[activeSlide].description}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/productos" className="rounded-full bg-[#302a27] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#a65b46]">Ver productos</Link>
            <a href="#quienes-somos" className="rounded-full border border-[#cfc2b5] bg-white/60 px-7 py-3.5 text-sm font-semibold text-[#302a27] transition hover:bg-white">Conoce Amigurus</a>
          </div>
          <div className="mt-12 flex items-center gap-3">
            <button type="button" onClick={() => goTo(activeSlide - 1)} aria-label="Diapositiva anterior" className="grid size-11 place-items-center rounded-full border border-[#d8ccc0] bg-white/70 transition hover:bg-white"><ChevronLeft size={18} /></button>
            <div className="flex gap-2" aria-label="Seleccionar diapositiva">
              {slides.map((slide, index) => (
                <button key={slide.title} type="button" onClick={() => goTo(index)} aria-label={`Ir a diapositiva ${index + 1}`} className={`h-2 rounded-full transition-all ${index === activeSlide ? "w-8 bg-[#a65b46]" : "w-2 bg-[#c6b7aa]"}`} />
              ))}
            </div>
            <button type="button" onClick={() => goTo(activeSlide + 1)} aria-label="Siguiente diapositiva" className="grid size-11 place-items-center rounded-full border border-[#d8ccc0] bg-white/70 transition hover:bg-white"><ChevronRight size={18} /></button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-8 -top-8 size-36 rounded-full bg-[#d9b7a5]/45 blur-2xl" />
          <div className="absolute -bottom-10 -right-6 size-44 rounded-full bg-[#d6c5a3]/50 blur-2xl" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-[#d7d7d4] shadow-[0_30px_90px_rgba(77,59,48,0.18)]">
            <div className="absolute inset-0 grid place-items-center p-10 text-center">
              <div>
                <span className="mx-auto grid size-14 place-items-center rounded-full border border-white/70 bg-white/40 text-2xl">✦</span>
                <p className="mt-4 max-w-xs text-sm font-medium leading-6 text-[#686865]">{slides[activeSlide].imageLabel}</p>
              </div>
            </div>
            <span className="absolute bottom-6 left-6 rounded-full bg-white/75 px-4 py-2 text-xs font-semibold text-[#554d48] backdrop-blur">Espacio para fotografía</span>
          </div>
        </div>
      </div>
    </section>
  );
}
