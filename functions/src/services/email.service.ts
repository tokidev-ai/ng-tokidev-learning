import * as nodemailer from 'nodemailer';

/**
 * Configuración del transporte de Nodemailer.
 * Si no se definen variables personalizadas de SMTP, se conecta por defecto a Gmail.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 465;
  const secure = process.env.SMTP_SECURE !== 'false'; // true para 465, false para 587
  const user = process.env.SMTP_USER || process.env.GMAIL_USER || '';
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || '';

  if (!user || !pass) {
    console.warn('[EmailService] ⚠️ Credenciales SMTP no configuradas. Los correos se registrarán en consola pero no se enviarán a servidores externos.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });
}

const FROM_EMAIL = process.env.FROM_EMAIL || process.env.SMTP_USER || 'soporte@tokidev.la';
const FROM_NAME = process.env.FROM_NAME || 'TokiDev Learning';

/**
 * Plantilla base HTML con diseño TokiDev (Dark Modern)
 */
function wrapEmailTemplate(title: string, contentHtml: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0f19;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
    }
    .container {
      max-width: 600px;
      margin: 30px auto;
      background: linear-gradient(180deg, #111827 0%, #0f172a 100%);
      border: 1px solid #1e293b;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .header {
      padding: 32px 32px 24px;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
      border-bottom: 1px solid #1e293b;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #ffffff;
      text-decoration: none;
    }
    .logo span {
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .content {
      padding: 32px;
      line-height: 1.6;
      color: #94a3b8;
      font-size: 15px;
    }
    .content h2 {
      color: #f8fafc;
      font-size: 20px;
      margin-top: 0;
      margin-bottom: 16px;
      font-weight: 700;
    }
    .card-box {
      background-color: rgba(15, 23, 42, 0.8);
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
      color: #ffffff !important;
      font-weight: 600;
      font-size: 15px;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 10px;
      margin-top: 20px;
      text-align: center;
    }
    .footer {
      padding: 24px 32px;
      background-color: #090d16;
      border-top: 1px solid #1e293b;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Toki<span>Dev</span> Learning</div>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} TokiDev Learning Platform. Todos los derechos reservados.</p>
      <p>Este es un correo automático generado por el sistema de TokiDev.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 1. Enviar correo cuando un estudiante envía su postulación como instructor
 */
export async function sendApplicationReceivedEmail(toEmail: string, studentName: string, professionalTitle: string): Promise<boolean> {
  const transporter = createTransporter();
  const title = 'Hemos recibido tu postulación como Instructor';
  const html = wrapEmailTemplate(
    title,
    `
    <h2>¡Hola, ${studentName}! 🚀</h2>
    <p>Hemos recibido correctamente tu solicitud para convertirte en instructor en <strong>TokiDev Learning</strong>.</p>
    
    <div class="card-box">
      <p style="margin: 0 0 8px 0; color: #f8fafc; font-weight: 600;">Detalles de la postulación:</p>
      <p style="margin: 0; color: #cbd5e1;"><strong>Título:</strong> ${professionalTitle}</p>
      <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 13px;">Estado actual: <span style="color: #f59e0b; font-weight: 600;">En Revisión</span></p>
    </div>

    <p>Nuestro equipo académico revisará tu propuesta en un plazo de 24 a 48 horas hábiles. Te enviaremos una notificación por este medio en cuanto tu cuenta sea activada.</p>
    <p>¡Gracias por querer compartir tu conocimiento con la comunidad!</p>
    `
  );

  if (!transporter) {
    console.log(`[Email Mock] 📤 'Postulación Recibida' para ${toEmail}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: toEmail,
      subject: `🎓 TokiDev: Recibimos tu postulación como instructor`,
      html
    });
    console.log(`[Email] ✅ Correo de postulación enviado a ${toEmail}`);
    return true;
  } catch (err) {
    console.error(`[Email Error] Error enviando correo a ${toEmail}:`, err);
    return false;
  }
}

/**
 * 2. Enviar correo cuando la postulación es APROBADA o RECHAZADA por el Admin
 */
export async function sendApplicationStatusEmail(
  toEmail: string, 
  studentName: string, 
  status: 'APPROVED' | 'REJECTED', 
  reason?: string
): Promise<boolean> {
  const transporter = createTransporter();
  const isApproved = status === 'APPROVED';
  const subject = isApproved 
    ? '🎉 ¡Felicidades! Tu cuenta de Instructor ha sido aprobada'
    : 'Actualización sobre tu postulación en TokiDev';

  const html = wrapEmailTemplate(
    subject,
    isApproved
      ? `
      <h2>¡Bienvenido al equipo de Instructores, ${studentName}! 🎉</h2>
      <p>Tu postulación para enseñar en <strong>TokiDev Learning</strong> ha sido <strong>aprobada por el equipo administrador</strong>.</p>
      
      <div class="card-box" style="border-color: #10b981; background: rgba(16, 185, 129, 0.05);">
        <p style="margin: 0; color: #34d399; font-weight: 600;">✨ Ya tienes acceso al Panel de Instructor</p>
        <p style="margin: 8px 0 0 0; color: #cbd5e1; font-size: 14px;">Ya puedes crear cursos, estructurar temarios con módulos gratuitos y de pago, y empezar a generar regalías.</p>
      </div>

      <div style="text-align: center;">
        <a href="https://tokidevlearning.web.app/instructor" class="btn">Ir al Panel de Instructor</a>
      </div>
      `
      : `
      <h2>Hola, ${studentName}</h2>
      <p>Hemos revisado tu postulación para enseñar en TokiDev Learning. En esta ocasión, no hemos podido aprobar tu solicitud.</p>
      
      ${reason ? `
      <div class="card-box" style="border-color: #ef4444; background: rgba(239, 68, 68, 0.05);">
        <p style="margin: 0 0 6px 0; color: #f87171; font-weight: 600;">Observaciones:</p>
        <p style="margin: 0; color: #cbd5e1; font-size: 14px;">${reason}</p>
      </div>
      ` : ''}

      <p>Puedes seguir aprendiendo con nuestros cursos y volver a postular en el futuro con una propuesta actualizada.</p>
      `
  );

  if (!transporter) {
    console.log(`[Email Mock] 📤 Estado '${status}' enviado a ${toEmail}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: toEmail,
      subject,
      html
    });
    console.log(`[Email] ✅ Notificación de estado enviada a ${toEmail}`);
    return true;
  } catch (err) {
    console.error(`[Email Error] Error enviando correo de estado a ${toEmail}:`, err);
    return false;
  }
}

/**
 * 3. Enviar correo de confirmación de compra y matrícula al estudiante
 */
export async function sendPurchaseConfirmationEmail(
  toEmail: string,
  studentName: string,
  courseTitle: string,
  amount: number,
  orderId: string
): Promise<boolean> {
  const transporter = createTransporter();
  const subject = `🎓 ¡Confirmación de compra: "${courseTitle}"!`;

  const html = wrapEmailTemplate(
    subject,
    `
    <h2>¡Gracias por tu compra, ${studentName}! 🚀</h2>
    <p>Tu pago se ha procesado con éxito y ya tienes acceso de por vida a tu curso.</p>
    
    <div class="card-box">
      <table style="width: 100%; border-collapse: collapse; color: #cbd5e1; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #94a3b8;">Curso:</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #f8fafc;">${courseTitle}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #94a3b8;">Monto pagado:</td>
          <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #34d399;">$${amount.toFixed(2)} USD</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #94a3b8;">N° de Orden:</td>
          <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #94a3b8;">${orderId}</td>
        </tr>
      </table>
    </div>

    <div style="text-align: center;">
      <a href="https://tokidevlearning.web.app/student/my-courses" class="btn">Empezar a Aprender</a>
    </div>
    `
  );

  if (!transporter) {
    console.log(`[Email Mock] 📤 Recibo de compra para ${toEmail} ($${amount} USD)`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: toEmail,
      subject,
      html
    });
    console.log(`[Email] ✅ Confirmación de compra enviada a ${toEmail}`);
    return true;
  } catch (err) {
    console.error(`[Email Error] Error enviando correo de compra a ${toEmail}:`, err);
    return false;
  }
}
