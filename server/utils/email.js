import nodemailer from "nodemailer";

const isSmtpConfigured =
  process.env.SMTP_USER &&
  !process.env.SMTP_USER.includes("your_email");

const transporter = isSmtpConfigured
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  : null;

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
    console.error("[EMAIL] Failed to send email:", error);
    throw error;
  }
};

export { sendEmail };