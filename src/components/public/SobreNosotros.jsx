export default function SobreNosotros() {
  return (
    <section id="nosotros" className="bg-white py-24 px-6">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
        
        {/* Imagen */}
        <div className="w-full md:w-1/2">
          <img
            src="https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800"
            alt="Sobre nosotros"
            className="rounded-2xl object-cover w-full h-80 shadow-lg"
          />
        </div>

        {/* Texto */}
        <div className="w-full md:w-1/2">
          <p className="text-amber-500 text-sm uppercase tracking-widest mb-3">
            Nuestra Historia
          </p>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Tradición y sabor desde 1995
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            Somos un restaurante familiar ubicado en el corazón de Santo Domingo, 
            dedicados a traerte los sabores más auténticos de la cocina dominicana 
            con ingredientes frescos y recetas que han pasado de generación en generación.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed">
            Cada plato que servimos lleva el amor y dedicación de nuestra familia. 
            Bienvenidos a nuestra mesa.
          </p>
        </div>

      </div>
    </section>
  )
}