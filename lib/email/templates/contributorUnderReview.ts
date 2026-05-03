export function contributorUnderReviewTemplate(name: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #2563EB;">Application Received</h2>
      <p>Hi ${name},</p>
      <p>We have successfully received your application to become a contributor on ED-Library. Your application is currently under review by our team.</p>
      <p>We will notify you as soon as a decision is made.</p>
      <p>Thank you,<br/>The ED-Library Team</p>
    </div>
  `;
}
