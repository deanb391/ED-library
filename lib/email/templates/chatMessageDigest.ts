export function chatMessageDigestTemplate({
  recipientName,
  senders,
  lastMessageSnippet,
  chatLink,
}: {
  recipientName: string;
  senders: string[];
  lastMessageSnippet?: string;
  chatLink: string;
}) {
  const isMultiple = senders.length > 1;
  const titleText = isMultiple
    ? `New Messages from ${senders.slice(0, 2).join(" and ")}${senders.length > 2 ? " and others" : ""}`
    : `New Message from ${senders[0]}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${titleText} – ED-Library</title>
</head>
<body style="margin:0;padding:0;background-color:#FDFDFD;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FDFDFD;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

          <!-- HEADER / BRAND -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#2563eb;border-radius:10px;padding:8px 10px;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:18px;font-weight:700;">💬</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="font-size:22px;font-weight:900;color:#2563eb;letter-spacing:-0.5px;">ED-Library</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CARD -->
          <tr>
            <td style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:20px;padding:40px 36px;box-shadow:0 4px 24px rgba(0,0,0,0.04);">

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

                <!-- ICON BADGE -->
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <div style="display:inline-block;background-color:#eff6ff;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;font-size:28px;">✉️</div>
                  </td>
                </tr>

                <!-- TITLE -->
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <h1 style="margin:0;font-size:22px;font-weight:700;color:#111827;letter-spacing:-0.5px;">${isMultiple ? "You Have Unread Messages" : "You Received a New Message"}</h1>
                  </td>
                </tr>

                <!-- SUBTITLE -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <p style="margin:0;font-size:14px;color:#6b7280;">Stay connected with the team on ED-Library.</p>
                  </td>
                </tr>

                <!-- DIVIDER -->
                <tr><td style="border-top:1px solid #f3f4f6;padding-bottom:28px;"></td></tr>

                <!-- BODY -->
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;line-height:1.7;">Hi <strong style="color:#111827;">${recipientName}</strong>,</p>
                    
                    ${
                      isMultiple
                        ? `<p style="margin:0 0 20px 0;font-size:15px;color:#374151;line-height:1.7;">
                             You have unread messages waiting for you from the following users:
                           </p>
                           <ul style="margin:0 0 24px 0;padding-left:20px;font-size:15px;color:#374151;line-height:1.7;">
                             ${senders.map((sender) => `<li><strong style="color:#2563eb;">${sender}</strong></li>`).join("")}
                           </ul>`
                        : `<p style="margin:0 0 20px 0;font-size:15px;color:#374151;line-height:1.7;">
                             <strong style="color:#2563eb;">${senders[0]}</strong> sent you a message:
                           </p>
                           <div style="background-color:#f8fafc;border-left:4px solid #2563eb;border-radius:0 8px 8px 0;padding:16px;margin:0 0 24px 0;font-style:italic;color:#4b5563;font-size:15px;line-height:1.6;">
                             "${lastMessageSnippet || "Sent an attachment"}"
                           </div>`
                    }
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <a href="${chatLink}" style="display:inline-block;background-color:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:12px;box-shadow:0 4px 12px rgba(37,99,235,0.15);">
                      Open Chat Inbox &rarr;
                    </a>
                  </td>
                </tr>

                <!-- SIGN OFF -->
                <tr>
                  <td>
                    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;">
                      Best regards,<br/>
                      <strong style="color:#111827;">The ED-Library Team</strong>
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="padding-top:28px;padding-bottom:8px;">
              <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.6;">
                This notification was sent because you have unread chat messages and were offline.<br/>
                &copy; ${new Date().getFullYear()} ED-Library. All rights reserved.
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
}
