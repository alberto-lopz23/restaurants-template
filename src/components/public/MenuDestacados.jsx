"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getPlatos } from "@/lib/db";

export default function MenuDestacados() {
  const [destacados, setDestacados] = useState([]);

  useEffect(() => {
    const cargar = async () => {
      const platos = await getPlatos();
      const disponibles = platos.filter(
        (p) => p.disponible && p.categoria !== "Bebidas",
      );
      const ordenados = disponibles.sort(
        (a, b) => (b.pedidos || 0) - (a.pedidos || 0),
      );
      setDestacados(ordenados.slice(0, 4));
    };
    cargar();
  }, []);

  if (destacados.length === 0) return null;

  return (
    <section id="destacados" className="bg-gray-50 py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-amber-500 text-sm uppercase tracking-widest mb-3">
            Lo más pedido
          </p>
          <h2 className="text-4xl font-bold text-stone-800">
            Platos Destacados
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {destacados.map((plato) => (
            <div
              key={plato.id}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="h-48 bg-gray-200 overflow-hidden">
                <img
                  src={
                    plato.foto ||
                    "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600"
                  }
                  alt={plato.nombre}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">
                    {plato.nombre}
                  </h4>
                  <span className="text-amber-600 font-bold">
                    RD${plato.precio}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">{plato.descripcion}</p>
                {plato.pedidos > 0 && (
                  <p className="text-amber-500 text-xs mt-2 font-medium">
                    🔥 {plato.pedidos} pedidos
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/menu"
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-10 py-3 rounded-full transition"
          >
            Ver menú completo
          </Link>
        </div>
      </div>
    </section>
  );
}
