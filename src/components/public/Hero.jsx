"use client";
import { useState } from "react";
import ModalReserva from "./ModalReserva";
import useConfig from "@/hooks/useConfig";

export default function Hero() {
  const [modalAbierto, setModalAbierto] = useState(false);
  const config = useConfig();

  return (
    <section className="relative h-screen w-full">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=1600')" }}
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4">
        <p className="text-sm uppercase tracking-widest text-amber-400 mb-4">
          Bienvenidos
        </p>
        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          {config?.nombre || "La Casa de Juan"}
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-xl">
          {config?.slogan || "Sabores auténticos en el corazón de Santo Domingo"}
        </p>
        <div className="flex gap-4">
          <a href="#destacados" className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-3 rounded-full transition">
            Ver Menú
          </a>
          <button
            data-reservar
            onClick={() => setModalAbierto(true)}
            className="border border-white hover:bg-white hover:text-black text-white font-semibold px-8 py-3 rounded-full transition"
          >
            Reservar
          </button>
        </div>
      </div>
      {modalAbierto && <ModalReserva onClose={() => setModalAbierto(false)} />}
    </section>
  );
}