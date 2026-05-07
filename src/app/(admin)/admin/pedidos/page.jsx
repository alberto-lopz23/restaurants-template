"use client";
import { useState, useEffect } from "react";
import { getMesas, getSesionActiva, onPedidosSesionChange, updatePedidoSesion } from "@/lib/db";
import ModalCuenta from "@/components/admin/ModalCuenta";

export default function AdminPedidos() {
  const [pedidosPorMesa, setPedidosPorMesa] = useState([]);
  const [filtro, setFiltro] = useState("todos");
  const [unsubs, setUnsubs] = useState([]);
  const [cuentaModal, setCuentaModal] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      const mesas = await getMesas();
      const mesasOcupadas = mesas.filter((m) => m.estado === "ocupada" && m.sesionActiva);

      unsubs.forEach((u) => u());

      const nuevosUnsubs = [];

      mesasOcupadas.forEach((mesa) => {
        const unsub = onPedidosSesionChange(mesa.id, mesa.sesionActiva, (pedidos) => {
          setPedidosPorMesa((prev) => {
            const sinEstaMesa = prev.filter((p) => p.mesaId !== mesa.id);
            const pedidosConMesa = pedidos.map((p) => ({
              ...p,
              mesaId: mesa.id,
              sesionId: mesa.sesionActiva,
              mesaNumero: mesa.numero,
            }));
            return [...sinEstaMesa, ...pedidosConMesa];
          });
        });
        nuevosUnsubs.push(unsub);
      });

      setUnsubs(nuevosUnsubs);
    };

    cargar();

    return () => unsubs.forEach((u) => u());
  }, []);

  const marcarEntregado = async (pedido) => {
    await updatePedidoSesion(pedido.mesaId, pedido.sesionId, pedido.id, {
      estado: "entregado",
      llamarCamarero: false,
      pedirCuenta: false,
    });
  };

  const atenderCamarero = async (pedido) => {
    await updatePedidoSesion(pedido.mesaId, pedido.sesionId, pedido.id, {
      llamarCamarero: false,
    });
  };

  const atenderCuenta = async (pedido) => {
    await updatePedidoSesion(pedido.mesaId, pedido.sesionId, pedido.id, {
      pedirCuenta: false,
    });
  };

  const total = (platos) =>
    platos?.reduce((acc, p) => acc + p.precio * p.cantidad, 0) || 0;

  const pedidosFiltrados = pedidosPorMesa
    .filter((p) => {
      if (filtro === "todos") return true;
      if (filtro === "pendiente") return p.estado === "pendiente";
      if (filtro === "entregado") return p.estado === "entregado";
      if (filtro === "cuenta") return p.pedirCuenta;
      if (filtro === "camarero") return p.llamarCamarero;
      return true;
    })
    .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds);

  const pendientes = pedidosPorMesa.filter((p) => p.estado === "pendiente").length;
  const cuentas = pedidosPorMesa.filter((p) => p.pedirCuenta).length;
  const camareros = pedidosPorMesa.filter((p) => p.llamarCamarero).length;

  const totalCuentaMesa = (mesaNumero) => {
    return pedidosPorMesa
      .filter((p) => p.mesaNumero === mesaNumero)
      .reduce((acc, p) => acc + total(p.platos), 0);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Pedidos</h1>
          <p className="text-stone-400 text-sm mt-1">Vista en tiempo real por sesión de mesa</p>
        </div>
        <div className="flex gap-2">
          {cuentas > 0 && (
            <div className="bg-blue-100 text-blue-600 border border-blue-200 px-4 py-2 rounded-xl text-sm font-medium animate-pulse">
              🧾 {cuentas} mesa{cuentas > 1 ? "s" : ""} pide la cuenta
            </div>
          )}
          {camareros > 0 && (
            <div className="bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-medium animate-pulse">
              🔔 {camareros} mesa{camareros > 1 ? "s" : ""} llama al camarero
            </div>
          )}
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm text-center">
          <p className="text-3xl font-bold text-amber-500 mb-1">{pendientes}</p>
          <p className="text-xs uppercase tracking-widest text-stone-400">Pendientes</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm text-center">
          <p className="text-3xl font-bold text-green-500 mb-1">
            {pedidosPorMesa.filter((p) => p.estado === "entregado").length}
          </p>
          <p className="text-xs uppercase tracking-widest text-stone-400">Entregados</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm text-center">
          <p className="text-3xl font-bold text-red-500 mb-1">{camareros}</p>
          <p className="text-xs uppercase tracking-widest text-stone-400">Llaman camarero</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm text-center">
          <p className="text-3xl font-bold text-blue-500 mb-1">{cuentas}</p>
          <p className="text-xs uppercase tracking-widest text-stone-400">Piden cuenta</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { value: "todos", label: "Todos" },
          { value: "pendiente", label: "Pendientes" },
          { value: "entregado", label: "Entregados" },
          { value: "camarero", label: "Llaman camarero" },
          { value: "cuenta", label: "Piden cuenta" },
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

      {/* Pedidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pedidosFiltrados.map((pedido) => (
          <div
            key={pedido.id}
            className={`bg-white rounded-2xl border shadow-sm p-5 ${
              pedido.pedirCuenta
                ? "border-blue-300"
                : pedido.llamarCamarero
                ? "border-red-300"
                : "border-stone-100"
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-stone-400">Mesa</p>
                <p className="text-2xl font-bold text-stone-800">#{pedido.mesaNumero}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs px-2 py-1 rounded-full border font-medium ${
                  pedido.estado === "pendiente"
                    ? "bg-amber-100 text-amber-600 border-amber-200"
                    : "bg-green-100 text-green-600 border-green-200"
                }`}>
                  {pedido.estado === "pendiente" ? "Pendiente" : "Entregado"}
                </span>
                <span className="text-xs text-stone-400">
                  {pedido.timestamp?.toDate?.()?.toLocaleTimeString("es-DO", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>

            {pedido.pedirCuenta && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 mb-3 flex justify-between items-center">
                <span className="text-xs text-blue-600 font-medium">
                  🧾 Mesa solicita la cuenta — Total: RD${totalCuentaMesa(pedido.mesaNumero)}
                </span>
                <button
                  onClick={() => atenderCuenta(pedido)}
                  className="text-xs text-blue-400 hover:text-blue-600 transition ml-2 shrink-0"
                >
                  ✓ Atendido
                </button>
              </div>
            )}

            {pedido.llamarCamarero && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-3 flex justify-between items-center">
                <span className="text-xs text-red-500 font-medium">
                  🔔 Mesa solicita al camarero
                </span>
                <button
                  onClick={() => atenderCamarero(pedido)}
                  className="text-xs text-red-400 hover:text-red-600 transition ml-2 shrink-0"
                >
                  ✓ Atendido
                </button>
              </div>
            )}

            {pedido.platos?.length > 0 && (
              <div className="space-y-2 mb-4">
                {pedido.platos.map((plato, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-stone-600">{plato.cantidad}x {plato.nombre}</span>
                    <span className="text-stone-500">RD${plato.precio * plato.cantidad}</span>
                  </div>
                ))}
                <div className="border-t border-stone-100 pt-2 flex justify-between">
                  <span className="text-sm text-stone-400">Total</span>
                  <span className="font-bold text-stone-800">RD${total(pedido.platos)}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {pedido.estado === "pendiente" && pedido.platos?.length > 0 && (
                <button
                  onClick={() => marcarEntregado(pedido)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl py-2.5 text-sm transition"
                >
                  Marcar como entregado
                </button>
              )}
              <button
                onClick={() => setCuentaModal({
                  mesaId: pedido.mesaId,
                  sesionId: pedido.sesionId,
                  mesaNumero: pedido.mesaNumero,
                })}
                className="w-full border border-stone-200 text-stone-600 hover:bg-stone-50 font-medium rounded-xl py-2.5 text-sm transition"
              >
                🧾 Ver cuenta completa
              </button>
            </div>
          </div>
        ))}

        {pedidosFiltrados.length === 0 && (
          <div className="col-span-3 text-center py-12 text-stone-400 text-sm">
            No hay pedidos activos
          </div>
        )}
      </div>

      {cuentaModal && (
        <ModalCuenta
          mesa={cuentaModal}
          onClose={() => setCuentaModal(null)}
        />
      )}
    </div>
  );
}