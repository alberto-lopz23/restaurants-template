"use client";
import { useState, useEffect } from "react";
import { getMesas, getPlatos, getReservaciones } from "@/lib/db";
import { onSnapshot, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

const RESTAURANT_ID = "restaurante-1";

export default function Dashboard() {
  const [mesasOcupadas, setMesasOcupadas] = useState(0);
  const [totalMesas, setTotalMesas] = useState(0);
  const [pedidosActivos, setPedidosActivos] = useState(0);
  const [reservasHoy, setReservasHoy] = useState(0);
  const [platosAgotados, setPlatosAgotados] = useState(0);
  const [actividadReciente, setActividadReciente] = useState([]);

  useEffect(() => {
    const hoy = new Date().toISOString().split("T")[0];

    // Mesas
    getMesas().then((mesas) => {
      setTotalMesas(mesas.length);
      setMesasOcupadas(mesas.filter((m) => m.estado === "ocupada").length);
    });

    // Platos agotados
    getPlatos().then((platos) => {
      setPlatosAgotados(platos.filter((p) => p.disponible === false).length);
    });

    // Reservas hoy
    getReservaciones().then((reservaciones) => {
      setReservasHoy(
        reservaciones.filter((r) => r.fecha === hoy && r.estado === "activa").length
      );
    });

    // Pedidos activos en tiempo real (escucha todas las mesas)
    getMesas().then((mesas) => {
      let totalPedidos = 0;
      const unsubs = [];

      mesas.forEach((mesa) => {
        // Escuchar sesiones activas de cada mesa
        const sesionesRef = collection(db, "restaurants", RESTAURANT_ID, "mesas", mesa.id, "sesiones");
        const qSesiones = query(sesionesRef, where("estado", "==", "activa"));

        const unsub = onSnapshot(qSesiones, (snapSesiones) => {
          snapSesiones.forEach((sesionDoc) => {
            const pedidosRef = collection(
              db, "restaurants", RESTAURANT_ID, "mesas", mesa.id, "sesiones", sesionDoc.id, "pedidos"
            );
            const qPedidos = query(pedidosRef, where("estado", "==", "pendiente"));
            onSnapshot(qPedidos, (snapPedidos) => {
              totalPedidos += snapPedidos.size;
              setPedidosActivos(totalPedidos);
            });
          });
        });

        unsubs.push(unsub);
      });

      return () => unsubs.forEach((u) => u());
    });

    // Actividad reciente: reservas de hoy
    getReservaciones().then((reservaciones) => {
      const recientes = reservaciones
        .filter((r) => r.fecha === hoy)
        .sort((a, b) => new Date(b.timestamp?.seconds * 1000) - new Date(a.timestamp?.seconds * 1000))
        .slice(0, 5);
      setActividadReciente(recientes);
    });
  }, []);

  const cards = [
    { label: "Mesas ocupadas", valor: `${mesasOcupadas}/${totalMesas}`, color: "bg-amber-50 text-amber-600" },
    { label: "Pedidos activos", valor: pedidosActivos, color: "bg-blue-50 text-blue-600" },
    { label: "Reservas hoy", valor: reservasHoy, color: "bg-green-50 text-green-600" },
    { label: "Platos agotados", valor: platosAgotados, color: "bg-red-50 text-red-600" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">Dashboard</h1>
        <p className="text-stone-400 text-sm mt-1">Bienvenido al panel de administración</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
            <p className="text-stone-400 text-xs uppercase tracking-widest mb-3">{card.label}</p>
            <p className={`text-3xl font-bold ${card.color} w-fit px-3 py-1 rounded-xl`}>
              {card.valor}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <h2 className="text-stone-800 font-semibold mb-4">Actividad reciente</h2>
        {actividadReciente.length === 0 ? (
          <p className="text-stone-400 text-sm">No hay actividad hoy todavía.</p>
        ) : (
          <div className="divide-y divide-stone-50">
            {actividadReciente.map((r) => (
              <div key={r.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-stone-700 text-sm font-medium">{r.clienteNombre}</p>
                  <p className="text-stone-400 text-xs">Reserva para {r.hora} — Mesa #{r.mesaAsignada}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
                  r.estado === "activa" ? "bg-green-100 text-green-600 border-green-200" :
                  r.estado === "cancelada" ? "bg-red-100 text-red-500 border-red-200" :
                  "bg-stone-100 text-stone-500 border-stone-200"
                }`}>
                  {r.estado.charAt(0).toUpperCase() + r.estado.slice(1)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}