import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

const RESTAURANT_ID = "restaurante-1";

export async function GET(request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const ahora = new Date();
    const fechaHoy = ahora.toISOString().split("T")[0];

    const ref = collection(db, "restaurants", RESTAURANT_ID, "reservaciones");
    const q = query(
      ref,
      where("fecha", "==", fechaHoy),
      where("estado", "==", "activa")
    );

    const snap = await getDocs(q);
    if (snap.empty) return Response.json({ mensaje: "Nada que cancelar" });

    const { updateReservacion, getConfig } = await import("@/lib/db");
    const { enviarEmail } = await import("@/lib/email");
    const config = await getConfig();

    let canceladas = 0;

    for (const docSnap of snap.docs) {
      const r = { id: docSnap.id, ...docSnap.data() };

      // Convertir hora de reserva a Date
      const [horaParte, meridiem] = r.hora.match(/(\d+:\d+)(am|pm)/i).slice(1);
      let [hh, mm] = horaParte.split(":").map(Number);
      if (meridiem.toLowerCase() === "pm" && hh !== 12) hh += 12;
      if (meridiem.toLowerCase() === "am" && hh === 12) hh = 0;

      const horaReserva = new Date(ahora);
      horaReserva.setHours(hh, mm, 0, 0);

      const tiempoGracia = (config?.tiempoGracia || 15) * 60 * 1000;
      const limite = new Date(horaReserva.getTime() + tiempoGracia);

      if (ahora > limite) {
        await updateReservacion(r.id, { estado: "cancelada" });

        if (r.clienteEmail) {
          await enviarEmail("cancelacion", {
            clienteNombre: r.clienteNombre,
            clienteEmail: r.clienteEmail,
            restaurante: config?.nombre || "El Restaurante",
          });
        }

        canceladas++;
      }
    }

    return Response.json({ mensaje: `${canceladas} reservaciones canceladas` });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}