"use client";
import { useState, useEffect } from "react";
import { getConfig, saveConfig } from "@/lib/db";

export default function AdminConfiguracion() {
  const [config, setConfig] = useState({
    nombre: "",
    slogan: "",
    descripcion: "",
    telefono: "",
    whatsapp: "",
    direccion: "",
    instagram: "",
    facebook: "",
    semanaAbre: "",
    semanaCierra: "",
    findeAbre: "",
    findeCierra: "",
    duracionReserva: 90,
    tiempoGracia: 15,
  });
  const [cargando, setCargando] = useState(true);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      const data = await getConfig();
      if (data) setConfig(data);
      setCargando(false);
    };
    cargar();
  }, []);

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const guardar = async () => {
    await saveConfig(config);
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-stone-400 text-sm">Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Configuración</h1>
          <p className="text-stone-400 text-sm mt-1">
            Información general del restaurante
          </p>
        </div>
        <button
          onClick={guardar}
          className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition"
        >
          {guardado ? "✓ Guardado" : "Guardar cambios"}
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <h2 className="text-stone-800 font-semibold mb-5">
            Información básica
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">
                Nombre del restaurante
              </label>
              <input
                type="text"
                name="nombre"
                value={config.nombre}
                onChange={handleChange}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">
                Slogan
              </label>
              <input
                type="text"
                name="slogan"
                value={config.slogan}
                onChange={handleChange}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={config.descripcion}
                onChange={handleChange}
                rows={3}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <h2 className="text-stone-800 font-semibold mb-5">Contacto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">
                Teléfono
              </label>
              <input
                type="text"
                name="telefono"
                value={config.telefono}
                onChange={handleChange}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">
                WhatsApp (solo números)
              </label>
              <input
                type="text"
                name="whatsapp"
                value={config.whatsapp}
                onChange={handleChange}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">
                Dirección
              </label>
              <input
                type="text"
                name="direccion"
                value={config.direccion}
                onChange={handleChange}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">
                Instagram
              </label>
              <input
                type="text"
                name="instagram"
                value={config.instagram}
                onChange={handleChange}
                placeholder="@turestaurante"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">
                Facebook
              </label>
              <input
                type="text"
                name="facebook"
                value={config.facebook}
                onChange={handleChange}
                placeholder="turestaurante"
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <h2 className="text-stone-800 font-semibold mb-5">Horarios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-stone-600 mb-3">
                Lunes — Viernes
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">
                    Abre
                  </label>
                  <input
                    type="time"
                    name="semanaAbre"
                    value={config.semanaAbre || ""}
                    onChange={handleChange}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
                <span className="text-stone-300 mt-5">—</span>
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">
                    Cierra
                  </label>
                  <input
                    type="time"
                    name="semanaCierra"
                    value={config.semanaCierra || ""}
                    onChange={handleChange}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-stone-600 mb-3">
                Sábado — Domingo
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">
                    Abre
                  </label>
                  <input
                    type="time"
                    name="findeAbre"
                    value={config.findeAbre || ""}
                    onChange={handleChange}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
                <span className="text-stone-300 mt-5">—</span>
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">
                    Cierra
                  </label>
                  <input
                    type="time"
                    name="findeCierra"
                    value={config.findeCierra || ""}
                    onChange={handleChange}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <h2 className="text-stone-800 font-semibold mb-1">Reservaciones</h2>
          <p className="text-stone-400 text-sm mb-5">
            Configura cómo se manejan las reservas
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">
                Duración de reserva (minutos)
              </label>
              <select
                name="duracionReserva"
                value={config.duracionReserva}
                onChange={handleChange}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition"
              >
                {[30, 45, 60, 90, 120, 150, 180].map((n) => (
                  <option key={n} value={n}>
                    {n} minutos
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">
                Tiempo de gracia (minutos)
              </label>
              <select
                name="tiempoGracia"
                value={config.tiempoGracia}
                onChange={handleChange}
                className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition"
              >
                {[5, 10, 15, 20, 30].map((n) => (
                  <option key={n} value={n}>
                    {n} minutos
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
