"use client";
import { useState, useEffect, useRef } from "react";

const horasDisponibles = [
  "12:00pm", "12:30pm", "1:00pm", "1:30pm", "2:00pm", "2:30pm",
  "3:00pm", "3:30pm", "7:00pm", "7:30pm", "8:00pm", "8:30pm",
  "9:00pm", "9:30pm",
];

function horaDisponible(hora) {
  const ocupadas = ["8:00pm", "1:00pm"];
  return !ocupadas.includes(hora);
}

function horaAlternativa(hora) {
  const idx = horasDisponibles.indexOf(hora);
  for (let i = idx + 1; i < horasDisponibles.length; i++) {
    if (horaDisponible(horasDisponibles[i])) return horasDisponibles[i];
  }
  for (let i = idx - 1; i >= 0; i--) {
    if (horaDisponible(horasDisponibles[i])) return horasDisponibles[i];
  }
  return null;
}

function normalizarHora(texto) {
  const lower = texto.toLowerCase().trim();
  const directa = horasDisponibles.find((h) => lower.includes(h));
  if (directa) return directa;
  const matchCorto = lower.match(/\b(\d{1,2})(:\d{2})?\s*(am|pm)\b/);
  if (matchCorto) {
    const candidata = `${matchCorto[1]}${matchCorto[2] || ":00"}${matchCorto[3]}`;
    return horasDisponibles.find((h) => h === candidata) || null;
  }
  const matchNumero = lower.match(/^\d{1,2}$/);
  if (matchNumero) {
    const num = parseInt(lower);
    const meridiem = num >= 7 ? "pm" : "am";
    return horasDisponibles.find((h) => h === `${num}:00${meridiem}`) || null;
  }
  return null;
}

function extraerFecha(texto) {
  const lower = texto.toLowerCase();
  const meses = {
    enero: "01", febrero: "02", marzo: "03", abril: "04", mayo: "05",
    junio: "06", julio: "07", agosto: "08", septiembre: "09",
    octubre: "10", noviembre: "11", diciembre: "12",
  };

  // Día + mes explícito (23 de mayo, el 23 de junio)
  for (const [mes, num] of Object.entries(meses)) {
    const match = lower.match(new RegExp(`(\\d{1,2})\\s+(?:de\\s+)?${mes}`));
    if (match) {
      const año = new Date().getFullYear();
      return `${año}-${num}-${match[1].padStart(2, "0")}`;
    }
  }

  // Formato ISO
  const isoMatch = texto.match(/(\d{4}-\d{2}-\d{2})/);
  if (isoMatch) return isoMatch[1];

  // Solo día con artículo: "el 28", "para el 23", "día 15"
  const diaConArticulo = lower.match(/(?:el|para el|día)\s+(\d{1,2})\b/);
  if (diaConArticulo) return `__dia__${diaConArticulo[1]}`;

  return null;
}

function fechaValida(fecha) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return new Date(fecha + "T00:00:00") >= hoy;
}

function construirFechaConDia(dia, offsetMes = 0) {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1 + offsetMes).padStart(2, "0");
  const año = hoy.getFullYear();
  return `${año}-${mes}-${String(dia).padStart(2, "0")}`;
}

const FLUJO = {
  NINGUNO: "ninguno",
  PEDIR_NOMBRE: "pedir_nombre",
  PEDIR_WHATSAPP: "pedir_whatsapp",
  PEDIR_MES_CONFIRMACION: "pedir_mes_confirmacion",
  PEDIR_FECHA: "pedir_fecha",
  PEDIR_HORA: "pedir_hora",
  PEDIR_PERSONAS: "pedir_personas",
  CONFIRMACION: "confirmacion",
  COMPLETADO: "completado",
};

const PALABRAS_CONFIRMACION = [
  "sí", "si", "yes", "dale", "perfecto", "ok", "okay", "claro",
  "porfa", "por favor", "si por favor", "sí por favor", "bueno", "va", "listo",
];

function obtenerRespuestaGeneral(mensaje) {
  const lower = mensaje.toLowerCase();
  if (["hola", "buenas", "hey", "buenos días", "buenas tardes", "buenas noches"].some((k) => lower.includes(k)))
    return "¡Hola! Bienvenido a La Casa de Alberto 👋 ¿En qué te puedo ayudar hoy?";
  if (["horario", "abren", "cierran", "abierto", "cerrado"].some((k) => lower.includes(k)))
    return "Nuestro horario es:\n🕛 Lunes a Viernes: 12:00pm – 10:00pm\n🕛 Sábados y Domingos: 11:00am – 11:00pm";
  if (["ubicación", "ubicacion", "donde", "dónde", "dirección", "como llegar"].some((k) => lower.includes(k)))
    return "Estamos en:\n📍 Calle El Conde 253, Zona Colonial, Santo Domingo\n\nNos encuentras en Google Maps buscando 'La Casa de Alberto'.";
  if (["menú", "menu", "platos", "comida", "comer", "carta", "qué tienen"].some((k) => lower.includes(k)))
    return `Tenemos una variedad deliciosa de cocina dominicana 🍽️\n\nNuestros más pedidos:\n• Sancocho de Siete Carnes\n• Mofongo de Camarones\n• La Bandera Dominicana\n• Chivo Guisado\n\nVe el menú completo aquí 👉 https://www.platomeal.com/menu`;
  if (["precio", "costo", "cuanto", "cuánto", "vale", "cobran"].some((k) => lower.includes(k)))
    return "Nuestros precios van desde RD$80 en bebidas hasta RD$550 en platos principales 🤑\n\nPrecios exactos en: https://www.platomeal.com/menu";
  if (["estacionamiento", "parqueo", "parquear", "parking"].some((k) => lower.includes(k)))
    return "Sí contamos con estacionamiento para nuestros clientes 🚗\n\nTambién hay parqueos públicos cercanos en la Zona Colonial.";
  if (["wifi", "internet", "contraseña", "clave"].some((k) => lower.includes(k)))
    return "¡Sí, tenemos WiFi gratuito! 📶\n\nPídele la clave a cualquiera de nuestros camareros.";
  if (["whatsapp", "teléfono", "telefono", "llamar", "contacto", "número"].some((k) => lower.includes(k)))
    return "Puedes contactarnos por:\n📱 WhatsApp: 809-555-1247\n📞 Teléfono: 809-555-1247";
  if (["gracias", "excelente", "genial"].some((k) => lower.includes(k)))
    return "¡Con mucho gusto! 😊 Esperamos verte pronto en La Casa de Alberto. ¡Buen provecho!";
  return null;
}

function detectarConsultaDisponibilidad(mensaje) {
  const lower = mensaje.toLowerCase();
  const esConsulta = ["disponible", "hay mesa", "tienen mesa", "puedo ir", "hay espacio", "habrá"].some((k) => lower.includes(k));
  if (!esConsulta) return null;
  const horaMatch = lower.match(/(\d{1,2}(?::\d{2})?(?:am|pm))/);
  if (!horaMatch) return { soloConsulta: true };
  let hora = horaMatch[1];
  if (!hora.includes(":")) hora = hora.replace(/(am|pm)/, ":00$1");
  return { hora: horasDisponibles.find((h) => h === hora) || null, soloConsulta: false };
}

export default function ChatWidget() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([
    { de: "bot", texto: "¡Hola! Soy el asistente de La Casa de Alberto 🍽️ ¿En qué te puedo ayudar?" },
  ]);
  const [input, setInput] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const [flujo, setFlujo] = useState(FLUJO.NINGUNO);
  const [reserva, setReserva] = useState({ nombre: "", whatsapp: "", fecha: "", hora: "", personas: "", _diaTemp: null });
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, escribiendo]);

  const agregarBot = (texto, delay = 1000) => {
    setEscribiendo(true);
    setTimeout(() => {
      setEscribiendo(false);
      setMensajes((prev) => [...prev, { de: "bot", texto }]);
    }, delay + Math.random() * 400);
  };

  const procesarMensaje = (texto) => {
    const lower = texto.toLowerCase();

    if (flujo !== FLUJO.NINGUNO && flujo !== FLUJO.COMPLETADO) {

      if (flujo === FLUJO.PEDIR_NOMBRE) {
        const nombre = texto.trim();
        setReserva((r) => ({ ...r, nombre }));
        setFlujo(FLUJO.PEDIR_WHATSAPP);
        agregarBot(`Perfecto, ${nombre} 😊\n\n¿Cuál es tu número de WhatsApp?`);
        return;
      }

      if (flujo === FLUJO.PEDIR_WHATSAPP) {
        setReserva((r) => ({ ...r, whatsapp: texto.trim() }));
        // Si tenemos día pero no mes, preguntar mes
        if (reserva._diaTemp) {
          setFlujo(FLUJO.PEDIR_MES_CONFIRMACION);
          agregarBot(`¿Es para el ${reserva._diaTemp} de este mes, o prefieres otro mes?`);
        } else if (reserva.fecha) {
          setFlujo(FLUJO.PEDIR_HORA);
          agregarBot(`¿A qué hora? Nuestros horarios disponibles son:\n${horasDisponibles.join(", ")}`);
        } else {
          setFlujo(FLUJO.PEDIR_FECHA);
          agregarBot("¿Para qué fecha quieres la reservación? (Ejemplo: 23 de mayo)");
        }
        return;
      }

      if (flujo === FLUJO.PEDIR_MES_CONFIRMACION) {
        const dia = reserva._diaTemp;

        // Usuario confirma este mes
        if (PALABRAS_CONFIRMACION.some((k) => lower.includes(k)) || lower.includes("este mes") || lower.includes("corriente")) {
          const fecha = construirFechaConDia(dia, 0);
          if (!fechaValida(fecha)) {
            const fechaSig = construirFechaConDia(dia, 1);
            setReserva((r) => ({ ...r, fecha: fechaSig, _diaTemp: null }));
            setFlujo(FLUJO.PEDIR_HORA);
            agregarBot(`Ese día ya pasó este mes 😅 Te agendo para el ${dia} del próximo mes.\n\n¿A qué hora?\n${horasDisponibles.join(", ")}`);
            return;
          }
          setReserva((r) => ({ ...r, fecha, _diaTemp: null }));
          setFlujo(FLUJO.PEDIR_HORA);
          agregarBot(`Perfecto, el ${dia} de este mes 👍\n\n¿A qué hora?\n${horasDisponibles.join(", ")}`);
          return;
        }

        // Usuario mencionó un mes específico
        const fechaDetectada = extraerFecha(texto);
        if (fechaDetectada && !fechaDetectada.startsWith("__dia__")) {
          if (!fechaValida(fechaDetectada)) {
            agregarBot("Esa fecha ya pasó 😅 Por favor dime una fecha futura.");
            return;
          }
          setReserva((r) => ({ ...r, fecha: fechaDetectada, _diaTemp: null }));
          setFlujo(FLUJO.PEDIR_HORA);
          agregarBot(`Perfecto 👍\n\n¿A qué hora?\n${horasDisponibles.join(", ")}`);
          return;
        }

        // Mencionó próximo mes
        if (lower.includes("próximo") || lower.includes("proximo") || lower.includes("siguiente")) {
          const fechaSig = construirFechaConDia(dia, 1);
          setReserva((r) => ({ ...r, fecha: fechaSig, _diaTemp: null }));
          setFlujo(FLUJO.PEDIR_HORA);
          agregarBot(`Perfecto, el ${dia} del próximo mes 👍\n\n¿A qué hora?\n${horasDisponibles.join(", ")}`);
          return;
        }

        agregarBot(`¿Es este mes o prefieres otro? Puedes decirme "este mes" o el nombre del mes, como "junio".`);
        return;
      }

      if (flujo === FLUJO.PEDIR_FECHA) {
        // Solo número de día sin mes
        const soloDia = texto.trim().match(/^(\d{1,2})$/);
        if (soloDia) {
          const dia = parseInt(soloDia[1]);
          setReserva((r) => ({ ...r, _diaTemp: dia }));
          setFlujo(FLUJO.PEDIR_MES_CONFIRMACION);
          agregarBot(`¿Es para el ${dia} de este mes, o prefieres otro mes?`);
          return;
        }

        const fechaDetectada = extraerFecha(texto);
        if (fechaDetectada?.startsWith("__dia__")) {
          const dia = parseInt(fechaDetectada.replace("__dia__", ""));
          setReserva((r) => ({ ...r, _diaTemp: dia }));
          setFlujo(FLUJO.PEDIR_MES_CONFIRMACION);
          agregarBot(`¿Es para el ${dia} de este mes, o prefieres otro mes?`);
          return;
        }

        const fecha = fechaDetectada || texto.trim();
        if (!fechaValida(fecha)) {
          agregarBot("Esa fecha ya pasó 😅 Por favor dime una fecha futura.");
          return;
        }
        setReserva((r) => ({ ...r, fecha }));
        setFlujo(FLUJO.PEDIR_HORA);
        agregarBot(`¿A qué hora? Nuestros horarios disponibles son:\n${horasDisponibles.join(", ")}`);
        return;
      }

      if (flujo === FLUJO.PEDIR_HORA) {
        if (reserva.hora && PALABRAS_CONFIRMACION.some((k) => lower.includes(k))) {
          setFlujo(FLUJO.PEDIR_PERSONAS);
          agregarBot(`Perfecto, te agendo para las ${reserva.hora} 👍\n\n¿Para cuántas personas es la reservación?`);
          return;
        }
        const horaElegida = normalizarHora(texto);
        if (!horaElegida) {
          agregarBot(`No reconozco esa hora. Por favor elige una de estas:\n${horasDisponibles.join(", ")}`);
          return;
        }
        if (!horaDisponible(horaElegida)) {
          const alternativa = horaAlternativa(horaElegida);
          if (alternativa) {
            agregarBot(`Lo siento, las ${horaElegida} ya están ocupadas 😔\n\nPero tengo disponibilidad a las ${alternativa}. ¿Te funciona esa hora?`);
            setReserva((r) => ({ ...r, hora: alternativa }));
          } else {
            agregarBot("Lo siento, no tenemos disponibilidad para esa fecha. ¿Quieres intentar con otra fecha?");
            setFlujo(FLUJO.PEDIR_FECHA);
          }
          return;
        }
        setReserva((r) => ({ ...r, hora: horaElegida }));
        setFlujo(FLUJO.PEDIR_PERSONAS);
        agregarBot("¿Para cuántas personas es la reservación?");
        return;
      }

      if (flujo === FLUJO.PEDIR_PERSONAS) {
        const num = parseInt(texto);
        if (isNaN(num) || num < 1) {
          agregarBot("Por favor dime un número válido de personas.");
          return;
        }
        const nuevaReserva = { ...reserva, personas: num };
        setReserva(nuevaReserva);
        setFlujo(FLUJO.CONFIRMACION);
        agregarBot(
          `¡Perfecto! Déjame confirmar tu reservación:\n\n` +
          `👤 Nombre: ${nuevaReserva.nombre}\n` +
          `📱 WhatsApp: ${nuevaReserva.whatsapp}\n` +
          `📅 Fecha: ${nuevaReserva.fecha}\n` +
          `🕐 Hora: ${nuevaReserva.hora}\n` +
          `👥 Personas: ${nuevaReserva.personas}\n\n` +
          `¿Confirmas la reservación? (sí / no)`
        );
        return;
      }

      if (flujo === FLUJO.CONFIRMACION) {
        if (PALABRAS_CONFIRMACION.some((k) => lower.includes(k))) {
          setFlujo(FLUJO.COMPLETADO);
          agregarBot(
            `✅ ¡Reservación confirmada!\n\n` +
            `Te esperamos el ${reserva.fecha} a las ${reserva.hora}.\n\n` +
            `Si necesitas cancelar o cambiar algo, escríbenos por WhatsApp al 809-555-1247. ¡Hasta pronto! 😊`
          );
        } else {
          setFlujo(FLUJO.NINGUNO);
          setReserva({ nombre: "", whatsapp: "", fecha: "", hora: "", personas: "", _diaTemp: null });
          agregarBot("Sin problema, la reservación fue cancelada. ¿Hay algo más en que te pueda ayudar?");
        }
        return;
      }
    }

    // Consulta de disponibilidad
    const consulta = detectarConsultaDisponibilidad(texto);
    if (consulta) {
      if (consulta.soloConsulta || !consulta.hora) {
        agregarBot("Claro, tenemos disponibilidad en los siguientes horarios:\n" + horasDisponibles.filter(horaDisponible).join(", ") + "\n\n¿Quieres hacer una reservación?");
        return;
      }
      if (!horaDisponible(consulta.hora)) {
        const alt = horaAlternativa(consulta.hora);
        agregarBot(alt
          ? `Las ${consulta.hora} ya están ocupadas 😔 pero tengo disponibilidad a las ${alt}. ¿Te agendo para esa hora?`
          : "Lo siento, no tenemos disponibilidad para esa hora. ¿Quieres ver otros horarios?"
        );
      } else {
        agregarBot(`¡Sí tenemos mesa disponible a las ${consulta.hora}! 🎉\n\n¿Quieres hacer la reservación ahora?`);
      }
      return;
    }

    // Iniciar flujo de reserva
    if (["reserva", "reservación", "reservar", "apartar", "mesa"].some((k) => lower.includes(k))) {
      const nuevaReserva = { nombre: "", whatsapp: "", fecha: "", hora: "", personas: "", _diaTemp: null };
      const fechaDetectada = extraerFecha(texto);

      if (fechaDetectada?.startsWith("__dia__")) {
        nuevaReserva._diaTemp = parseInt(fechaDetectada.replace("__dia__", ""));
      } else if (fechaDetectada) {
        if (!fechaValida(fechaDetectada)) {
          agregarBot("Esa fecha ya pasó 😅 Igual te ayudo con la reservación, ¿cuál es tu nombre completo?");
          setFlujo(FLUJO.PEDIR_NOMBRE);
          setReserva(nuevaReserva);
          return;
        }
        nuevaReserva.fecha = fechaDetectada;
      }

      setReserva(nuevaReserva);
      setFlujo(FLUJO.PEDIR_NOMBRE);
      agregarBot("¡Con gusto te ayudo con tu reservación! 🗓️\n\n¿Cuál es tu nombre completo?");
      return;
    }

    // Respuestas generales
    const respuesta = obtenerRespuestaGeneral(texto);
    if (respuesta) {
      agregarBot(respuesta);
      return;
    }

    agregarBot("Entiendo tu consulta. Para más información puedes contactarnos por WhatsApp al 809-555-1247 o visitarnos en Calle El Conde 253, Zona Colonial.");
  };

  const enviar = () => {
    const texto = input.trim();
    if (!texto) return;
    setMensajes((prev) => [...prev, { de: "user", texto }]);
    setInput("");
    procesarMensaje(texto);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  return (
    <>
      <button
        onClick={() => setAbierto((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-600 shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105"
        aria-label="Abrir chat"
      >
        {abierto ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" />
          </svg>
        )}
      </button>

      {abierto && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-stone-100 flex flex-col overflow-hidden" style={{ height: "480px" }}>
          <div className="bg-stone-900 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white font-bold text-sm shrink-0">A</div>
            <div>
              <p className="text-white text-sm font-semibold">La Casa de Alberto</p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <p className="text-stone-400 text-xs">En línea</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-stone-50">
            {mensajes.map((m, i) => (
              <div key={i} className={`flex ${m.de === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  m.de === "user"
                    ? "bg-amber-500 text-white rounded-br-sm"
                    : "bg-white text-stone-700 rounded-bl-sm shadow-sm border border-stone-100"
                }`}>
                  {m.texto}
                </div>
              </div>
            ))}
            {escribiendo && (
              <div className="flex justify-start">
                <div className="bg-white border border-stone-100 shadow-sm px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                  <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="px-3 py-3 bg-white border-t border-stone-100 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Escribe tu mensaje..."
              className="flex-1 text-sm bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:border-amber-400 transition"
            />
            <button
              onClick={enviar}
              disabled={!input.trim()}
              className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 flex items-center justify-center transition shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
