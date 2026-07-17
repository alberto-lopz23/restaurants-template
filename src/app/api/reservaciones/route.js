import { adminDb } from "@/lib/firebase-admin";
import { enviarEmailServer } from "@/lib/mailer";

const RESTAURANT_ID = "restaurante-1";

const HORAS_VALIDAS = [
  "12:00pm", "12:30pm", "1:00pm", "1:30pm", "2:00pm", "2:30pm",
  "3:00pm", "3:30pm", "7:00pm", "7:30pm", "8:00pm", "8:30pm",
  "9:00pm", "9:30pm",
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarInput(body) {
  const { nombre, whatsapp, email, fecha, hora, personas } = body || {};

  if (typeof nombre !== "string" || nombre.trim().length < 2 || nombre.length > 100) {
    return "Nombre inválido.";
  }
  if (typeof whatsapp !== "string" || whatsapp.trim().length < 7 || whatsapp.length > 20) {
    return "WhatsApp inválido.";
  }
  if (email !== undefined && email !== "" && !EMAIL_REGEX.test(email)) {
    return "Email inválido.";
  }
  if (typeof fecha !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return "Fecha inválida.";
  }
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (new Date(fecha + "T00:00:00") < hoy) {
    return "La fecha ya pasó.";
  }
  if (!HORAS_VALIDAS.includes(hora)) {
    return "Hora inválida.";
  }
  const numPersonas = Number(personas);
  if (!Number.isInteger(numPersonas) || numPersonas < 1 || numPersonas > 8) {
    return "Número de personas inválido.";
  }
  return null;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const errorValidacion = validarInput(body);
    if (errorValidacion) {
      return Response.json({ error: errorValidacion }, { status: 400 });
    }

    const nombre = body.nombre.trim();
    const whatsapp = body.whatsapp.trim();
    const email = (body.email || "").trim();
    const fecha = body.fecha;
    const hora = body.hora;
    const personas = Number(body.personas);

    const restRef = adminDb.collection("restaurants").doc(RESTAURANT_ID);

    const [mesasSnap, reservacionesSnap, configSnap] = await Promise.all([
      restRef.collection("mesas").get(),
      restRef
        .collection("reservaciones")
        .where("fecha", "==", fecha)
        .where("hora", "==", hora)
        .where("estado", "==", "activa")
        .get(),
      restRef.get(),
    ]);

    const mesas = mesasSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const mesasOcupadas = reservacionesSnap.docs.map((d) => d.data().mesaAsignada);
    const mesaDisponible = mesas.find(
      (m) => !mesasOcupadas.includes(m.numero) && m.capacidad >= personas
    );

    if (!mesaDisponible) {
      return Response.json(
        { error: "No hay mesas disponibles para esa fecha y hora. Por favor elige otro horario." },
        { status: 409 }
      );
    }

    const config = configSnap.exists ? configSnap.data() : null;

    const nuevaReservacionRef = await restRef.collection("reservaciones").add({
      clienteNombre: nombre,
      clienteWhatsapp: whatsapp,
      clienteEmail: email || null,
      fecha,
      hora,
      personas,
      mesaAsignada: mesaDisponible.numero,
      estado: "activa",
      recordatorioEnviado: false,
      timestamp: new Date(),
    });

    if (email) {
      try {
        await enviarEmailServer("confirmacion", {
          clienteNombre: nombre,
          clienteEmail: email,
          restaurante: config?.nombre || "El Restaurante",
          fecha,
          hora,
          personas,
          mesaAsignada: mesaDisponible.numero,
          tiempoGracia: config?.tiempoGracia || 15,
        });
      } catch (emailErr) {
        console.error("Error enviando email de confirmación:", emailErr);
      }
    }

    return Response.json({
      id: nuevaReservacionRef.id,
      mesaAsignada: mesaDisponible.numero,
    });
  } catch (err) {
    console.error("Error creando reservación:", err);
    return Response.json({ error: "Ocurrió un error. Por favor intenta de nuevo." }, { status: 500 });
  }
}