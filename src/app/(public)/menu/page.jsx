"use client";
import { useState, useEffect, Suspense } from "react";
import { getPlatos } from "@/lib/db";
import { useSearchParams } from "next/navigation";

const categorias = ["Entradas", "Platos Principales", "Bebidas", "Postres"];

function MenuContent() {
  const searchParams = useSearchParams();
  const mesa = searchParams.get("mesa");

  const [platos, setPlatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState("Entradas");
  const [animando, setAnimando] = useState(false);
  const [direccion, setDireccion] = useState("right");
  const [platosMostrados, setPlatosMostrados] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const cargar = async () => {
      const data = await getPlatos();
      setPlatos(data);
      setPlatosMostrados(data.filter((p) => p.categoria === "Entradas"));
      setCargando(false);
    };
    cargar();
  }, []);

  const cambiarCategoria = (nueva) => {
    if (nueva === categoriaActiva || animando) return;
    const indexActual = categorias.indexOf(categoriaActiva);
    const indexNuevo = categorias.indexOf(nueva);
    setDireccion(indexNuevo > indexActual ? "right" : "left");
    setAnimando(true);
    setTimeout(() => {
      setCategoriaActiva(nueva);
      setPlatosMostrados(platos.filter((p) => p.categoria === nueva));
      setAnimando(false);
    }, 350);
  };

  const agregarAlCarrito = (plato) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.id === plato.id);
      if (existe) {
        return prev.map((p) => p.id === plato.id ? { ...p, cantidad: p.cantidad + 1 } : p);
      }
      return [...prev, { ...plato, cantidad: 1 }];
    });
  };

  const quitarDelCarrito = (id) => {
    setCarrito((prev) => {
      const existe = prev.find((p) => p.id === id);
      if (existe.cantidad === 1) return prev.filter((p) => p.id !== id);
      return prev.map((p) => p.id === id ? { ...p, cantidad: p.cantidad - 1 } : p);
    });
  };

  const enviarPedido = async () => {
    if (!mesa || carrito.length === 0) return;
    setEnviando(true);
    try {
      const { getMesas, getSesionActiva, addPedidoSesion, getPedidosSesion, updatePedidoSesion, incrementarPopularidad } = await import("@/lib/db");
      const { arrayUnion } = await import("firebase/firestore");

      const mesas = await getMesas();
      const mesaDoc = mesas.find((m) => m.numero === Number(mesa));
      if (!mesaDoc) {
        alert("Mesa no encontrada. Escanea el QR nuevamente.");
        return;
      }

      const sesion = await getSesionActiva(mesaDoc.id);
      if (!sesion) {
        alert("Esta mesa no tiene una sesión activa. Pide al personal que abra la mesa.");
        return;
      }

      const platosNuevos = carrito.map((p) => ({
        nombre: p.nombre,
        cantidad: p.cantidad,
        precio: p.precio,
      }));

      const pedidosExistentes = await getPedidosSesion(mesaDoc.id, sesion.id);
      const pedidoPendiente = pedidosExistentes.find((p) => p.estado === "pendiente");

      if (pedidoPendiente) {
        await updatePedidoSesion(mesaDoc.id, sesion.id, pedidoPendiente.id, {
          platos: arrayUnion(...platosNuevos),
          timestamp: new Date(),
        });
      } else {
        await addPedidoSesion(mesaDoc.id, sesion.id, {
          mesa: Number(mesa),
          platos: platosNuevos,
          estado: "pendiente",
          llamarCamarero: false,
          pedirCuenta: false,
          timestamp: new Date(),
        });
      }

      await incrementarPopularidad(
        carrito.map((p) => ({ id: p.id, cantidad: p.cantidad }))
      );

      setCarrito([]);
      setCarritoAbierto(false);
      setPedidoEnviado(true);
      setTimeout(() => setPedidoEnviado(false), 4000);
    } catch (err) {
      console.error(err);
      alert("Error al enviar el pedido. Intenta de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  const llamarCamarero = async () => {
    if (!mesa) return;
    try {
      const { getMesas, getSesionActiva, getPedidosSesion, addPedidoSesion, updatePedidoSesion } = await import("@/lib/db");

      const mesas = await getMesas();
      const mesaDoc = mesas.find((m) => m.numero === Number(mesa));
      if (!mesaDoc) return;

      const sesion = await getSesionActiva(mesaDoc.id);
      if (!sesion) {
        alert("Esta mesa no tiene una sesión activa.");
        return;
      }

      const pedidosExistentes = await getPedidosSesion(mesaDoc.id, sesion.id);
      const pedidoPendiente = pedidosExistentes.find((p) => p.estado === "pendiente");

      if (pedidoPendiente) {
        await updatePedidoSesion(mesaDoc.id, sesion.id, pedidoPendiente.id, { llamarCamarero: true });
      } else {
        await addPedidoSesion(mesaDoc.id, sesion.id, {
          mesa: Number(mesa),
          platos: [],
          estado: "pendiente",
          llamarCamarero: true,
          pedirCuenta: false,
          timestamp: new Date(),
        });
      }

      setCarritoAbierto(false);
      alert("¡El camarero está en camino!");
    } catch (err) {
      alert("Error. Intenta de nuevo.");
    }
  };

  const pedirCuenta = async () => {
    if (!mesa) return;
    try {
      const { getMesas, getSesionActiva, getPedidosSesion, updatePedidoSesion } = await import("@/lib/db");

      const mesas = await getMesas();
      const mesaDoc = mesas.find((m) => m.numero === Number(mesa));
      if (!mesaDoc) return;

      const sesion = await getSesionActiva(mesaDoc.id);
      if (!sesion) return;

      const pedidosExistentes = await getPedidosSesion(mesaDoc.id, sesion.id);
      const pedidoPendiente = pedidosExistentes.find((p) => p.estado === "pendiente");

      if (pedidoPendiente) {
        await updatePedidoSesion(mesaDoc.id, sesion.id, pedidoPendiente.id, { pedirCuenta: true });
      }

      setCarritoAbierto(false);
      alert("¡En un momento el camarero trae tu cuenta!");
    } catch (err) {
      alert("Error. Intenta de nuevo.");
    }
  };

  const totalCarrito = carrito.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  const cantidadCarrito = carrito.reduce((acc, p) => acc + p.cantidad, 0);

  if (cargando) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-400 text-sm">Cargando menú...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 py-8 text-center px-4">
        <p className="text-stone-400 text-xs uppercase tracking-[0.3em] mb-2">La Casa de Juan</p>
        <h1 className="text-3xl font-bold text-stone-800">Nuestra Carta</h1>
        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="h-px w-16 bg-stone-300" />
          <span className="text-stone-400 text-sm">✦</span>
          <div className="h-px w-16 bg-stone-300" />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex justify-center overflow-x-auto">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => cambiarCategoria(cat)}
              className={`px-5 py-4 text-sm font-medium tracking-wide transition-all border-b-2 whitespace-nowrap ${
                categoriaActiva === cat
                  ? "border-stone-800 text-stone-800"
                  : "border-transparent text-stone-400 hover:text-stone-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
        <div style={{ perspective: "1000px" }}>
          <div
            style={{
              transition: "transform 0.35s ease, opacity 0.35s ease",
              transform: animando
                ? direccion === "right"
                  ? "rotateY(-20deg) translateX(-20px)"
                  : "rotateY(20deg) translateX(20px)"
                : "rotateY(0deg) translateX(0px)",
              opacity: animando ? 0 : 1,
            }}
          >
            <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
              <div className="px-6 pt-6 pb-3">
                <h2 className="text-xl font-bold text-stone-800">{categoriaActiva}</h2>
                <div className="h-px bg-stone-100 mt-3" />
              </div>

              <div className="px-6 pb-6 divide-y divide-stone-100">
                {platosMostrados.length === 0 ? (
                  <p className="text-stone-400 text-sm py-6">No hay platos en esta categoría.</p>
                ) : (
                  platosMostrados.map((plato) => {
                    const enCarrito = carrito.find((p) => p.id === plato.id);
                    return (
                      <div
                        key={plato.id}
                        className={`py-5 flex justify-between items-center gap-4 ${!plato.disponible ? "opacity-40" : ""}`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-stone-800 font-semibold">{plato.nombre}</h3>
                            {plato.destacado && (
                              <span className="text-xs bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">
                                Recomendado
                              </span>
                            )}
                          </div>
                          <p className="text-stone-400 text-sm leading-relaxed mb-2">{plato.descripcion}</p>
                          <span className="text-stone-800 font-bold">RD${plato.precio}</span>
                          {!plato.disponible && (
                            <span className="text-xs text-red-400 ml-2">No disponible</span>
                          )}
                        </div>

                        {plato.disponible && (
                          <div className="flex items-center gap-2 shrink-0">
                            {enCarrito ? (
                              <>
                                <button
                                  onClick={() => quitarDelCarrito(plato.id)}
                                  className="w-8 h-8 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-100 transition flex items-center justify-center font-bold"
                                >
                                  −
                                </button>
                                <span className="text-stone-800 font-semibold w-4 text-center">{enCarrito.cantidad}</span>
                                <button
                                  onClick={() => agregarAlCarrito(plato)}
                                  className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-600 text-black transition flex items-center justify-center font-bold"
                                >
                                  +
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => agregarAlCarrito(plato)}
                                className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-600 text-black transition flex items-center justify-center font-bold"
                              >
                                +
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Navegación */}
            <div className="flex justify-between mt-6 px-1">
              <button
                onClick={() => {
                  const i = categorias.indexOf(categoriaActiva);
                  if (i > 0) cambiarCategoria(categorias[i - 1]);
                }}
                disabled={categorias.indexOf(categoriaActiva) === 0}
                className="text-stone-400 hover:text-stone-700 disabled:opacity-20 transition text-sm"
              >
                ← {categorias[categorias.indexOf(categoriaActiva) - 1] || ""}
              </button>
              <button
                onClick={() => {
                  const i = categorias.indexOf(categoriaActiva);
                  if (i < categorias.length - 1) cambiarCategoria(categorias[i + 1]);
                }}
                disabled={categorias.indexOf(categoriaActiva) === categorias.length - 1}
                className="text-stone-400 hover:text-stone-700 disabled:opacity-20 transition text-sm"
              >
                {categorias[categorias.indexOf(categoriaActiva) + 1] || ""} →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notificación pedido enviado */}
      {pedidoEnviado && (
        <div className="fixed top-6 left-0 right-0 px-4 z-50 flex justify-center">
          <div className="bg-green-500 text-white px-6 py-3 rounded-2xl shadow-lg font-medium text-sm">
            ✓ Pedido enviado correctamente
          </div>
        </div>
      )}

      {/* Botón flotante del carrito */}
      {cantidadCarrito > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-4 z-20">
          <button
            onClick={() => setCarritoAbierto(true)}
            className="w-full max-w-3xl mx-auto flex items-center justify-between bg-stone-900 hover:bg-stone-800 text-white rounded-2xl px-6 py-4 shadow-2xl transition"
          >
            <div className="flex items-center gap-3">
              <span className="bg-amber-500 text-black text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {cantidadCarrito}
              </span>
              <span className="font-medium">Ver pedido</span>
            </div>
            <span className="font-bold">RD${totalCarrito}</span>
          </button>
        </div>
      )}

      {/* Modal del carrito */}
      {carritoAbierto && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
          onClick={() => setCarritoAbierto(false)}
        >
          <div
            className="bg-white w-full max-w-3xl rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-stone-800 font-bold text-xl">Tu pedido</h2>
              <button onClick={() => setCarritoAbierto(false)} className="text-stone-400 hover:text-stone-700 text-2xl">✕</button>
            </div>

            <div className="space-y-4 mb-6">
              {carrito.map((plato) => (
                <div key={plato.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <p className="text-stone-800 font-medium">{plato.nombre}</p>
                    <p className="text-stone-400 text-sm">RD${plato.precio} c/u</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => quitarDelCarrito(plato.id)}
                      className="w-8 h-8 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-100 transition flex items-center justify-center font-bold"
                    >
                      −
                    </button>
                    <span className="text-stone-800 font-semibold w-4 text-center">{plato.cantidad}</span>
                    <button
                      onClick={() => agregarAlCarrito(plato)}
                      className="w-8 h-8 rounded-full bg-amber-500 hover:bg-amber-600 text-black transition flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-stone-800 font-bold ml-4 w-20 text-right">
                    RD${plato.precio * plato.cantidad}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-100 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Total</span>
                <span className="text-stone-800 font-bold text-xl">RD${totalCarrito}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={enviarPedido}
                disabled={enviando || !mesa}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-black font-semibold rounded-xl py-4 transition"
              >
                {enviando ? "Enviando..." : "Enviar pedido"}
              </button>
              <button
                onClick={llamarCamarero}
                disabled={!mesa}
                className="w-full border border-stone-200 text-stone-600 font-medium rounded-xl py-3 hover:bg-stone-50 disabled:opacity-40 transition"
              >
                🔔 Llamar al camarero
              </button>
              <button
                onClick={pedirCuenta}
                disabled={!mesa}
                className="w-full border border-stone-200 text-stone-600 font-medium rounded-xl py-3 hover:bg-stone-50 disabled:opacity-40 transition"
              >
                🧾 Pedir la cuenta
              </button>
              {!mesa && (
                <p className="text-center text-xs text-red-400">
                  Escanea el QR de tu mesa para poder pedir
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-400 text-sm">Cargando menú...</p>
      </div>
    }>
      <MenuContent />
    </Suspense>
  );
}