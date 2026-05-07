"use client";
import { useState } from "react";
import { getMesas, addReservacion, getReservacionesPorFechaHora, getConfig } from "@/lib/db";
import { enviarEmail } from "@/lib/email";

const horasDisponibles = [
  "12:00pm", "12:30pm", "1:00pm", "1:30pm", "2:00pm", "2:30pm",
  "3:00pm", "3:30pm", "7:00pm", "7:30pm", "8:00pm", "8:30pm",
  "9:00pm", "9:30pm",
];

export default function ModalReserva({ onClose }) {
  const [paso, setPaso] = useState(1);
  const [form, setForm] = useState({
    nombre: "",
    whatsapp: "",
    email: "",
    fecha: "",
    hora: "",
    personas: 1,
  });
  const [mesaAsignada, setMesaAsignada] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const confirmar = async () => {
    setCargando(true);
    setError("");
    try {
      const mesas = await getMesas();
      const reservacionesActivas = await getReservacionesPorFechaHora(form.fecha, form.hora);
      const mesasOcupadas = reservacionesActivas.map((r) => r.mesaAsignada);
      const mesaDisponible = mesas.find(
        (m) => !mesasOcupadas.includes(m.numero) && m.capacidad >= Number(form.personas)
      );

      if (!mesaDisponible) {
        setError("No hay mesas disponibles para esa fecha y hora. Por favor elige otro horario.");
        setCargando(false);
        return;
      }

      await addReservacion({
        clienteNombre: form.nombre,
        clienteWhatsapp: form.whatsapp,
        clienteEmail: form.email,
        fecha: form.fecha,
        hora: form.hora,
        personas: Number(form.personas),
        mesaAsignada: mesaDisponible.numero,
        estado: "activa",
        timestamp: new Date(),
      });

      // Enviar email de confirmación
      if (form.email) {
        const config = await getConfig();
        await enviarEmail("confirmacion", {
          clienteNombre: form.nombre,
          clienteEmail: form.email,
          restaurante: config?.nombre || "El Restaurante",
          fecha: form.fecha,
          hora: form.hora,
          personas: form.personas,
          mesaAsignada: mesaDisponible.numero,
          tiempoGracia: config?.tiempoGracia || 15,
        });
      }

      setMesaAsignada(mesaDisponible.numero);
      setPaso(3);
    } catch (err) {
      setError("Ocurrió un error. Por favor intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-900 px-6 py-5 flex justify-between items-center">
          <div>
            <p className="text-amber-400 text-xs uppercase tracking-widest mb-1">La Casa de Juan</p>
            <h2 className="text-white font-bold text-xl">Reservar Mesa</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-white transition text-2xl">✕</button>
        </div>

        {/* Indicador de pasos */}
        <div className="flex border-b border-stone-100">
          {["Datos", "Fecha y Hora", "Confirmación"].map((label, i) => (
            <div
              key={i}
              className={`flex-1 py-3 text-center text-xs font-medium transition-all ${
                paso === i + 1
                  ? "text-amber-600 border-b-2 border-amber-500"
                  : paso > i + 1
                  ? "text-stone-400"
                  : "text-stone-300"
              }`}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Contenido */}
        <div className="px-6 py-6">

          {/* Paso 1 */}
          {paso === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">Nombre completo</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Ej: Juan Pérez"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Ej: juan@gmail.com"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">WhatsApp</label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={form.whatsapp}
                  onChange={handleChange}
                  placeholder="Ej: 8091234567"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">Número de personas</label>
                <select
                  name="personas"
                  value={form.personas}
                  onChange={handleChange}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none focus:border-amber-400 transition"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? "persona" : "personas"}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Paso 2 */}
          {paso === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">Fecha</label>
                <input
                  type="date"
                  name="fecha"
                  value={form.fecha}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-700 focus:outline-none focus:border-amber-400 transition"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-stone-400 mb-2 block">Hora</label>
                <div className="grid grid-cols-3 gap-2">
                  {horasDisponibles.map((hora) => (
                    <button
                      key={hora}
                      onClick={() => setForm({ ...form, hora })}
                      className={`py-2 rounded-xl text-sm border transition ${
                        form.hora === hora
                          ? "bg-amber-500 border-amber-500 text-black font-semibold"
                          : "border-stone-200 text-stone-600 hover:border-amber-400"
                      }`}
                    >
                      {hora}
                    </button>
                  ))}
                </div>
              </div>
              {error && (
                <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-3">{error}</p>
              )}
            </div>
          )}

          {/* Paso 3 */}
          {paso === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-stone-800 font-bold text-xl mb-2">¡Reserva confirmada!</h3>
              <p className="text-stone-500 text-sm mb-6">
                Te enviamos los detalles a tu correo. Te recordaremos 1 hora antes.
              </p>
              <div className="bg-stone-50 rounded-xl p-4 text-left space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-400">Nombre</span>
                  <span className="text-stone-700 font-medium">{form.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Correo</span>
                  <span className="text-stone-700 font-medium">{form.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Fecha</span>
                  <span className="text-stone-700 font-medium">{form.fecha}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Hora</span>
                  <span className="text-stone-700 font-medium">{form.hora}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Personas</span>
                  <span className="text-stone-700 font-medium">{form.personas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400">Mesa asignada</span>
                  <span className="text-stone-700 font-medium">Mesa #{mesaAsignada}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="px-6 pb-6 flex gap-3">
          {paso > 1 && paso < 3 && (
            <button
              onClick={() => { setPaso(paso - 1); setError(""); }}
              className="flex-1 border border-stone-200 text-stone-600 rounded-xl py-3 text-sm font-medium hover:bg-stone-50 transition"
            >
              Atrás
            </button>
          )}
          {paso === 1 && (
            <button
              onClick={() => setPaso(2)}
              disabled={!form.nombre || !form.whatsapp}
              className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black font-semibold rounded-xl py-3 text-sm transition"
            >
              Continuar
            </button>
          )}
          {paso === 2 && (
            <button
              onClick={confirmar}
              disabled={!form.fecha || !form.hora || cargando}
              className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black font-semibold rounded-xl py-3 text-sm transition"
            >
              {cargando ? "Verificando disponibilidad..." : "Confirmar Reserva"}
            </button>
          )}
          {paso === 3 && (
            <button
              onClick={onClose}
              className="flex-1 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl py-3 text-sm transition"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}