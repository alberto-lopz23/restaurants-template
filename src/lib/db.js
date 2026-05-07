import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

const RESTAURANT_ID = "restaurante-1";

// ─── CONFIGURACIÓN ───────────────────────────────────────
export const getConfig = async () => {
  const ref = doc(db, "restaurants", RESTAURANT_ID);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
};

export const saveConfig = async (data) => {
  const ref = doc(db, "restaurants", RESTAURANT_ID);
  await setDoc(ref, data, { merge: true });
};

// ─── MENÚ ────────────────────────────────────────────────
export const getPlatos = async () => {
  const ref = collection(db, "restaurants", RESTAURANT_ID, "menu");
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addPlato = async (data) => {
  const ref = collection(db, "restaurants", RESTAURANT_ID, "menu");
  return await addDoc(ref, data);
};

export const updatePlato = async (id, data) => {
  const ref = doc(db, "restaurants", RESTAURANT_ID, "menu", id);
  await updateDoc(ref, data);
};

export const deletePlato = async (id) => {
  const ref = doc(db, "restaurants", RESTAURANT_ID, "menu", id);
  await deleteDoc(ref);
};

// ─── SESIONES DE MESA ─────────────────────────────────────

export const abrirSesion = async (mesaId) => {
  const ref = collection(
    db,
    "restaurants",
    RESTAURANT_ID,
    "mesas",
    mesaId,
    "sesiones",
  );
  const sesion = await addDoc(ref, {
    inicio: new Date(),
    fin: null,
    estado: "activa",
  });
  await updateMesa(mesaId, { estado: "ocupada", sesionActiva: sesion.id });
  return sesion.id;
};

export const cerrarSesion = async (mesaId, sesionId) => {
  const ref = doc(
    db,
    "restaurants",
    RESTAURANT_ID,
    "mesas",
    mesaId,
    "sesiones",
    sesionId,
  );
  await updateDoc(ref, { fin: new Date(), estado: "cerrada" });
  await updateMesa(mesaId, { estado: "libre", sesionActiva: null });
};

export const getSesionActiva = async (mesaId) => {
  const ref = collection(
    db,
    "restaurants",
    RESTAURANT_ID,
    "mesas",
    mesaId,
    "sesiones",
  );
  const q = query(ref, where("estado", "==", "activa"));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
};

// ─── MESAS ───────────────────────────────────────────────
export const getMesas = async () => {
  const ref = collection(db, "restaurants", RESTAURANT_ID, "mesas");
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addMesa = async (data) => {
  const ref = collection(db, "restaurants", RESTAURANT_ID, "mesas");
  return await addDoc(ref, data);
};

export const updateMesa = async (id, data) => {
  const ref = doc(db, "restaurants", RESTAURANT_ID, "mesas", id);
  await updateDoc(ref, data);
};

export const deleteMesa = async (id) => {
  const ref = doc(db, "restaurants", RESTAURANT_ID, "mesas", id);
  await deleteDoc(ref);
};

// ─── PEDIDOS POR SESIÓN ───────────────────────────────────

export const addPedidoSesion = async (mesaId, sesionId, data) => {
  const ref = collection(
    db,
    "restaurants",
    RESTAURANT_ID,
    "mesas",
    mesaId,
    "sesiones",
    sesionId,
    "pedidos",
  );
  return await addDoc(ref, data);
};

export const getPedidosSesion = async (mesaId, sesionId) => {
  const ref = collection(
    db,
    "restaurants",
    RESTAURANT_ID,
    "mesas",
    mesaId,
    "sesiones",
    sesionId,
    "pedidos",
  );
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const onPedidosSesionChange = (mesaId, sesionId, callback) => {
  const ref = collection(
    db,
    "restaurants",
    RESTAURANT_ID,
    "mesas",
    mesaId,
    "sesiones",
    sesionId,
    "pedidos",
  );
  return onSnapshot(ref, (snap) => {
    const pedidos = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(pedidos);
  });
};

export const updatePedidoSesion = async (mesaId, sesionId, pedidoId, data) => {
  const ref = doc(
    db,
    "restaurants",
    RESTAURANT_ID,
    "mesas",
    mesaId,
    "sesiones",
    sesionId,
    "pedidos",
    pedidoId,
  );
  await updateDoc(ref, data);
};

// ─── RESERVACIONES ────────────────────────────────────────
export const getReservaciones = async () => {
  const ref = collection(db, "restaurants", RESTAURANT_ID, "reservaciones");
  const snap = await getDocs(ref);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const addReservacion = async (data) => {
  const ref = collection(db, "restaurants", RESTAURANT_ID, "reservaciones");
  return await addDoc(ref, data);
};

export const updateReservacion = async (id, data) => {
  const ref = doc(db, "restaurants", RESTAURANT_ID, "reservaciones", id);
  await updateDoc(ref, data);
};

export const getReservacionesPorFechaHora = async (fecha, hora) => {
  const ref = collection(db, "restaurants", RESTAURANT_ID, "reservaciones");
  const q = query(
    ref,
    where("fecha", "==", fecha),
    where("hora", "==", hora),
    where("estado", "==", "activa"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getTotalSesion = async (mesaId, sesionId) => {
  const pedidos = await getPedidosSesion(mesaId, sesionId);
  const todosLosPlatos = pedidos.flatMap((p) => p.platos || []);

  // Agrupar platos iguales
  const agrupados = todosLosPlatos.reduce((acc, plato) => {
    const existe = acc.find((p) => p.nombre === plato.nombre);
    if (existe) {
      existe.cantidad += plato.cantidad;
    } else {
      acc.push({ ...plato });
    }
    return acc;
  }, []);

  const total = agrupados.reduce((acc, p) => acc + p.precio * p.cantidad, 0);
  return { platos: agrupados, total };
};

export const incrementarPopularidad = async (platos) => {
  const { increment } = await import("firebase/firestore");
  for (const plato of platos) {
    const ref = doc(db, "restaurants", RESTAURANT_ID, "menu", plato.id);
    await updateDoc(ref, {
      pedidos: increment(plato.cantidad),
    });
  }
};