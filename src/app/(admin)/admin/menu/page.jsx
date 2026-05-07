"use client";
import { useState, useEffect } from "react";
import { getPlatos, addPlato, updatePlato, deletePlato } from "@/lib/db";

const categoriasOpciones = [
  "Entradas",
  "Platos Principales",
  "Bebidas",
  "Postres",
];

export default function AdminMenu() {
  const [platos, setPlatos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [platoEditando, setPlatoEditando] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    precio: "",
    descripcion: "",
    categoria: "Entradas",
    disponible: true,
    destacado: false,
  });
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");

  useEffect(() => {
    cargarPlatos();
  }, []);

  const cargarPlatos = async () => {
    setCargando(true);
    const data = await getPlatos();
    setPlatos(data);
    setCargando(false);
  };

  const abrirModal = (plato = null) => {
    if (plato) {
      setPlatoEditando(plato);
      setForm({
        nombre: plato.nombre,
        precio: plato.precio,
        descripcion: plato.descripcion || "",
        categoria: plato.categoria,
        disponible: plato.disponible,
        destacado: plato.destacado || false,
      });
    } else {
      setPlatoEditando(null);
      setForm({
        nombre: "",
        precio: "",
        descripcion: "",
        categoria: "Entradas",
        disponible: true,
        destacado: false,
      });
    }
    setModalAbierto(true);
  };

  const guardar = async () => {
    if (!form.nombre || !form.precio) return;
    const data = { ...form, precio: Number(form.precio) };
    if (platoEditando) {
      await updatePlato(platoEditando.id, data);
    } else {
      await addPlato(data);
    }
    setModalAbierto(false);
    cargarPlatos();
  };

  const eliminar = async (id) => {
    if (confirm("¿Eliminar este plato?")) {
      await deletePlato(id);
      cargarPlatos();
    }
  };

  const toggleDisponible = async (plato) => {
    await updatePlato(plato.id, { disponible: !plato.disponible });
    cargarPlatos();
  };

  const platosFiltrados =
    categoriaFiltro === "Todas"
      ? platos
      : platos.filter((p) => p.categoria === categoriaFiltro);

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-stone-400 text-sm">Cargando menú...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Menú</h1>
          <p className="text-stone-400 text-sm mt-1">
            Gestiona los platos del restaurante
          </p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-5 py-2.5 rounded-xl text-sm transition"
        >
          + Agregar plato
        </button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["Todas", ...categoriasOpciones].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaFiltro(cat)}
            className={`px-4 py-2 rounded-xl text-sm border transition ${
              categoriaFiltro === cat
                ? "bg-stone-900 text-white border-stone-900"
                : "border-stone-200 text-stone-500 hover:border-stone-400"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        {platosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-stone-400 text-sm">
            No hay platos en esta categoría
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-stone-400">
                  Plato
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-stone-400">
                  Categoría
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-stone-400">
                  Precio
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-stone-400">
                  Estado
                </th>
                <th className="text-left px-6 py-4 text-xs uppercase tracking-widest text-stone-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {platosFiltrados.map((plato) => (
                <tr key={plato.id} className="hover:bg-stone-50 transition">
                  <td className="px-6 py-4">
                    <p className="font-medium text-stone-800">{plato.nombre}</p>
                    {plato.descripcion && (
                      <p className="text-xs text-stone-400 mt-0.5">
                        {plato.descripcion}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-stone-400 text-sm">
                    {plato.categoria}
                  </td>
                  <td className="px-6 py-4 text-stone-700 font-medium">
                    RD${plato.precio}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleDisponible(plato)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                        plato.disponible
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-500"
                      }`}
                    >
                      {plato.disponible ? "Disponible" : "Agotado"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => abrirModal(plato)}
                        className="text-sm text-stone-400 hover:text-amber-600 transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => eliminar(plato.id)}
                        className="text-sm text-stone-400 hover:text-red-500 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalAbierto && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
          onClick={() => setModalAbierto(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-stone-800 font-bold text-lg mb-5">
              {platoEditando ? "Editar plato" : "Agregar plato"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">
                  Nombre
                </label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition"
                  placeholder="Ej: Tostones con Salami"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">
                  Descripción
                </label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) =>
                    setForm({ ...form, descripcion: e.target.value })
                  }
                  rows={2}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition resize-none"
                  placeholder="Descripción del plato"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">
                  Precio (RD$)
                </label>
                <input
                  type="number"
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition"
                  placeholder="Ej: 250"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest text-stone-400 mb-1 block">
                  Categoría
                </label>
                <select
                  value={form.categoria}
                  onChange={(e) =>
                    setForm({ ...form, categoria: e.target.value })
                  }
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-400 transition"
                >
                  {categoriasOpciones.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.disponible}
                    onChange={(e) =>
                      setForm({ ...form, disponible: e.target.checked })
                    }
                    className="w-4 h-4 accent-amber-500"
                  />
                  Disponible
                </label>
                <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.destacado}
                    onChange={(e) =>
                      setForm({ ...form, destacado: e.target.checked })
                    }
                    className="w-4 h-4 accent-amber-500"
                  />
                  Destacado
                </label>
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
                {platoEditando ? "Guardar cambios" : "Agregar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
