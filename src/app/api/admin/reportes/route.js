import { adminDb, verificarAdmin } from "@/lib/firebase-admin";

const RESTAURANT_ID = "restaurante-1";

function toISODate(d) {
  return d.toISOString().split("T")[0];
}

export async function GET(request) {
  try {
    await verificarAdmin(request);
  } catch (err) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const desdeStr = searchParams.get("desde");
    const hastaStr = searchParams.get("hasta");

    if (!desdeStr || !hastaStr || !/^\d{4}-\d{2}-\d{2}$/.test(desdeStr) || !/^\d{4}-\d{2}-\d{2}$/.test(hastaStr)) {
      return Response.json({ error: "Rango de fechas inválido." }, { status: 400 });
    }

    const desde = new Date(desdeStr + "T00:00:00");
    const hasta = new Date(hastaStr + "T23:59:59.999");

    if (desde > hasta || hasta - desde > 1000 * 60 * 60 * 24 * 92) {
      return Response.json({ error: "Rango de fechas inválido o demasiado amplio (máximo 92 días)." }, { status: 400 });
    }

    const pedidosSnap = await adminDb
      .collectionGroup("pedidos")
      .where("timestamp", ">=", desde)
      .where("timestamp", "<=", hasta)
      .get();

    const ventasPorDiaMap = {};
    const platosMap = {};
    let totalVentas = 0;
    let totalPedidos = 0;

    pedidosSnap.forEach((doc) => {
      if (!doc.ref.path.startsWith(`restaurants/${RESTAURANT_ID}/`)) return;

      const pedido = doc.data();
      const fecha = toISODate(pedido.timestamp.toDate());
      const totalPedido = (pedido.platos || []).reduce(
        (acc, p) => acc + (Number(p.precio) || 0) * (Number(p.cantidad) || 0),
        0
      );

      totalVentas += totalPedido;
      totalPedidos += 1;

      ventasPorDiaMap[fecha] = (ventasPorDiaMap[fecha] || 0) + totalPedido;

      (pedido.platos || []).forEach((p) => {
        const nombre = p.nombre || "Sin nombre";
        platosMap[nombre] = (platosMap[nombre] || 0) + (Number(p.cantidad) || 0);
      });
    });

    const ventasPorDia = Object.entries(ventasPorDiaMap)
      .map(([fecha, total]) => ({ fecha, total: Math.round(total) }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    const topPlatos = Object.entries(platosMap)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 8);

    const restRef = adminDb.collection("restaurants").doc(RESTAURANT_ID);
    const reservacionesSnap = await restRef
      .collection("reservaciones")
      .where("fecha", ">=", desdeStr)
      .where("fecha", "<=", hastaStr)
      .get();

    let reservasActivas = 0;
    let reservasCanceladas = 0;
    reservacionesSnap.forEach((doc) => {
      const r = doc.data();
      if (r.estado === "activa") reservasActivas++;
      if (r.estado === "cancelada") reservasCanceladas++;
    });

    return Response.json({
      rango: { desde: desdeStr, hasta: hastaStr },
      totalVentas: Math.round(totalVentas),
      totalPedidos,
      ticketPromedio: totalPedidos > 0 ? Math.round(totalVentas / totalPedidos) : 0,
      reservasActivas,
      reservasCanceladas,
      reservasTotal: reservacionesSnap.size,
      ventasPorDia,
      topPlatos,
    });
  } catch (err) {
    console.error("Error en /api/admin/reportes:", err);
    return Response.json({ error: err.message || "Ocurrió un error generando el reporte." }, { status: 500 });
  }
}