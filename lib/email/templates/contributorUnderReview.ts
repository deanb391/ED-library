export function contributorUnderReviewTemplate(name: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Application Received – ED-Library</title>
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
                    <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.5px;">&#128218;</span>
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
                    <div style="display:inline-block;background-color:#DBEAFE;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;font-size:28px;">&#128203;</div>
                  </td>
                </tr>

                <!-- TITLE -->
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <h1 style="margin:0;font-size:24px;font-weight:700;color:#111827;letter-spacing:-0.5px;">Application Received</h1>
                  </td>
                </tr>

                <!-- SUBTITLE -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <p style="margin:0;font-size:14px;color:#6b7280;">We'll review it and get back to you soon.</p>
                  </td>
                </tr>

                <!-- DIVIDER -->
                <tr><td style="border-top:1px solid #f3f4f6;padding-bottom:28px;"></td></tr>

                <!-- BODY -->
                <tr>
                  <td style="padding-bottom:12px;">
                    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;line-height:1.7;">Hi <strong style="color:#111827;">${name}</strong>,</p>
                    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;line-height:1.7;">
                      Thank you for applying to become a contributor on <strong style="color:#2563EB;">ED-Library</strong>. We've successfully received your application and it is currently <strong style="color:#2563EB;">under review</strong> by our team.
                    </p>
                    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;line-height:1.7;">
                      Our review process typically takes a short while. We'll send you another email as soon as a decision has been made.
                    </p>
                  </td>
                </tr>

                <!-- HIGHLIGHTS BOX -->
                <tr>
                  <td style="padding-bottom:28px;">
                    <div style="background-color:#EFF6FF;border:1px solid #BFDBFE;border-radius:12px;padding:20px 24px;">
                      <p style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:0.5px;">What happens next</p>
                      <p style="margin:0 0 8px 0;font-size:14px;color:#1d4ed8;line-height:1.6;">&#128269; &nbsp;Our team reviews your profile &amp; credentials</p>
                      <p style="margin:0 0 8px 0;font-size:14px;color:#1d4ed8;line-height:1.6;">&#128231; &nbsp;You'll receive an email with our decision</p>
                      <p style="margin:0;font-size:14px;color:#1d4ed8;line-height:1.6;">&#127881; &nbsp;If approved, you can start creating immediately</p>
                    </div>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <a href="https://www.ed-library.app" style="display:inline-block;background-color:#2563EB;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:12px;letter-spacing:0.2px;">
                      Visit ED-Library &rarr;
                    </a>
                  </td>
                </tr>

                <!-- SIGN OFF -->
                <tr>
                  <td>
                    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;">
                      Thank you for your patience,<br/>
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
                You received this email because you applied to ED-Library.<br/>
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
