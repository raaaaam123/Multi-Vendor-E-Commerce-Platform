import nodemailer from "nodemailer";

const EMAIL_PROVIDER = (process.env.EMAIL_PROVIDER || "brevo")
  .trim()
  .toLowerCase();
const EMAIL_FROM = process.env.EMAIL_FROM || "ShopVerse <no-reply@shopverse.com>";
const API_TIMEOUT_MS = 15000;

const isSmtpConfigured =
  process.env.SMTP_USER &&
  !process.env.SMTP_USER.includes("your_email") &&
  process.env.SMTP_PASSWORD &&
  !process.env.SMTP_PASSWORD.includes("your_");

const hasApiKey =
  process.env.EMAIL_API_KEY &&
  !process.env.EMAIL_API_KEY.includes("your_");

const parseSender = (from) => {
  const match = /^(.*?)\s*<([^<>]+)>$/.exec((from || "").trim());
  if (match && match[2]) {
    return { name: (match[1] || "ShopVerse").trim(), email: match[2].trim() };
  }
  return { name: "ShopVerse", email: (from || "").trim() };
};

if (hasApiKey && EMAIL_PROVIDER !== "brevo") {
  console.warn(
    `[EMAIL] EMAIL_PROVIDER="${EMAIL_PROVIDER}" is set, but only "brevo" is supported. Using Brevo.`
  );
}

const sendViaBrevo = async ({ to, subject, html, text }) => {
  const sender = parseSender(EMAIL_FROM);

  let response;
  try {
    response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": process.env.EMAIL_API_KEY,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender,
        to: [{ email: to }],
        subject,
        htmlContent: html,
        ...(text ? { textContent: text } : {}),
      }),
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    });
  } catch (networkError) {
    console.error(
      "[EMAIL] Email API request failed (Brevo):",
      networkError?.name === "TimeoutError"
        ? `request timed out after ${API_TIMEOUT_MS}ms`
        : networkError?.message || "network error"
    );
    throw new Error("Failed to reach email provider");
  }

  if (!response.ok) {
    let errorDetail = `HTTP ${response.status}`;
    try {
      const body = await response.text();
      const excerpt = body.slice(0, 500);
      errorDetail += excerpt ? `: ${excerpt}` : "";
    } catch (parseError) {
      errorDetail += ` (could not read response body: ${parseError?.message})`;
    }
    console.error("[EMAIL] Email API request failed (Brevo):", errorDetail);
    throw new Error("Failed to send email via email provider");
  }

  const data = await response.json().catch(() => ({}));
  const messageId = data?.messageId || data?.id || null;
  console.log(
    `[EMAIL] Sent "${subject}" to ${to} via Brevo${messageId ? ` (messageId: ${messageId})` : ""}`
  );
  return { messageId };
};

const buildTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    requireTLS: Number(process.env.SMTP_PORT) !== 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

const sendViaSmtp = async ({ to, subject, html, text }) => {
  try {
    const transporter = buildTransporter();
    const info = await transporter.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      text: text || "Please view this email in an HTML-capable client.",
    });
    console.log(
      `[EMAIL] Sent "${subject}" to ${to} via SMTP (messageId: ${info.messageId})`
    );
    return info;
  } catch (error) {
    console.error("[EMAIL] SMTP send failed:", {
      code: error?.code,
      command: error?.command,
      responseCode: error?.responseCode,
      response: error?.response,
      message: error?.message,
    });
    throw error;
  }
};

const logEmailToConsole = ({ to, subject, html, text }) => {
  console.warn("[EMAIL] No email provider configured — logging email instead of sending.");
  console.log("──────────────────────────────────────────");
  console.log(`[EMAIL DEV] To:      ${to}`);
  console.log(`[EMAIL DEV] Subject: ${subject}`);
  console.log(`[EMAIL DEV] Body:\n${text || html}`);
  console.log("──────────────────────────────────────────");
};

const sendEmail = async ({ to, subject, html, text = "" }) => {
  if (hasApiKey) {
    return sendViaBrevo({ to, subject, html, text });
  }

  if (isSmtpConfigured) {
    return sendViaSmtp({ to, subject, html, text });
  }

  logEmailToConsole({ to, subject, html, text });
  return { messageId: "dev-mode-no-email-sent" };
};

export { sendEmail };