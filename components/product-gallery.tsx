"use client";

import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export type GalleryImage = {
  url: string;
  alt: string;
};

export function ProductGallery({ images, productName }: { images: GalleryImage[]; productName: string }) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex];

  const move = (direction: number) => {
    setSelectedIndex((current) => (current + direction + images.length) % images.length);
  };

  return (
    <div className="flex h-full flex-col gap-3 p-3 sm:p-4">
      <div className="relative min-h-[390px] flex-1 overflow-hidden rounded-2xl bg-[#efebe6] sm:min-h-[540px] lg:min-h-[590px]">
        {selectedImage ? (
          <Image src={selectedImage.url} alt={selectedImage.alt || productName} fill priority className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
        ) : (
          <div className="absolute inset-0 grid place-items-center"><div className="text-center text-stone-400"><Sparkles className="mx-auto" size={28} /><p className="mt-3 text-sm font-medium">Imagen próximamente</p></div></div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-stone-700 shadow-sm backdrop-blur">Hecho a mano</span>
        {images.length > 1 && (
          <>
            <button type="button" onClick={() => move(-1)} aria-label="Imagen anterior" className="absolute left-4 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-stone-800 shadow-md transition hover:bg-white"><ChevronLeft size={20} /></button>
            <button type="button" onClick={() => move(1)} aria-label="Siguiente imagen" className="absolute right-4 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-stone-800 shadow-md transition hover:bg-white"><ChevronRight size={20} /></button>
            <span className="absolute bottom-4 right-4 rounded-full bg-stone-950/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">{selectedIndex + 1} / {images.length}</span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
          {images.map((image, index) => (
            <button key={image.url} type="button" onClick={() => setSelectedIndex(index)} aria-label={`Ver imagen ${index + 1}`} className={`relative aspect-square overflow-hidden rounded-xl border-2 transition ${selectedIndex === index ? "border-rose-600" : "border-transparent opacity-70 hover:opacity-100"}`}>
              <Image src={image.url} alt="" fill className="object-cover" sizes="100px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
