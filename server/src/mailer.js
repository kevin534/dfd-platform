// ============================================================
//  DFD — Notification par e-mail (formulaire de contact)
//  Sans SMTP_HOST configuré -> mode démo (aucun envoi, no-op),
//  même logique que les intégrations de paiement (voir payments/*.js).
// ============================================================
import nodemailer from "nodemailer";

function getTransport() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
}

export async function notifyContactMessage({ name, email, subject, body }) {
  const transport = getTransport();
  if (!transport) return { sent: false, mode: "demo" };

  await transport.sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to: process.env.CONTACT_NOTIFY_EMAIL || process.env.MAIL_FROM,
    replyTo: email,
    subject: `[DFD Contact] ${subject || "Nouveau message"}`,
    text: `De : ${name} <${email}>\n\n${body}`,
  });
  return { sent: true, mode: "live" };
}
