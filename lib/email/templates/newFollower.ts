export function newFollowerTemplate(contributorName: string, followerName: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Follower – ED-Library</title>
</head>
<body style="margin:0;padding:0;background-color:#F8F9FB;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8F9FB;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

          <!-- HEADER / BRAND -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#2563EB;border-radius:10px;padding:8px 10px;vertical-align:middle;">
                    <span style="color:#ffffff;font-size:18px;font-weight:700;">&#128218;</span>
                  </td>
                  <td style="padding-left:10px;vertical-align:middle;">
                    <span style="font-size:20px;font-weight:700;color:#111827;letter-spacing:-0.5px;">ED-Library</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CARD -->
          <tr>
            <td style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:20px;padding:40px 36px;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">

                <!-- ICON BADGE -->
                <tr>
                  <td align="center" style="padding-bottom:24px;">
                    <div style="display:inline-block;background-color:#DBEAFE;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;font-size:28px;">&#128101;</div>
                  </td>
                </tr>

                <!-- TITLE -->
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <h1 style="margin:0;font-size:24px;font-weight:700;color:#111827;letter-spacing:-0.5px;">You Have a New Follower!</h1>
                  </td>
                </tr>

                <!-- SUBTITLE -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <p style="margin:0;font-size:14px;color:#6b7280;">Your audience is growing on ED-Library.</p>
                  </td>
                </tr>

                <!-- DIVIDER -->
                <tr><td style="border-top:1px solid #f3f4f6;padding-bottom:28px;"></td></tr>

                <!-- BODY -->
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;line-height:1.7;">Hi <strong style="color:#111827;">${contributorName}</strong>,</p>
                    <p style="margin:0 0 20px 0;font-size:15px;color:#374151;line-height:1.7;">
                      Great news — someone just started following you on <strong style="color:#2563EB;">ED-Library</strong>!
                    </p>
                  </td>
                </tr>

                <!-- FOLLOWER DETAILS BOX -->
                <tr>
                  <td style="padding-bottom:28px;">
                    <div style="background-color:#F8F9FB;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
                      <div style="padding:18px 24px;display:flex;align-items:center;gap:12px;">
                        <div style="background-color:#DBEAFE;border-radius:50%;width:44px;height:44px;line-height:44px;text-align:center;font-size:20px;flex-shrink:0;">&#128100;</div>
                        <div>
                          <p style="margin:0 0 2px 0;font-size:12px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">New Follower</p>
                          <p style="margin:0;font-size:16px;font-weight:700;color:#111827;">${followerName}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- MOTIVATOR BOX -->
                <tr>
                  <td style="padding-bottom:28px;">
                    <div style="background-color:#EFF6FF;border:1px solid #BFDBFE;border-radius:12px;padding:20px 24px;text-align:center;">
                      <p style="margin:0;font-size:14px;color:#1d4ed8;line-height:1.7;">
                        &#128218; &nbsp;Keep publishing quality content to keep your followers engaged and attract even more!
                      </p>
                    </div>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <a href="https://www.ed-library.app" style="display:inline-block;background-color:#2563EB;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:12px;">
                      View Dashboard &rarr;
                    </a>
                  </td>
                </tr>

                <!-- SIGN OFF -->
                <tr>
                  <td>
                    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;">
                      Keep up the great work,<br/>
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
                This notification was sent because someone followed you on ED-Library.<br/>
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
