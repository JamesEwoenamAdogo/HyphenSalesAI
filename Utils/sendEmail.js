// services/email.service.js

// import { resend } from "../Config/resend.js";

import { resend } from "../Config/ResendConfig.js";

export async function sendEmail({
  to,
  subject,
  html,
  text,
  cc,
  bcc,
  attachments,
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to,
      cc,
      bcc,
      subject,
      html,
      text,
      attachments,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (err) {
    console.error("Email Error:", err);
    throw err;
  }
}