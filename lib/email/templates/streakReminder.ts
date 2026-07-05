export function streakReminderTemplate(name: string, currentStreak: number, hasStreak: boolean) {
  const badgeEmoji = hasStreak ? "🔥" : "✨";
  const title = hasStreak ? "Keep Your Streak Burning!" : "Start Your Streak Today!";
  const subTitle = hasStreak 
    ? `You have a ${currentStreak}-day upload streak. Don't let it break!`
    : "Upload notes today to build your streak and get rewarded.";

  const bodyContent = hasStreak
    ? `
      <p style="margin:0 0 16px 0;font-size:15px;color:#374151;line-height:1.7;">Hi <strong style="color:#111827;">${name}</strong>,</p>
      <p style="margin:0 0 20px 0;font-size:15px;color:#374151;line-height:1.7;">
        You're doing amazing! Your current upload streak is <strong style="color:#ea580c;">${currentStreak} days</strong> in a row. 
      </p>
      <p style="margin:0 0 20px 0;font-size:15px;color:#374151;line-height:1.7;">
        Don't let your hard work go to waste. Upload notes for your courses before the day ends to keep your streak burning hot!
      </p>
    `
    : `
      <p style="margin:0 0 16px 0;font-size:15px;color:#374151;line-height:1.7;">Hi <strong style="color:#111827;">${name}</strong>,</p>
      <p style="margin:0 0 20px 0;font-size:15px;color:#374151;line-height:1.7;">
        Ready to make an impact today? Share your course lecture notes and start your official upload streak on <strong style="color:#2563EB;">ED-Library</strong>!
      </p>
      <p style="margin:0 0 20px 0;font-size:15px;color:#374151;line-height:1.7;">
        Consistency is key. Every day you upload, you support your peers and earn rewards. Let's make today Day 1!
      </p>
    `;

  const visualBox = hasStreak
    ? `
      <tr>
        <td style="padding-bottom:28px;">
          <div style="background-color:#fff7ed;border:1px solid #ffedd5;border-radius:16px;overflow:hidden;padding:24px;text-align:center;">
            <div style="font-size:48px;line-height:1;margin-bottom:8px;animation:pulse 2s infinite;">🔥</div>
            <p style="margin:0 0 4px 0;font-size:13px;font-weight:700;color:#ea580c;text-transform:uppercase;letter-spacing:1px;">Active Streak</p>
            <p style="margin:0;font-size:32px;font-weight:800;color:#9a3412;">${currentStreak} Days</p>
          </div>
        </td>
      </tr>
    `
    : `
      <tr>
        <td style="padding-bottom:28px;">
          <div style="background-color:#eff6ff;border:1px solid #dbeafe;border-radius:16px;overflow:hidden;padding:24px;text-align:center;">
            <div style="font-size:48px;line-height:1;margin-bottom:8px;">✨</div>
            <p style="margin:0 0 4px 0;font-size:13px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:1px;">Start Fresh</p>
            <p style="margin:0;font-size:24px;font-weight:800;color:#1e3a8a;">Ready for Day 1?</p>
          </div>
        </td>
      </tr>
    `;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
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
                    <div style="display:inline-block;background-color:${hasStreak ? '#ffedd5' : '#dbeafe'};border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;font-size:28px;">${badgeEmoji}</div>
                  </td>
                </tr>

                <!-- TITLE -->
                <tr>
                  <td align="center" style="padding-bottom:8px;">
                    <h1 style="margin:0;font-size:24px;font-weight:700;color:#111827;letter-spacing:-0.5px;">${title}</h1>
                  </td>
                </tr>

                <!-- SUBTITLE -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <p style="margin:0;font-size:14px;color:#6b7280;">${subTitle}</p>
                  </td>
                </tr>

                <!-- DIVIDER -->
                <tr><td style="border-top:1px solid #f3f4f6;padding-bottom:28px;"></td></tr>

                <!-- BODY -->
                <tr>
                  <td style="padding-bottom:20px;">
                    ${bodyContent}
                  </td>
                </tr>

                <!-- VISUAL STAT BOX -->
                ${visualBox}

                <!-- CTA -->
                <tr>
                  <td align="center" style="padding-bottom:32px;">
                    <a href="https://c381-105-113-9-219.ngrok-free.app/contributor/dashboard" style="display:inline-block;background-color:#2563EB;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:12px;box-shadow:0 4px 10px rgba(37, 99, 235, 0.2);">
                      Upload Notes Now &rarr;
                    </a>
                  </td>
                </tr>

                <!-- SIGN OFF -->
                <tr>
                  <td>
                    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.7;">
                      Stay consistent,<br/>
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
                This reminder was sent to help keep your streak active on ED-Library.<br/>
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
