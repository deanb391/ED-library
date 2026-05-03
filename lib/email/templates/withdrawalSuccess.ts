export function withdrawalSuccessTemplate(name: string, amount: number) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #10B981;">Withdrawal Successful</h2>
      <p>Hi ${name},</p>
      <p>Your withdrawal of <strong>₦${amount.toLocaleString()}</strong> has been successfully processed.</p>
      <p>The funds should be available in your designated bank account shortly.</p>
      <p>Thank you,<br/>The ED-Library Team</p>
    </div>
  `;
}
