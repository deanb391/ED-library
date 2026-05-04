export function depositSuccessTemplate(name: string, amount: number) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Deposit Successful – ED-Library</title>
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
                    <div style="display:inline-block;background-color:#D1FAE5;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;font-size:28px;">&#128176;</div>
                  </td>
                </tr>

                <!-- TITLE -->
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <h1 style="margin:0;font-size:24px;font-weight:700;color:#111827;letter-spacing:-0.5px;">Deposit Successful</h1>
                  </td>
                </tr>

                <!-- SUBTITLE -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <p style="margin:0;font-size:14px;color:#6b7280;">Your wallet has been funded successfully.</p>
                  </td>
                </tr>

                <!-- DIVIDER -->
                <tr><td style="border-top:1px solid #f3f4f6;padding-bottom:28px;"></td></tr>

                <!-- BODY -->
                <tr>
                  <td style="padding-bottom:20px;">
                    <p style="margin:0 0 16px 0;font-size:15px;color:#374151;line-height:1.7;">Hi <strong style="color:#111827;">${name}</strong>,</p>
                    <p style="margin:0 0 20px 0;font-size:15px;color:#374151;line-height:1.7;">
                      Your deposit has been received and your wallet balance has been updated. Here's a summary of your transaction:
                    </p>
                  </td>
                </tr>

                <!-- AMOUNT CARD -->
                <tr>
                  <td style="padding-bottom:28px;">
                    <div style="background:linear-gradient(135deg,#2563EB,#1d4ed8);border-radius:16px;padding:28px;text-align:center;">
                      <p style="margin:0 0 6px 0;font-size:13px;font-weight:600;color:rgba(255,255,255,0.75);text-transform:uppercase;letter-spacing:1px;">Amount Deposited</p>
                      <p style="margin:0;font-size:36px;font-weight:700;color:#ffffff;letter-spacing:-1px;">&#8358;${amount.toLocaleString()}</p>
                    </div>
                  </td>
                </tr>

                <!-- INFO BOX -->
                <tr>
                  <td style="padding-bottom:28px;">
                    <div style="background-color:#F0FDF4;border:1px solid #A7F3D0;border-radius:12px;padding:20px 24px;">
                      <p style="margin:0 0 10px 0;font-size:13px;font-weight:700;color:#065F46;text-transform:uppercase;letter-spacing:0.5px;">Use your wallet balance to</p>
                      <p style="margin:0 0 8px 0;font-size:14px;color:#047857;line-height:1.6;">&#128218; &nbsp;Purchase premium courses</p>
                      <p style="margin:0;font-size:14px;color:#047857;line-height:1.6;">&#11088; &nbsp;Subscribe to your favourite contributors</p>
                    </div>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <a href="https://ed-library.vercel.app" style="display:inline-block;background-color:#2563EB;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:12px;">
                      Explore Courses &rarr;
                    </a>
                  </td>
                </tr>

                <!-- SIGN OFF -->
                <tr>
                  <td>
                    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;">
                      Thank you for using ED-Library,<br/>
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
                This is a transaction confirmation email from ED-Library.<br/>
                If you did not initiate this deposit, please contact us immediately.<br/>
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
