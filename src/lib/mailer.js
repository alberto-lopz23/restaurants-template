import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// IMPORTANTE: esta función solo se debe llamar desde código server-side
// (API routes). No expone ningún endpoint HTTP público — así nadie externo
// puede usar tu cuenta de Resend para mandar correos arbitrarios.
export async function enviarEmailServer(tipo, reservacion) {
  let subject = "";
  let html = "";

  if (tipo === "confirmacion") {
    subject = `Reservación confirmada — ${reservacion.restaurante}`;
    html = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1c1917;">¡Tu reservación está confirmada! 🎉</h2>
        <p style="color: #57534e;">Hola <strong>${reservacion.clienteNombre}</strong>, tu mesa está reservada.</p>
        <div style="background: #f5f5f4; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 8px 0; color: #1c1917;"><strong>Restaurante:</strong> ${reservacion.restaurante}</p>
          <p style="margin: 8px 0; color: #1c1917;"><strong>Fecha:</strong> ${reservacion.fecha}</p>
          <p style="margin: 8px 0; color: #1c1917;"><strong>Hora:</strong> ${reservacion.hora}</p>
          <p style="margin: 8px 0; color: #1c1917;"><strong>Personas:</strong> ${reservacion.personas}</p>
          <p style="margin: 8px 0; color: #1c1917;"><strong>Mesa asignada:</strong> #${reservacion.mesaAsignada}</p>
        </div>
        <p style="color: #57534e;">Te recordaremos 1 hora antes de tu reservación.</p>
        <p style="color: #a8a29e; font-size: 12px;">Si necesitas cancelar comunícate con nosotros directamente.</p>
      </div>
    `;
  }

  if (tipo === "recordatorio") {
    subject = `Recordatorio — Tu reservación es en 1 hora`;
    html = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1c1917;">¡Tu reservación es en 1 hora! ⏰</h2>
        <p style="color: #57534e;">Hola <strong>${reservacion.clienteNombre}</strong>, te recordamos que tienes una mesa reservada.</p>
        <div style="background: #f5f5f4; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 8px 0; color: #1c1917;"><strong>Restaurante:</strong> ${reservacion.restaurante}</p>
          <p style="margin: 8px 0; color: #1c1917;"><strong>Hora:</strong> ${reservacion.hora}</p>
          <p style="margin: 8px 0; color: #1c1917;"><strong>Mesa:</strong> #${reservacion.mesaAsignada}</p>
        </div>
        <p style="color: #e57e08; font-size: 14px;">
          ⚠️ Recuerda que si no llegas en ${reservacion.tiempoGracia} minutos tu reservación será cancelada automáticamente.
        </p>
      </div>
    `;
  }

  if (tipo === "cancelacion") {
    subject = `Reservación cancelada — ${reservacion.restaurante}`;
    html = `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1c1917;">Tu reservación fue cancelada</h2>
        <p style="color: #57534e;">Hola <strong>${reservacion.clienteNombre}</strong>, lamentablemente tu reservación fue cancelada por tiempo de espera.</p>
        <p style="color: #57534e;">Puedes hacer una nueva reservación cuando gustes.</p>
        <p style="color: #a8a29e; font-size: 12px;">${reservacion.restaurante}</p>
      </div>
    `;
  }

  if (!subject) return { error: `Tipo de email desconocido: ${tipo}` };

  const { data, error } = await resend.emails.send({
    from: "reservaciones@platomeal.com",
    to: reservacion.clienteEmail,
    subject,
    html,
  });

  if (error) console.error("Error enviando email:", error);
  return { data, error };
}