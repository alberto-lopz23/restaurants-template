import { verificarAdmin } from "@/lib/firebase-admin";
import { enviarEmailServer } from "@/lib/mailer";

const TIPOS_PERMITIDOS = ["confirmacion", "recordatorio", "cancelacion"];

export async function POST(request) {
  try {
    await verificarAdmin(request);
  } catch (err) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { tipo, reservacion } = await request.json();

    if (!TIPOS_PERMITIDOS.includes(tipo)) {
      return Response.json({ error: "Tipo de email inválido" }, { status: 400 });
    }
    if (!reservacion?.clienteEmail) {
      return Response.json({ error: "Falta clienteEmail" }, { status: 400 });
    }

    const { data, error } = await enviarEmailServer(tipo, reservacion);
    if (error) return Response.json({ error }, { status: 502 });

    return Response.json({ data });
  } catch (err) {
    console.error("Error en /api/admin/email:", err);
    return Response.json({ error: "Ocurrió un error." }, { status: 500 });
  }
}