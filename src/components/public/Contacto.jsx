"use client";
import useConfig from "@/hooks/useConfig";

export default function Contacto() {
  const config = useConfig();

  const formatHora = (hora) => {
    if (!hora) return "";
    const [h, m] = hora.split(":");
    const num = parseInt(h);
    const ampm = num >= 12 ? "pm" : "am";
    const h12 = num % 12 || 12;
    return `${h12}:${m}${ampm}`;
  };

  return (
    <section id="contacto" className="bg-white py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-amber-500 text-sm uppercase tracking-widest mb-3">
            Encuéntranos
          </p>
          <h2 className="text-4xl font-bold text-stone-800">
            Contacto y Ubicación
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Dirección</p>
              <p className="text-stone-700 font-medium text-sm">
                {config?.direccion || "Santo Domingo, RD"}
              </p>
            </div>

            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Teléfono</p>
              <a href={`tel:${config?.telefono}`} className="text-stone-700 font-medium text-sm hover:text-amber-600 transition">
                {config?.telefono || ""}
              </a>
            </div>

            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.526 5.843L.057 23.571a.75.75 0 00.921.921l5.728-1.469A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.891 0-3.667-.497-5.2-1.367l-.374-.214-3.875.994.994-3.875-.214-.374A9.953 9.953 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
                </svg>
              </div>
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">WhatsApp</p>
              <a href={`https://wa.me/${config?.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-stone-700 font-medium text-sm hover:text-green-500 transition">
                {config?.telefono || ""}
              </a>
            </div>

            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-2">Horarios</p>
              <div className="space-y-1 text-sm text-stone-700">
                <div className="flex justify-between">
                  <span>Lun — Vie</span>
                  <span className="font-medium">
                    {config?.semanaAbre
                      ? `${formatHora(config.semanaAbre)} — ${formatHora(config.semanaCierra)}`
                      : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sáb — Dom</span>
                  <span className="font-medium">
                    {config?.findeAbre
                      ? `${formatHora(config.findeAbre)} — ${formatHora(config.findeCierra)}`
                      : ""}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100 sm:col-span-2">
              <p className="text-xs uppercase tracking-widest text-stone-400 mb-3">Síguenos</p>
              <div className="flex gap-3">
                {config?.instagram ? (
                  
                   <a href={`https://instagram.com/${config.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm text-stone-600 hover:border-amber-400 hover:text-amber-600 transition"
                  >
                    Instagram
                  </a>
                ) : (
                  <a href="#" className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm text-stone-600 hover:border-amber-400 hover:text-amber-600 transition">
                    Instagram
                  </a>
                )}
                {config?.facebook ? (
                  
                   <a href={`https://facebook.com/${config.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm text-stone-600 hover:border-amber-400 hover:text-amber-600 transition"
                  >
                    Facebook
                  </a>
                ) : (
                  <a href="#" className="flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm text-stone-600 hover:border-amber-400 hover:text-amber-600 transition">
                    Facebook
                  </a>
                )}
              </div>
            </div>

          </div>

          <div className="rounded-2xl overflow-hidden shadow-sm border border-stone-100 h-80 md:h-full min-h-72">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.123456789!2d-69.9312!3d18.4861!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTjCsDI5JzEwLjAiTiA2OcKwNTUnNTIuMyJX!5e0!3m2!1ses!2sdo!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: "300px" }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}