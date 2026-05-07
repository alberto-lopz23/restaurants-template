import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { tipo, reservacion } = await request.json();

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

    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: reservacion.clienteEmail,
      subject,
      html,
    });

    if (error) return Response.json({ error }, { status: 400 });
    return Response.json({ data });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}