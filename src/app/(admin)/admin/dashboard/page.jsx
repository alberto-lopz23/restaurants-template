export default function Dashboard() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">Dashboard</h1>
        <p className="text-stone-400 text-sm mt-1">Bienvenido al panel de administración</p>
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: "Mesas ocupadas", valor: "4/10", color: "bg-amber-50 text-amber-600" },
          { label: "Pedidos activos", valor: "7", color: "bg-blue-50 text-blue-600" },
          { label: "Reservas hoy", valor: "12", color: "bg-green-50 text-green-600" },
          { label: "Platos agotados", valor: "2", color: "bg-red-50 text-red-600" },
        ].map((card) => (
          <div key={card.label} className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
            <p className="text-stone-400 text-xs uppercase tracking-widest mb-3">{card.label}</p>
            <p className={`text-3xl font-bold ${card.color} w-fit px-3 py-1 rounded-xl`}>
              {card.valor}
            </p>
          </div>
        ))}
      </div>

      {/* Placeholder de actividad reciente */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
        <h2 className="text-stone-800 font-semibold mb-4">Actividad reciente</h2>
        <p className="text-stone-400 text-sm">Los pedidos y reservas de hoy aparecerán aquí.</p>
      </div>
    </div>
  );
}