import { Resend } from "resend";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { enviarEmail } from "@/lib/email";

const RESTAURANT_ID = "restaurante-1";

export async function GET(request) {
  // Verificar que sea Vercel quien llama
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

    // Buscar reservaciones activas para esa fecha y hora
    const ref = collection(db, "restaurants", RESTAURANT_ID, "reservaciones");
    const q = query(
      ref,
      where("fecha", "==", fechaHoy),
      where("hora", "==", horaFormateada),
      where("estado", "==", "activa"),
      where("recordatorioEnviado", "==", false)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      return Response.json({ mensaje: "No hay recordatorios que enviar" });
    }

    const { getConfig } = await import("@/lib/db");
    const config = await getConfig();

    let enviados = 0;

    for (const docSnap of snap.docs) {
      const reservacion = { id: docSnap.id, ...docSnap.data() };

      if (!reservacion.clienteEmail) continue;

      await enviarEmail("recordatorio", {
        clienteNombre: reservacion.clienteNombre,
        clienteEmail: reservacion.clienteEmail,
        restaurante: config?.nombre || "El Restaurante",
        hora: reservacion.hora,
        mesaAsignada: reservacion.mesaAsignada,
        tiempoGracia: config?.tiempoGracia || 15,
      });

      // Marcar como enviado para no repetir
      const { updateReservacion } = await import("@/lib/db");
      await updateReservacion(reservacion.id, { recordatorioEnviado: true });

      enviados++;
    }

    return Response.json({ mensaje: `${enviados} recordatorios enviados` });

  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}