import nodemailer from "nodemailer";
import { lookup } from "node:dns/promises";

const isSmtpConfigured =
  process.env.SMTP_USER &&
  !process.env.SMTP_USER.includes("your_email");

const toIpv4 = async (host) => {
  if (!host) return null;
  try {
    const addrs = await lookup(host, { all: true, family: 4 });
    const ip = addrs.find((a) => a.family === 4);
    if (ip) {
      console.log(`[EMAIL] Resolved ${host} -> ${ip.address} (IPv4)`);
      return ip.address;
    }
  } catch (error) {
    console.warn(`[EMAIL] IPv4 lookup failed for ${host}: ${error?.message}`);
  }
  return null;
};

const buildTransporter = async () => {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 587;
  const ipv4 = await toIpv4(host);

  if (
    isSmtpConfigured &&
    (!process.env.SMTP_PASSWORD ||
      process.env.SMTP_PASSWORD.includes("your_") ||
      process.env.SMTP_PASSWORD.includes("password"))
  ) {
    console.warn(
      "[EMAIL] SMTP_USER is set but SMTP_PASSWORD is missing or looks like a placeholder. Email sending will fail until a valid password/app-password is configured."
    );
  }

  console.log(
    `[EMAIL] Connecting to ${host}:${port}${ipv4 ? ` (via ${ipv4})` : ""} secure=${port === 465} requireTLS=true`
  );

  return nodemailer.createTransport({
    host: ipv4 || host,
    port,
    secure: port === 465,
    requireTLS: true,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    ...(ipv4 ? { tls: { servername: host } } : {}),
  });
};

const transporter = isSmtpConfigured ? await buildTransporter() : null;

const EMAIL_FROM = process.env.EMAIL_FROM || "ShopVerse <no-reply@shopverse.com>";

const sendEmail = async ({ to, subject, html, text = "" }) => {
  if (!isSmtpConfigured || !transporter) {
    console.warn("[EMAIL] SMTP not configured — logging email instead of sending.");
    console.log("──────────────────────────────────────────");
    console.log(`[EMAIL DEV] To:      ${to}`);
    console.log(`[EMAIL DEV] Subject: ${subject}`);
    console.log(`[EMAIL DEV] Body:\n${text || html}`);
    console.log("──────────────────────────────────────────");
    return { messageId: "dev-mode-no-email-sent" };
  }

  try {
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text: text || "Please view this email in an HTML-capable client.",
    });
    console.log(
      `[EMAIL] Sent "${subject}" to ${to} (messageId: ${info.messageId})`
    );
    return info;
  } catch (error) {
    console.error("[EMAIL] Failed to send email:", {
      code: error?.code,
      command: error?.command,
      responseCode: error?.responseCode,
      response: error?.response,
      message: error?.message,
    });
    throw error;
  }
};

export { sendEmail };