"use client";
import useConfig from "@/hooks/useConfig";

export default function Footer() {
  const config = useConfig();

  return (
    <footer className="bg-stone-900 text-stone-400 py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">

          <div>
            <h3 className="text-white font-bold text-xl mb-3">{config?.nombre || "La Casa de Juan"}</h3>
            <p className="text-sm leading-relaxed text-stone-500">
              {config?.slogan || "Sabores auténticos dominicanos en el corazón de Santo Domingo."}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500 mb-4">Navegación</p>
            <div className="space-y-2 text-sm">
              <a href="#nosotros" className="block hover:text-amber-400 transition">Sobre Nosotros</a>
              <a href="#destacados" className="block hover:text-amber-400 transition">Menú</a>
              <a href="#galeria" className="block hover:text-amber-400 transition">Galería</a>
              <a href="#resenas" className="block hover:text-amber-400 transition">Reseñas</a>
              <a href="#contacto" className="block hover:text-amber-400 transition">Contacto</a>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-stone-500 mb-4">Contacto</p>
            <div className="space-y-2 text-sm">
              <p>{config?.direccion || ""}</p>
              <a href={`tel:${config?.telefono}`} className="block hover:text-amber-400 transition mt-3">
                {config?.telefono || ""}
              </a>
              {config?.whatsapp && (
                <a href={`https://wa.me/${config.whatsapp}`} target="_blank" rel="noopener noreferrer" className="block hover:text-amber-400 transition">
                  WhatsApp
                </a>
              )}
            </div>
          </div>

        </div>

        <div className="border-t border-stone-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-600">
          <p>© 2025 {config?.nombre || "La Casa de Juan"}. Todos los derechos reservados.</p>
          <p>Desarrollado con ❤️ en Santo Domingo</p>
        </div>
      </div>
    </footer>
  );
}