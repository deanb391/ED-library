export function subscriptionNotificationTemplate(contributorName: string, studentName: string, courseTitle: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #2563EB;">New Subscriber!</h2>
      <p>Hi ${contributorName},</p>
      <p><strong>${studentName}</strong> has just subscribed to your course: <strong>${courseTitle}</strong>.</p>
      <p>Keep up the great work,<br/>The ED-Library Team</p>
    </div>
  `;
}
