export function purchaseNotificationTemplate(contributorName: string, courseTitle: string, amount: number) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #2563EB;">New Course Purchase</h2>
      <p>Hi ${contributorName},</p>
      <p>Great news! A student has just purchased your course: <strong>${courseTitle}</strong>.</p>
      <p>Amount earned: <strong>₦${amount.toLocaleString()}</strong></p>
      <p>Keep up the great work!<br/>The ED-Library Team</p>
    </div>
  `;
}
