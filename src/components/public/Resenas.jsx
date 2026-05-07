const resenas = [
  {
    id: 1,
    nombre: "María González",
    fecha: "Marzo 2025",
    estrellas: 5,
    comentario: "Una experiencia increíble. La bandera dominicana es exactamente como la de mi abuela. El ambiente es acogedor y el servicio fue excelente.",
    avatar: "MG",
  },
  {
    id: 2,
    nombre: "Carlos Rodríguez",
    fecha: "Febrero 2025",
    estrellas: 5,
    comentario: "El sancocho es espectacular, de los mejores que he probado en Santo Domingo. Definitivamente volvemos.",
    avatar: "CR",
  },
  {
    id: 3,
    nombre: "Ana Martínez",
    fecha: "Enero 2025",
    estrellas: 4,
    comentario: "Muy buen restaurante, la comida deliciosa y el trato muy amable. El flan de coco es para morirse.",
    avatar: "AM",
  },
  {
    id: 4,
    nombre: "Luis Pérez",
    fecha: "Enero 2025",
    estrellas: 5,
    comentario: "El mejor restaurante dominicano de la zona. Los tostones con salami son una delicia y la mamajuana es auténtica.",
    avatar: "LP",
  },
];

export default function Resenas() {
  return (
    <section id="resenas" className="bg-stone-50 py-24 px-6">
      <div className="max-w-6xl mx-auto">

        {/* Título */}
        <div className="text-center mb-16">
          <p className="text-amber-500 text-sm uppercase tracking-widest mb-3">
            Lo que dicen de nosotros
          </p>
          <h2 className="text-4xl font-bold text-stone-800">Reseñas</h2>
        </div>

        {/* Grid de reseñas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resenas.map((resena) => (
            <div
              key={resena.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"
            >
              {/* Estrellas */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={i < resena.estrellas ? "text-amber-400" : "text-stone-200"}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Comentario */}
              <p className="text-stone-600 leading-relaxed mb-6">
                "{resena.comentario}"
              </p>

              {/* Autor */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 font-bold text-sm flex items-center justify-center">
                  {resena.avatar}
                </div>
                <div>
                  <p className="font-semibold text-stone-800 text-sm">{resena.nombre}</p>
                  <p className="text-stone-400 text-xs">{resena.fecha}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}