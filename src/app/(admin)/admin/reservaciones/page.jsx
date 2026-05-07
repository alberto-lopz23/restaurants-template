"use client";
import { useState, useEffect } from "react";
import { getReservaciones, updateReservacion } from "@/lib/db";

const estadoConfig = {
  activa: { label: "Activa", color: "bg-green-100 text-green-600 border-green-200" },
  cancelada: { label: "Cancelada", color: "bg-red-100 text-red-500 border-red-200" },
  completada: { label: "Completada", color: "bg-stone-100 text-stone-500 border-stone-200" },
};

export default function AdminReservaciones() {
  const [reservaciones, setReservaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("todas");
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    setCargando(true);
    const data = await getReservaciones();
    data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    setReservaciones(data);
    setCargando(false);
  };

  const cancelar = async (id) => {
    if (confirm("¿Cancelar esta reservación?")) {
      await updateReservacion(id, { estado: "cancelada" });
      cargar();
    }
  };

  const completar = async (id) => {
    await updateReservacion(id, { estado: "completada" });
    cargar();
  };

  const reservacionesFiltradas = reservaciones
    .filter((r) => filtro === "todas" || r.estado === filtro)
    .filter((r) =>
      r.clienteNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
      r.clienteWhatsapp?.includes(busqueda)
    );

  const activas = reservaciones.filter((r) => r.estado === "activa").length;
  const hoy = new Date().toISOString().split("T")[0];
  const hoyCount = reservaciones.filter((r) => r.fecha === hoy && r.estado === "activa").length;

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-stone-400 text-sm">Cargando reservaciones...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">Reservaciones</h1>
        <p className="text-stone-400 text-sm mt-1">Gestiona las reservaciones del restaurante</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm text-center">
          <p className="text-3xl font-bold text-green-500 mb-1">{activas}</p>
          <p className="text-xs uppercase tracking-widest text-stone-400">Activas</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm text-center">
          <p className="text-3xl font-bold text-amber-500 mb-1">{hoyCount}</p>
          <p className="text-xs uppercase tracking-widest text-stone-400">Hoy</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm text-center">
          <p className="text-3xl font-bold text-stone-800 mb-1">{reservaciones.length}</p>
          <p className="text-xs uppercase tracking-widest text-stone-400">Total</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "todas", label: "Todas" },
            { value: "activa", label: "Activas" },
            { value: "cancelada", label: "Canceladas" },
            { value: "completada", label: "Completadas" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className={`px-4 py-2 rounded-xl text-sm border transition ${
                filtro === f.value
                  ? "bg-stone-900 text-white border-stone-900"
                  : "border-stone-200 text-stone-500 hover:border-stone-400"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Buscar por nombre o WhatsApp..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-400 transition md:ml-auto"
        />
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-stone-400">Cliente</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-stone-400">Fecha y Hora</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-stone-400">Personas</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-stone-400">Mesa</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-stone-400">Estado</th>
              <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-stone-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {reservacionesFiltradas.map((r) => (
              <tr key={r.id} className="hover:bg-stone-50 transition">
                <td className="px-6 py-4">
                  <p className="font-medium text-stone-800">{r.clienteNombre}</p>
                  
                   <a href={`https://wa.me/1${r.clienteWhatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-500 hover:text-green-600 transition"
                  >
                    {r.clienteWhatsapp}
                  </a>
                </td>
                <td className="px-6 py-4">
                  <p className="text-stone-700 text-sm">{r.fecha}</p>
                  <p className="text-stone-400 text-xs">{r.hora}</p>
                </td>
                <td className="px-6 py-4 text-stone-600 text-sm">{r.personas} personas</td>
                <td className="px-6 py-4 text-stone-700 font-medium text-sm">
                  {r.mesaAsignada ? `Mesa #${r.mesaAsignada}` : "—"}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded-full border font-medium ${estadoConfig[r.estado]?.color}`}>
                    {estadoConfig[r.estado]?.label}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {r.estado === "activa" && (
                    <div className="flex gap-2">
                      <button onClick={() => completar(r.id)} className="text-sm text-stone-400 hover:text-green-500 transition">
                        Completar
                      </button>
                      <button onClick={() => cancelar(r.id)} className="text-sm text-stone-400 hover:text-red-500 transition">
                        Cancelar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {reservacionesFiltradas.length === 0 && (
          <div className="text-center py-12 text-stone-400 text-sm">
            No hay reservaciones que mostrar
          </div>
        )}
      </div>
    </div>
  );
}