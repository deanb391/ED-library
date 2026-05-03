export function depositSuccessTemplate(name: string, amount: number) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <h2 style="color: #10B981;">Deposit Successful</h2>
      <p>Hi ${name},</p>
      <p>Your deposit of <strong>₦${amount.toLocaleString()}</strong> has been successfully added to your wallet.</p>
      <p>You can now use these funds to purchase courses or subscribe to contributors.</p>
      <p>Thank you,<br/>The ED-Library Team</p>
    </div>
  `;
}
