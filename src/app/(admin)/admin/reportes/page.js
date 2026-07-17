"use client";
import { useState, useEffect, useCallback } from "react";
import { auth } from "@/lib/firebase";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const PERIODOS = [
  { key: "hoy", label: "Hoy" },
  { key: "semana", label: "Semana" },
  { key: "mes", label: "Mes" },
];

function rangoPara(periodo) {
  const hoy = new Date();
  const hasta = new Date(hoy);
  let desde = new Date(hoy);

  if (periodo === "semana") {
    desde.setDate(hoy.getDate() - 6);
  } else if (periodo === "mes") {
    desde.setDate(hoy.getDate() - 29);
  }

  const fmt = (d) => d.toISOString().split("T")[0];
  return { desde: fmt(desde), hasta: fmt(hoy) };
}

export default function Reportes() {
  const [periodo, setPeriodo] = useState("semana");
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    setCargando(true);
    setError("");
    try {
      const { desde, hasta } = rangoPara(periodo);
      const idToken = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/admin/reportes?desde=${desde}&hasta=${hasta}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error cargando el reporte.");
        setDatos(null);
        return;
      }
      setDatos(data);
    } catch (err) {
      setError("Error cargando el reporte.");
    } finally {
      setCargando(false);
    }
  }, [periodo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const descargarCSV = () => {
    if (!datos) return;

    const lineas = [];
    lineas.push(`Reporte,${datos.rango.desde} a ${datos.rango.hasta}`);
    lineas.push("");
    lineas.push("Resumen");
    lineas.push(`Ventas totales,RD$${datos.totalVentas}`);
    lineas.push(`Pedidos totales,${datos.totalPedidos}`);
    lineas.push(`Ticket promedio,RD$${datos.ticketPromedio}`);
    lineas.push(`Reservaciones activas,${datos.reservasActivas}`);
    lineas.push(`Reservaciones canceladas,${datos.reservasCanceladas}`);
    lineas.push("");
    lineas.push("Ventas por día");
    lineas.push("Fecha,Total (RD$)");
    datos.ventasPorDia.forEach((v) => lineas.push(`${v.fecha},${v.total}`));
    lineas.push("");
    lineas.push("Platos más pedidos");
    lineas.push("Plato,Cantidad");
    datos.topPlatos.forEach((p) => lineas.push(`"${p.nombre.replace(/"/g, '""')}",${p.cantidad}`));

    const csv = lineas.join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reporte_${datos.rango.desde}_a_${datos.rango.hasta}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Reportes</h1>
          <p className="text-stone-400 text-sm mt-1">Ventas, pedidos y reservaciones por periodo</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-stone-200 rounded-xl overflow-hidden">
            {PERIODOS.map((p) => (
              <button
                key={p.key}
                onClick={() => setPeriodo(p.key)}
                className={`px-4 py-2 text-sm font-medium transition ${
                  periodo === p.key
                    ? "bg-amber-500 text-black"
                    : "text-stone-500 hover:bg-stone-50"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            onClick={descargarCSV}
            disabled={!datos}
            className="bg-stone-900 hover:bg-stone-800 disabled:opacity-30 text-white text-sm font-medium px-4 py-2 rounded-xl transition"
          >
            ⬇ Descargar CSV
          </button>
        </div>
      </div>

      {cargando && (
        <div className="flex items-center justify-center h-64">
          <p className="text-stone-400 text-sm">Cargando reporte...</p>
        </div>
      )}

      {!cargando && error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-6 text-sm">
          {error}
        </div>
      )}

      {!cargando && !error && datos && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
              <p className="text-stone-400 text-xs uppercase tracking-widest mb-3">Ventas totales</p>
              <p className="text-3xl font-bold text-amber-600">RD${datos.totalVentas.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
              <p className="text-stone-400 text-xs uppercase tracking-widest mb-3">Pedidos</p>
              <p className="text-3xl font-bold text-blue-600">{datos.totalPedidos}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
              <p className="text-stone-400 text-xs uppercase tracking-widest mb-3">Ticket promedio</p>
              <p className="text-3xl font-bold text-stone-700">RD${datos.ticketPromedio.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
              <p className="text-stone-400 text-xs uppercase tracking-widest mb-3">Reservaciones</p>
              <p className="text-3xl font-bold text-green-600">
                {datos.reservasActivas}
                <span className="text-sm text-stone-400 font-normal ml-2">
                  ({datos.reservasCanceladas} canceladas)
                </span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-8">
            <h2 className="text-stone-800 font-semibold mb-4">Ventas por día</h2>
            {datos.ventasPorDia.length === 0 ? (
              <p className="text-stone-400 text-sm">No hay ventas en este periodo.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={datos.ventasPorDia}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0efed" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 12, fill: "#a8a29e" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#a8a29e" }} />
                  <Tooltip
                    formatter={(value) => [`RD$${value}`, "Ventas"]}
                    contentStyle={{ borderRadius: 12, border: "1px solid #f0efed" }}
                  />
                  <Bar dataKey="total" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
            <h2 className="text-stone-800 font-semibold mb-4">Platos más pedidos</h2>
            {datos.topPlatos.length === 0 ? (
              <p className="text-stone-400 text-sm">No hay pedidos en este periodo.</p>
            ) : (
              <div className="space-y-3">
                {datos.topPlatos.map((p, i) => (
                  <div key={p.nombre} className="flex items-center gap-4">
                    <span className="text-stone-300 font-bold w-5">{i + 1}</span>
                    <span className="flex-1 text-stone-700 text-sm">{p.nombre}</span>
                    <span className="text-stone-800 font-semibold text-sm">{p.cantidad}x</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}