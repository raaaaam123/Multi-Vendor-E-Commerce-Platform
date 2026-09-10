const APP_NAME = "ShopVerse";
const BASE_URL = process.env.CLIENT_URL || "http://localhost:5173";

const emailWrapper = (title, bodyHtml) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr>
              <td style="background-color:#4f46e5;padding:24px 32px;">
                <h1 style="margin:0;font-size:20px;font-weight:700;color:#ffffff;">${APP_NAME}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <h2 style="margin:0 0 16px;font-size:18px;color:#111827;font-weight:700;">${title}</h2>
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center;">
                <p style="margin:0;font-size:12px;color:#9ca3af;">
                  &copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.<br/>
                  <a href="${BASE_URL}" style="color:#4f46e5;text-decoration:none;">${BASE_URL}</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const registrationEmail = ({ name, role }) => {
  const isVendor = role === "vendor";
  const title = isVendor ? "Vendor Registration Received" : "Welcome to ShopVerse!";
  const body = `
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
      Hello <strong>${name}</strong>,
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
      ${
        isVendor
          ? "Thank you for registering as a vendor on ShopVerse. Your application is now under review. Our team will verify your business details and notify you once your account is approved."
          : "Thank you for joining ShopVerse! Your account has been created successfully. You can now browse products, manage a wishlist, and start shopping."
      }
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
      You can log in to your account anytime using the button below.
    </p>
    <p style="margin:0;">
      <a href="${BASE_URL}/login" style="display:inline-block;background-color:#4f46e5;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Log In to ${APP_NAME}</a>
    </p>
  `;
  return emailWrapper(title, body);
};

const vendorApprovalEmail = ({ name, businessName, approved }) => {
  const title = approved ? "Vendor Account Approved" : "Vendor Application Update";
  const body = `
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
      Hello <strong>${name}</strong>,
    </p>
    ${
      approved
        ? `
      <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
        Congratulations! Your vendor account <strong>${businessName}</strong> has been approved. You can now log in and start adding products to the marketplace.
      </p>
      <p style="margin:0;">
        <a href="${BASE_URL}/vendor/login" style="display:inline-block;background-color:#4f46e5;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Go to Vendor Dashboard</a>
      </p>
    `
        : `
      <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
        We regret to inform you that your vendor application for <strong>${businessName}</strong> was not approved at this time. This may be due to incomplete information or failure to meet our marketplace guidelines.
      </p>
      <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
        Please contact support if you believe this is an error or would like to resubmit your application.
      </p>
      <p style="margin:0;">
        <a href="${BASE_URL}/contact" style="display:inline-block;background-color:#4f46e5;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Contact Support</a>
      </p>
    `
    }
  `;
  return emailWrapper(title, body);
};

const orderConfirmEmail = ({ name, orderNumber, items, total, address }) => {
  const itemsHtml = (items || [])
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;font-size:13px;color:#374151;">${item.name} &times; ${item.quantity}</td>
          <td style="padding:10px 0;font-size:13px;color:#374151;text-align:right;">Rs. ${item.price * item.quantity}</td>
        </tr>
      `
    )
    .join("");
  return emailWrapper(
    "Order Confirmation",
    `
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
      Dear <strong>${name}</strong>, thank you for your order!
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
      Your order <strong>#${orderNumber}</strong> has been received and is being processed.
    </p>
    <p style="margin:0 0 8px;font-size:14px;color:#111827;font-weight:600;">Items</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${itemsHtml || "<tr><td style='padding:10px 0;font-size:13px;color:#374151;'>No items</td></tr>"}
      <tr>
        <td style="padding:10px 0;font-size:14px;color:#111827;font-weight:700;border-top:1px solid #f3f4f6;">Total</td>
        <td style="padding:10px 0;font-size:14px;color:#111827;font-weight:700;text-align:right;border-top:1px solid #f3f4f6;">Rs. ${total}</td>
      </tr>
    </table>
    <p style="margin:16px 0 4px;font-size:14px;color:#111827;font-weight:600;">Shipping Address</p>
    <p style="margin:0;font-size:13px;color:#4b5563;line-height:1.5;">
      ${address?.name}<br/>
      ${address?.address}, ${address?.city}<br/>
      ${address?.state ? address.state + ", " : ""}${address?.zipCode}, ${address?.country || "India"}<br/>
      Phone: ${address?.phone}
    </p>
    <p style="margin:16px 0 0;">
      <a href="${BASE_URL}/account/orders" style="display:inline-block;background-color:#4f46e5;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">View My Orders</a>
    </p>
  `
  );
};

const paymentSuccessEmail = ({ name, orderNumber, amount, method }) =>
  emailWrapper(
    "Payment Received",
    `
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
      Dear <strong>${name}</strong>, we have received your payment.
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
      Your order <strong>#${orderNumber}</strong> is confirmed and will be prepared for shipping shortly.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;padding:16px;margin:0 0 16px;">
      <tr>
        <td style="font-size:13px;color:#6b7280;padding:4px 8px;">Amount Paid</td>
        <td style="font-size:14px;color:#111827;font-weight:600;text-align:right;padding:4px 8px;">Rs. ${amount}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#6b7280;padding:4px 8px;">Payment Method</td>
        <td style="font-size:14px;color:#111827;font-weight:600;text-align:right;padding:4px 8px;">${method}</td>
      </tr>
      <tr>
        <td style="font-size:13px;color:#6b7280;padding:4px 8px;">Order</td>
        <td style="font-size:14px;color:#111827;font-weight:600;text-align:right;padding:4px 8px;">#${orderNumber}</td>
      </tr>
    </table>
    <p style="margin:0;">
      <a href="${BASE_URL}/account/orders" style="display:inline-block;background-color:#4f46e5;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Track Order</a>
    </p>
  `
  );

const orderShippedEmail = ({ name, orderNumber, trackingNumber, items }) => {
  const itemsHtml = (items || [])
    .map((item) => `<li style="font-size:13px;color:#374151;">${item.name} &times; ${item.quantity}</li>`)
    .join("");
  return emailWrapper(
    "Your Order Has Shipped",
    `
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
      Dear <strong>${name}</strong>, good news!
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
      Your order <strong>#${orderNumber}</strong> is on its way.
    </p>
    ${
      trackingNumber
        ? `<p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">Tracking number: <strong>${trackingNumber}</strong></p>`
        : ""
    }
    ${
      itemsHtml
        ? `<p style="margin:0 0 8px;font-size:14px;color:#111827;font-weight:600;">Items shipped</p><ul style="margin:0 0 16px;padding-left:20px;">${itemsHtml}</ul>`
        : ""
    }
    <p style="margin:0;">
      <a href="${BASE_URL}/account/orders" style="display:inline-block;background-color:#4f46e5;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Track My Order</a>
    </p>
  `
  );
};

const orderDeliveredEmail = ({ name, orderNumber }) =>
  emailWrapper(
    "Order Delivered",
    `
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
      Dear <strong>${name}</strong>, your order <strong>#${orderNumber}</strong> has been delivered.
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
      We hope you love your purchase! If you have a moment, we'd appreciate a review of your items to help other shoppers.
    </p>
    <p style="margin:0;">
      <a href="${BASE_URL}/account/orders" style="display:inline-block;background-color:#4f46e5;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Review Your Order</a>
    </p>
  `
  );

const passwordResetEmail = ({ name, resetUrl }) =>
  emailWrapper(
    "Reset Your Password",
    `
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
      Dear <strong>${name}</strong>, we received a request to reset your password.
    </p>
    <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
      Click the button below to choose a new password. This link is valid for <strong>15 minutes</strong>.
    </p>
    <p style="margin:0 0 16px;">
      <a href="${resetUrl}" style="display:inline-block;background-color:#4f46e5;color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Reset My Password</a>
    </p>
    <p style="margin:0;font-size:12px;color:#9ca3af;">
      If you did not request a password reset, you can safely ignore this email.
    </p>
  `
  );

export {
  registrationEmail,
  vendorApprovalEmail,
  orderConfirmEmail,
  paymentSuccessEmail,
  orderShippedEmail,
  orderDeliveredEmail,
  passwordResetEmail,
};