import { adminDb, adminAuth } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

const RESTAURANT_ID = "restaurante-1";
const ACCIONES_VALIDAS = ["pedido", "llamarCamarero", "pedirCuenta"];

async function validarMesaYSesion(mesaNumero, token) {
  const restRef = adminDb.collection("restaurants").doc(RESTAURANT_ID);
  const mesasSnap = await restRef
    .collection("mesas")
    .where("numero", "==", mesaNumero)
    .limit(1)
    .get();

  if (mesasSnap.empty) return { error: "Mesa no encontrada.", status: 404 };
  const mesaDoc = mesasSnap.docs[0];
  const mesa = mesaDoc.data();

  if (!mesa.token || mesa.token !== token) {
    return { error: "Token inválido. Escanea el QR de tu mesa nuevamente.", status: 403 };
  }

  const sesionesSnap = await restRef
    .collection("mesas").doc(mesaDoc.id)
    .collection("sesiones")
    .where("estado", "==", "activa")
    .limit(1)
    .get();

  if (sesionesSnap.empty) {
    return { error: "Esta mesa no tiene una sesión activa. Pide al personal que abra la mesa.", status: 409 };
  }

  return { restRef, mesaId: mesaDoc.id, sesionId: sesionesSnap.docs[0].id };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { mesa: mesaNumero, token, accion, platos } = body || {};

    if (!ACCIONES_VALIDAS.includes(accion)) {
      return Response.json({ error: "Acción inválida." }, { status: 400 });
    }
    if (!Number.isInteger(Number(mesaNumero)) || typeof token !== "string" || !token) {
      return Response.json({ error: "Datos de mesa inválidos." }, { status: 400 });
    }

    const validacion = await validarMesaYSesion(Number(mesaNumero), token);
    if (validacion.error) {
      return Response.json({ error: validacion.error }, { status: validacion.status });
    }
    const { restRef, mesaId, sesionId } = validacion;

    const pedidosRef = restRef
      .collection("mesas").doc(mesaId)
      .collection("sesiones").doc(sesionId)
      .collection("pedidos");

    const pendienteSnap = await pedidosRef.where("estado", "==", "pendiente").limit(1).get();
    const pedidoPendiente = pendienteSnap.empty ? null : { id: pendienteSnap.docs[0].id, ...pendienteSnap.docs[0].data() };

    if (accion === "pedido") {
      if (!Array.isArray(platos) || platos.length === 0) {
        return Response.json({ error: "El carrito está vacío." }, { status: 400 });
      }
      const platosNuevos = platos.map((p) => ({
        id: String(p.id || "").slice(0, 100),
        nombre: String(p.nombre).slice(0, 100),
        cantidad: Math.max(1, Math.min(50, Number(p.cantidad) || 1)),
        precio: Math.max(0, Number(p.precio) || 0),
      }));

      if (pedidoPendiente) {
        await pedidosRef.doc(pedidoPendiente.id).update({
          platos: FieldValue.arrayUnion(...platosNuevos),
          timestamp: new Date(),
        });
      } else {
        await pedidosRef.add({
          mesa: Number(mesaNumero),
          platos: platosNuevos,
          estado: "pendiente",
          llamarCamarero: false,
          pedirCuenta: false,
          timestamp: new Date(),
        });
      }

      const menuRef = restRef.collection("menu");
      await Promise.allSettled(
        platosNuevos
          .filter((p) => p.id)
          .map((p) => menuRef.doc(p.id).update({ pedidos: FieldValue.increment(p.cantidad) }))
      );

      return Response.json({ ok: true });
    }

    if (accion === "llamarCamarero" || accion === "pedirCuenta") {
      const campo = accion;
      if (pedidoPendiente) {
        await pedidosRef.doc(pedidoPendiente.id).update({ [campo]: true });
      } else {
        await pedidosRef.add({
          mesa: Number(mesaNumero),
          platos: [],
          estado: "pendiente",
          llamarCamarero: campo === "llamarCamarero",
          pedirCuenta: campo === "pedirCuenta",
          timestamp: new Date(),
        });
      }
      return Response.json({ ok: true });
    }
  } catch (err) {
    console.error("Error en /api/pedidos:", err);
    return Response.json({ error: "Ocurrió un error. Intenta de nuevo." }, { status: 500 });
  }
}