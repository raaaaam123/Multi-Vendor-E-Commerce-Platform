import nodemailer from "nodemailer";
import { lookup } from "node:dns/promises";

const isSmtpConfigured =
  process.env.SMTP_USER &&
  !process.env.SMTP_USER.includes("your_email");

const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 587;
const EMAIL_FROM = process.env.EMAIL_FROM || "ShopVerse <no-reply@shopverse.com>";

const CONNECT_ERROR_CODES = new Set([
  "ENETUNREACH",
  "EHOSTUNREACH",
  "ETIMEDOUT",
  "ECONNREFUSED",
  "ECONNRESET",
  "EAI_AGAIN",
  "ESOCKETTIMEDOUT",
]);

const isConnectLevelError = (err) => {
  if (!err) return false;
  if (CONNECT_ERROR_CODES.has(err?.code)) return true;
  return /timeout|timed out|greeting|unreachable|connection (reset|refused)|cannot.*reach/i.test(
    err?.message || ""
  );
};

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

let SMTP_IPV4 = null;

if (isSmtpConfigured) {
  if (
    !process.env.SMTP_PASSWORD ||
    process.env.SMTP_PASSWORD.includes("your_") ||
    process.env.SMTP_PASSWORD.includes("password")
  ) {
    console.warn(
      "[EMAIL] SMTP_USER is set but SMTP_PASSWORD is missing or looks like a placeholder. Email sending will fail until a valid password/app-password is configured."
    );
  }

  SMTP_IPV4 = await toIpv4(SMTP_HOST);
  console.log(
    `[EMAIL] SMTP host ${SMTP_HOST}:${SMTP_PORT}${SMTP_IPV4 ? ` -> ${SMTP_IPV4} (IPv4 preferred)` : " (hostname)"}`
  );
}

const buildTransporter = (port) =>
  nodemailer.createTransport({
    host: SMTP_IPV4 || SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: true,
    connectionTimeout: 6000,
    greetingTimeout: 8000,
    socketTimeout: 15000,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    ...(SMTP_IPV4 ? { tls: { servername: SMTP_HOST } } : {}),
  });

const logSendFailure = (stage, port, error) => {
  console.error(`[EMAIL] ${stage} SMTP attempt failed (port ${port}):`, {
    code: error?.code,
    command: error?.command,
    responseCode: error?.responseCode,
    response: error?.response,
    message: error?.message,
  });
};

const sendEmail = async ({ to, subject, html, text = "" }) => {
  if (!isSmtpConfigured) {
    console.warn("[EMAIL] SMTP not configured — logging email instead of sending.");
    console.log("──────────────────────────────────────────");
    console.log(`[EMAIL DEV] To:      ${to}`);
    console.log(`[EMAIL DEV] Subject: ${subject}`);
    console.log(`[EMAIL DEV] Body:\n${text || html}`);
    console.log("──────────────────────────────────────────");
    return { messageId: "dev-mode-no-email-sent" };
  }

  const primaryPort = SMTP_PORT;
  const fallbackPort = primaryPort === 465 ? null : 465;

  const attempt = (port) =>
    buildTransporter(port).sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text: text || "Please view this email in an HTML-capable client.",
    });

  try {
    const info = await attempt(primaryPort);
    console.log(
      `[EMAIL] Sent "${subject}" to ${to} (messageId: ${info.messageId})`
    );
    return info;
  } catch (primaryError) {
    logSendFailure("Primary", primaryPort, primaryError);

    if (fallbackPort && isConnectLevelError(primaryError)) {
      try {
        const info = await attempt(fallbackPort);
        console.log(
          `[EMAIL] Sent "${subject}" to ${to} via fallback SMTP port ${fallbackPort} (messageId: ${info.messageId})`
        );
        return info;
      } catch (fallbackError) {
        logSendFailure("Fallback", fallbackPort, fallbackError);
        throw fallbackError;
      }
    }

    throw primaryError;
  }
};

export { sendEmail };