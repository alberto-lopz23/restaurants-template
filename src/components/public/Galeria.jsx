"use client";
import { useState } from "react";

const fotos = [
  { id: 1, src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800", alt: "Plato especial de la casa" },
  { id: 2, src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800", alt: "Ambiente del restaurante" },
  { id: 3, src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800", alt: "Platos de la cocina" },
  { id: 4, src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800", alt: "Vista del salón" },
  { id: 5, src: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800", alt: "Postres artesanales" },
  { id: 6, src: "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=800", alt: "Bebidas de la casa" },
];

export default function Galeria() {
  const [fotoActiva, setFotoActiva] = useState(null);

  const anterior = () => {
    const index = fotos.findIndex((f) => f.id === fotoActiva.id);
    if (index > 0) setFotoActiva(fotos[index - 1]);
  };

  const siguiente = () => {
    const index = fotos.findIndex((f) => f.id === fotoActiva.id);
    if (index < fotos.length - 1) setFotoActiva(fotos[index + 1]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") siguiente();
    if (e.key === "ArrowLeft") anterior();
    if (e.key === "Escape") setFotoActiva(null);
  };

  return (
    <section id="galeria" className="bg-white py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Título */}
        <div className="text-center mb-16">
          <p className="text-amber-500 text-sm uppercase tracking-widest mb-3">
            Nuestro espacio
          </p>
          <h2 className="text-4xl font-bold text-stone-800">Galería</h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {fotos.map((foto, index) => (
            <div
              key={foto.id}
              onClick={() => setFotoActiva(foto)}
              className={`overflow-hidden rounded-xl cursor-pointer group ${
                index === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <img
                src={foto.src}
                alt={foto.alt}
                className="w-full h-48 md:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ minHeight: index === 0 ? "300px" : "180px" }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {fotoActiva && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center px-4"
          onClick={() => setFotoActiva(null)}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Botón cerrar */}
          <button
            className="absolute top-5 right-5 text-white text-3xl hover:text-amber-400 transition"
            onClick={() => setFotoActiva(null)}
          >
            ✕
          </button>

          {/* Botón anterior */}
          <button
            onClick={(e) => { e.stopPropagation(); anterior(); }}
            disabled={fotos.findIndex((f) => f.id === fotoActiva.id) === 0}
            className="absolute left-4 text-white text-4xl hover:text-amber-400 disabled:opacity-20 transition px-3"
          >
            ‹
          </button>

          {/* Imagen */}
          <img
            src={fotoActiva.src}
            alt={fotoActiva.alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
          />

          {/* Botón siguiente */}
          <button
            onClick={(e) => { e.stopPropagation(); siguiente(); }}
            disabled={fotos.findIndex((f) => f.id === fotoActiva.id) === fotos.length - 1}
            className="absolute right-4 text-white text-4xl hover:text-amber-400 disabled:opacity-20 transition px-3"
          >
            ›
          </button>

          {/* Contador */}
          <div className="absolute bottom-5 text-stone-400 text-sm">
            {fotos.findIndex((f) => f.id === fotoActiva.id) + 1} / {fotos.length}
          </div>
        </div>
      )}
    </section>
  );
}