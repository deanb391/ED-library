import { resend } from "./resend";
import { trackEvent } from "@/lib/analytics/trackEvent";

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
      from: "ED-Library <noreply@mail.ed-library.app>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[Email Error] Failed to send email:", error);
      trackEvent("EMAIL_FAILED", {
        distinctId: to,
        metadata: { subject, error: JSON.stringify(error) }
      });
      return false;
    }

    console.log(`[Email Success] Sent email to ${to} with ID ${data?.id}`);
    trackEvent("EMAIL_SENT", {
      distinctId: to,
      metadata: { subject, emailId: data?.id }
    });
    return true;
  } catch (error) {
    console.error("[Email Error] Exception while sending email:", error);
    trackEvent("EMAIL_FAILED", {
      distinctId: to,
      metadata: { subject, error: (error as Error).message }
    });
    return false;
  }
}
