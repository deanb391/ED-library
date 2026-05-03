export function contributorApprovedTemplate(name: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #10B981;">Application Approved!</h2>
      <p>Hi ${name},</p>
      <p>Congratulations! Your application to become a contributor has been approved.</p>
      <p>You can now start creating and managing your courses.</p>
      <p>Welcome aboard,<br/>The ED-Library Team</p>
    </div>
  `;
}
