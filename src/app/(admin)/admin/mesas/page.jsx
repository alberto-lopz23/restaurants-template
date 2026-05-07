"use client";
import { useState, useEffect } from "react";
import {
  getMesas,
  addMesa,
  updateMesa,
  deleteMesa,
  abrirSesion,
  cerrarSesion,
} from "@/lib/db";
import QRMesa from "@/components/admin/QRMesa";

const estadoConfig = {
  libre: {
    label: "Libre",
    color: "bg-green-100 text-green-600 border-green-200",
  },
  ocupada: {
    label: "Ocupada",
    color: "bg-red-100 text-red-500 border-red-200",
  },
  reservada: {
    label: "Reservada",
    color: "bg-blue-100 text-blue-500 border-blue-200",
  },
};

export default function AdminMesas() {
  const [mesas, setMesas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [mesaEditando, setMesaEditando] = useState(null);
  const [form, setForm] = useState({ numero: "", capacidad: 2 });
  const [qrModal, setQrModal] = useState(null);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    cargarMesas();
  }, []);

  const cargarMesas = async () => {
    setCargando(true);
    const data = await getMesas();
    data.sort((a, b) => a.numero - b.numero);
    setMesas(data);
    setCargando(false);
  };

  const abrirModal = (mesa = null) => {
    if (mesa) {
      setMesaEditando(mesa);
      setForm({ numero: mesa.numero, capacidad: mesa.capacidad });
    } else {
      setMesaEditando(null);
      setForm({ numero: "", capacidad: 2 });
    }
    setModalAbierto(true);
  };

  const guardar = async () => {
    if (!form.numero) return;
    const duplicado = mesas.some(
      (m) => m.numero === Number(form.numero) && m.id !== mesaEditando?.id,
    );
    if (duplicado) {
      alert(`Ya existe una Mesa #${form.numero}`);
      return;
    }
    const data = {
      numero: Number(form.numero),
      capacidad: Number(form.capacidad),
      estado: mesaEditando ? mesaEditando.estado : "libre",
    };
    if (mesaEditando) {
      await updateMesa(mesaEditando.id, data);
    } else {
      await addMesa(data);
    }
    setModalAbierto(false);
    cargarMesas();
  };

  const eliminar = async (id) => {
    if (confirm("¿Eliminar esta mesa?")) {
      await deleteMesa(id);
      cargarMesas();
    }
  };

  const handleAbrirSesion = async (mesa) => {
    if (mesa.estado === "ocupada") {
      alert("Esta mesa ya tiene una sesión activa.");
      return;
    }
    await abrirSesion(mesa.id);
    cargarMesas();
  };

  const handleCerrarSesion = async (mesa) => {
    if (!mesa.sesionActiva) return;
    if (
      !confirm(
        `¿Cerrar la sesión de la Mesa #${mesa.numero}? Esto marcará la mesa como libre.`,
      )
    )
      return;
    await cerrarSesion(mesa.id, mesa.sesionActiva);
    cargarMesas();
  };

  const resumen = {
    libre: mesas.filter((m) => m.estado === "libre").length,
    ocupada: mesas.filter((m) => m.estado === "ocupada").length,
    reservada: mesas.filter((m) => m.estado === "reservada").length,
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-stone-400 text-sm">Cargando mesas...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Mesas</h1>
          <p className="text-stone-400 text-sm mt-1">
            Gestiona y monitorea las mesas en tiempo real
          </p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition"
        >
          + Agregar mesa
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm text-center">
          <p className="text-3xl font-bold text-green-500 mb-1">
            {resumen.libre}
          </p>
          <p className="text-xs uppercase tracking-widest text-stone-400">
            Libres
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm text-center">
          <p className="text-3xl font-bold text-red-500 mb-1">
            {resumen.ocupada}
          </p>
          <p className="text-xs uppercase tracking-widest text-stone-400">
            Ocupadas
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm text-center">
          <p className="text-3xl font-bold text-blue-500 mb-1">
            {resumen.reservada}
          </p>
          <p className="text-xs uppercase tracking-widest text-stone-400">
            Reservadas
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mesas.map((mesa) => (
          <div
            key={mesa.id}
            className={`bg-white rounded-2xl border shadow-sm p-5 ${
              mesa.estado === "ocupada" ? "border-red-200" : "border-stone-100"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-stone-400">
                  Mesa
                </p>
                <p className="text-3xl font-bold text-stone-800">
                  #{mesa.numero}
                </p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full border font-medium ${estadoConfig[mesa.estado].color}`}
              >
                {estadoConfig[mesa.estado].label}
              </span>
            </div>

            <p className="text-stone-400 text-sm mb-4">
              Capacidad: {mesa.capacidad} personas
            </p>

            {/* Botones de sesión */}
            <div className="space-y-2 mb-3">
              {mesa.estado !== "ocupada" ? (
                <button
                  onClick={() => handleAbrirSesion(mesa)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg py-2 transition"
                >
                  Abrir mesa
                </button>
              ) : (
                <button
                  onClick={() => handleCerrarSesion(mesa)}
                  className="w-full bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg py-2 transition"
                >
                  Cerrar mesa
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => abrirModal(mesa)}
                className="flex-1 text-xs text-stone-400 hover:text-amber-600 transition border border-stone-200 rounded-lg py-1.5"
              >
                Editar
              </button>
              <button
                onClick={() => eliminar(mesa.id)}
                className="flex-1 text-xs text-stone-400 hover:text-red-500 transition border border-stone-200 rounded-lg py-1.5"
              >
                Eliminar
              </button>
            </div>
            <button
  onClick={() => setQrModal(mesa)}
  className="w-full mt-2 text-xs text-stone-400 hover:text-amber-600 transition border border-stone-200 rounded-lg py-1.5"
>
  📱 Ver QR
</button>
          </div>
          
        ))}

        

        {mesas.length === 0 && (
          <div className="col-span-4 text-center py-12 text-stone-400 text-sm">
            No hay mesas registradas
          </div>
        )}
      </div>

      {modalAbierto && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
          onClick={() => setModalAbierto(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-stone-800 font-bold text-lg mb-5">
              {mesaEditando ? "Editar mesa" : "Agregar mesa"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">
                  Número de mesa
                </label>
                <input
                  type="number"
                  value={form.numero}
                  onChange={(e) => setForm({ ...form, numero: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition"
                  placeholder="Ej: 9"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">
                  Capacidad
                </label>
                <select
                  value={form.capacidad}
                  onChange={(e) =>
                    setForm({ ...form, capacidad: e.target.value })
                  }
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((n) => (
                    <option key={n} value={n}>
                      {n} personas
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalAbierto(false)}
                className="flex-1 border border-stone-200 text-stone-600 rounded-xl py-3 text-sm hover:bg-stone-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={guardar}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-xl py-3 text-sm transition"
              >
                {mesaEditando ? "Guardar" : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      )}
      {qrModal && (
  <QRMesa
    mesa={qrModal}
    baseUrl={baseUrl}
    onClose={() => setQrModal(null)}
  />
)}
    </div>
  );
}
