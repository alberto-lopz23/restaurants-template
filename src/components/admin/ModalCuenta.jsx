"use client";
import { useState, useEffect } from "react";
import { getTotalSesion } from "@/lib/db";

export default function ModalCuenta({ mesa, onClose }) {
  const [cuenta, setCuenta] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const data = await getTotalSesion(mesa.mesaId, mesa.sesionId);
      setCuenta(data);
      setCargando(false);
    };
    cargar();
  }, []);

  const imprimir = () => window.print();

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-900 px-6 py-5 flex justify-between items-center">
          <div>
            <p className="text-amber-400 text-xs uppercase tracking-widest mb-1">Cuenta</p>
            <h2 className="text-white font-bold text-xl">Mesa #{mesa.mesaNumero}</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white transition text-2xl">✕</button>
        </div>

        {cargando ? (
          <div className="p-8 text-center">
            <p className="text-stone-400 text-sm">Calculando cuenta...</p>
          </div>
        ) : (
          <div className="p-6">

            {/* Nombre restaurante */}
            <div className="text-center mb-6">
              <p className="text-stone-800 font-bold text-lg">La Casa de Juan</p>
              <p className="text-stone-400 text-xs">Av. Winston Churchill #45, Santo Domingo</p>
              <p className="text-stone-400 text-xs mt-1">
                {new Date().toLocaleDateString("es-DO", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* Línea divisora */}
            <div className="border-t border-dashed border-stone-200 mb-4" />

            {/* Platos */}
            <div className="space-y-3 mb-4">
              {cuenta.platos.map((plato, i) => (
                <div key={i} className="flex justify-between items-start text-sm">
                  <div className="flex-1">
                    <p className="text-stone-800 font-medium">{plato.nombre}</p>
                    <p className="text-stone-400 text-xs">
                      {plato.cantidad} x RD${plato.precio}
                    </p>
                  </div>
                  <span className="text-stone-800 font-semibold">
                    RD${plato.precio * plato.cantidad}
                  </span>
                </div>
              ))}
            </div>

            {/* Línea divisora */}
            <div className="border-t border-dashed border-stone-200 mb-4" />

            {/* Total */}
            <div className="flex justify-between items-center mb-6">
              <span className="text-stone-800 font-bold text-lg">Total</span>
              <span className="text-stone-800 font-bold text-2xl">RD${cuenta.total}</span>
            </div>

            {/* Mensaje */}
            <p className="text-center text-stone-400 text-xs mb-6">
              ¡Gracias por visitarnos! Esperamos verle pronto.
            </p>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={imprimir}
                className="flex-1 border border-stone-200 text-stone-600 rounded-xl py-3 text-sm hover:bg-stone-50 transition"
              >
                🖨️ Imprimir
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl py-3 text-sm transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}