import { resend } from "./resend";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: "ED-Library <noreply@ed-library.com>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[Email Error] Failed to send email:", error);
      return false;
    }

    console.log(`[Email Success] Sent email to ${to} with ID ${data?.id}`);
    return true;
  } catch (error) {
    console.error("[Email Error] Exception while sending email:", error);
    return false;
  }
}
