import { Heart, Instagram, Mail, MessageCircle, Sparkles } from "lucide-react";
import Link from "next/link";

import { HomeSlider } from "@/components/home-slider";

const collections = [
  { title: "Amigurumis personalizados", description: "Personajes creados a partir de tus ideas, colores favoritos y detalles especiales.", image: "Fotografía de un amigurumi personalizado" },
  { title: "Regalos para celebrar", description: "Piezas llenas de ternura para nacimientos, cumpleaños y momentos importantes.", image: "Fotografía de un amigurumi para regalo" },
  { title: "Compañeros entrañables", description: "Animalitos y personajes listos para encontrar un hogar y compartir nuevas aventuras.", image: "Fotografía de una colección de personajes" },
];

const testimonials = [
  { quote: "Se nota el cariño en cada detalle. La pieza quedó todavía más bonita de lo que imaginaba.", author: "Mariana R.", occasion: "Regalo de cumpleaños" },
  { quote: "Me ayudaron a elegir los colores y el resultado fue totalmente único. Llegó precioso y muy bien cuidado.", author: "Sofía M.", occasion: "Pedido personalizado" },
  { quote: "Fue el regalo perfecto. Ahora tiene un lugar especial en la habitación de mi bebé.", author: "Andrea L.", occasion: "Regalo de nacimiento" },
];

export default function Home() {
  return (
    <main className="bg-[#fffdf9] text-[#302a27]">
      <header className="sticky top-0 z-50 border-b border-[#e9e0d7] bg-[#fffdf9]/90 backdrop-blur-xl">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link href="/" className="font-serif text-2xl font-semibold tracking-tight">Amigurus<span className="text-[#a65b46]">.</span></Link>
          <div className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#quienes-somos" className="transition hover:text-[#a65b46]">Quiénes somos</a>
            <a href="#productos" className="transition hover:text-[#a65b46]">Productos</a>
            <a href="#testimonios" className="transition hover:text-[#a65b46]">Testimonios</a>
          </div>
          <Link href="/productos" className="rounded-full bg-[#302a27] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#a65b46]">Ver tienda</Link>
        </nav>
      </header>

      <HomeSlider />

      <section id="quienes-somos" className="px-6 py-28 lg:px-10">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <div className="relative mx-auto w-full max-w-xl">
            <div className="aspect-[5/4] rounded-[2rem] bg-[#d7d7d4] p-8">
              <div className="grid h-full place-items-center rounded-[1.5rem] border border-white/60 text-center text-sm font-medium text-[#686865]">Fotografía del proceso de tejido o de la persona creadora</div>
            </div>
            <div className="absolute -bottom-8 -right-4 max-w-[220px] rounded-2xl bg-[#a65b46] p-6 text-white shadow-xl sm:right-8">
              <Heart className="mb-3" size={22} />
              <p className="font-serif text-xl leading-snug">Cada pieza lleva horas de paciencia, detalle y corazón.</p>
            </div>
          </div>
          <div className="max-w-xl lg:pl-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#a65b46]">Quiénes somos</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold leading-tight sm:text-5xl">Tejemos objetos que guardan emociones</h2>
            <div className="mt-7 space-y-5 text-base leading-8 text-[#716762]">
              <p>Amigurus nació del gusto por transformar hilos sencillos en personajes llenos de identidad. Cada pieza se elabora a mano, cuidando desde la elección del color hasta la última puntada.</p>
              <p>Creemos en el valor de lo hecho lentamente: regalos que no se repiten, compañeros que cuentan una historia y detalles creados especialmente para alguien.</p>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-5 border-t border-[#e6ddd4] pt-7">
              <div><strong className="block font-serif text-3xl">100%</strong><span className="text-sm text-[#7c716b]">Hecho a mano</span></div>
              <div><strong className="block font-serif text-3xl">1 a 1</strong><span className="text-sm text-[#7c716b]">Atención personal</span></div>
              <div><strong className="block font-serif text-3xl">∞</strong><span className="text-sm text-[#7c716b]">Ideas posibles</span></div>
            </div>
          </div>
        </div>
      </section>

      <section id="productos" className="bg-[#f3ede5] px-6 py-28 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#a65b46]">Nuestras creaciones</p>
              <h2 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Una pieza para cada historia</h2>
            </div>
            <Link href="/productos" className="border-b border-[#302a27] pb-1 text-sm font-semibold">Explorar todo el catálogo →</Link>
          </div>
          <div className="mt-14 grid gap-7 md:grid-cols-3">
            {collections.map((collection, index) => (
              <article key={collection.title} className="group overflow-hidden rounded-[1.75rem] bg-white shadow-sm">
                <div className="relative aspect-[4/5] bg-[#d4d4d1] transition duration-500 group-hover:bg-[#cececa]">
                  <div className="absolute inset-0 grid place-items-center p-8 text-center text-sm font-medium leading-6 text-[#686865]">{collection.image}</div>
                  <span className="absolute left-5 top-5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold backdrop-blur">0{index + 1}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-2xl font-semibold">{collection.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#716762]">{collection.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonios" className="px-6 py-28 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <Sparkles className="mx-auto text-[#a65b46]" size={26} />
            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.24em] text-[#a65b46]">Palabras bonitas</p>
            <h2 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">Historias de quienes ya tienen su Amiguru</h2>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <blockquote key={testimonial.author} className="rounded-[1.5rem] border border-[#e7ddd3] bg-white p-7">
                <div className="text-[#b47a61]">★★★★★</div>
                <p className="mt-6 font-serif text-xl leading-8">“{testimonial.quote}”</p>
                <footer className="mt-7 border-t border-[#eee6de] pt-5">
                  <cite className="not-italic font-semibold">{testimonial.author}</cite>
                  <p className="mt-1 text-sm text-[#82766f]">{testimonial.occasion}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 rounded-[2rem] bg-[#a65b46] px-8 py-14 text-center text-white md:flex-row md:text-left lg:px-14">
          <div><p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">¿Tienes una idea especial?</p><h2 className="mt-3 max-w-2xl font-serif text-3xl font-semibold sm:text-4xl">Conversemos y creemos un Amiguru solo para ti.</h2></div>
          <Link href="/productos" className="shrink-0 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-[#7e4434] transition hover:bg-[#f7eee8]">Comenzar un pedido</Link>
        </div>
      </section>

      <footer className="border-t border-[#e9e0d7] bg-[#302a27] px-6 py-16 text-white lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div className="max-w-sm"><p className="font-serif text-3xl font-semibold">Amigurus<span className="text-[#d69a7e]">.</span></p><p className="mt-4 text-sm leading-7 text-white/60">Amigurumis elaborados a mano para regalar, acompañar y recordar momentos especiales.</p></div>
          <div><h3 className="text-sm font-semibold">Explora</h3><div className="mt-5 flex flex-col gap-3 text-sm text-white/60"><a href="#quienes-somos">Quiénes somos</a><a href="#productos">Productos</a><a href="#testimonios">Testimonios</a><Link href="/auth/admin-login">Administración</Link></div></div>
          <div><h3 className="text-sm font-semibold">Contacto</h3><div className="mt-5 flex flex-col gap-3 text-sm text-white/60"><a href="#" className="flex items-center gap-2"><MessageCircle size={16} /> WhatsApp</a><a href="#" className="flex items-center gap-2"><Instagram size={16} /> Instagram</a><a href="mailto:hola@amigurus.mx" className="flex items-center gap-2"><Mail size={16} /> hola@amigurus.mx</a></div></div>
        </div>
        <div className="mx-auto mt-14 flex max-w-7xl flex-wrap justify-between gap-4 border-t border-white/10 pt-7 text-xs text-white/40"><p>© Amigurus. Hecho con cariño.</p><p>Piezas artesanales · México</p></div>
      </footer>
    </main>
  );
}
