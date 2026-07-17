import { adminDb } from "@/lib/firebase-admin";
import { enviarEmailServer } from "@/lib/mailer";

const RESTAURANT_ID = "restaurante-1";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const ahora = new Date();
    const en1hora = new Date(ahora.getTime() + 60 * 60 * 1000);

    const fechaHoy = en1hora.toISOString().split("T")[0];
    const horaFormateada = en1hora.toLocaleTimeString("es-DO", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).replace(" ", "").toLowerCase();

    const restRef = adminDb.collection("restaurants").doc(RESTAURANT_ID);

    const snap = await restRef
      .collection("reservaciones")
      .where("fecha", "==", fechaHoy)
      .where("hora", "==", horaFormateada)
      .where("estado", "==", "activa")
      .where("recordatorioEnviado", "==", false)
      .get();

    if (snap.empty) {
      return Response.json({ mensaje: "No hay recordatorios que enviar" });
    }

    const configSnap = await restRef.get();
    const config = configSnap.exists ? configSnap.data() : null;

    let enviados = 0;

    for (const docSnap of snap.docs) {
      const reservacion = { id: docSnap.id, ...docSnap.data() };

      if (!reservacion.clienteEmail) continue;

      await enviarEmailServer("recordatorio", {
        clienteNombre: reservacion.clienteNombre,
        clienteEmail: reservacion.clienteEmail,
        restaurante: config?.nombre || "El Restaurante",
        hora: reservacion.hora,
        mesaAsignada: reservacion.mesaAsignada,
        tiempoGracia: config?.tiempoGracia || 15,
      });

      await restRef.collection("reservaciones").doc(reservacion.id).update({
        recordatorioEnviado: true,
      });

      enviados++;
    }

    return Response.json({ mensaje: `${enviados} recordatorios enviados` });

  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}