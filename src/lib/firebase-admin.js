import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

function getAdminApp() {
  if (getApps().length > 0) return getApps()[0];

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

  let privateKey;
  if (process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64) {
    privateKey = Buffer.from(process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64, "base64").toString("utf8");
  } else {
    privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  }

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Faltan variables de entorno de Firebase Admin (FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY). Revisa tu .env.local."
    );
  }
// TEMPORAL - borrar después de diagnosticar
  console.log("DEBUG privateKey inicio:", JSON.stringify(privateKey.slice(0, 35)));
  console.log("DEBUG privateKey final:", JSON.stringify(privateKey.slice(-35)));
  console.log("DEBUG privateKey longitud:", privateKey.length);
  console.log("DEBUG privateKey tiene \\r:", privateKey.includes("\r"));
  console.log("DEBUG fuente usada:", process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64 ? "BASE64" : "TEXTO_PLANO");


  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export const adminDb = getFirestore(getAdminApp());
export const adminAuth = getAuth(getAdminApp());

export async function verificarAdmin(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) throw new Error("No autorizado: falta token.");
  return await adminAuth.verifyIdToken(token);
}