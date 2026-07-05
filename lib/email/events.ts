import { sendEmail } from "./sendEmail";
import { contributorUnderReviewTemplate } from "./templates/contributorUnderReview";
import { contributorApprovedTemplate } from "./templates/contributorApproved";
import { purchaseNotificationTemplate } from "./templates/purchaseNotification";
import { subscriptionNotificationTemplate } from "./templates/subscriptionNotification";
import { withdrawalSuccessTemplate } from "./templates/withdrawalSuccess";
import { depositSuccessTemplate } from "./templates/depositSuccess";
import { newFollowerTemplate } from "./templates/newFollower";
import { streakReminderTemplate } from "./templates/streakReminder";
import { newPostFollowersTemplate } from "./templates/newPostFollowers";
import { newCourseFollowersTemplate } from "./templates/newCourseFollowers";
import { chatMessageDigestTemplate } from "./templates/chatMessageDigest";

export function sendContributorUnderReviewEmail(to: string, name: string) {
  sendEmail({
    to,
    subject: "Application Under Review - ED-Library",
    html: contributorUnderReviewTemplate(name),
  }).catch(console.error);
}

export function sendContributorApprovedEmail(to: string, name: string) {
  sendEmail({
    to,
    subject: "Application Approved - ED-Library",
    html: contributorApprovedTemplate(name),
  }).catch(console.error);
}

export function sendPurchaseNotificationEmail(to: string, contributorName: string, courseTitle: string, amount: number) {
  sendEmail({
    to,
    subject: "New Course Purchase - ED-Library",
    html: purchaseNotificationTemplate(contributorName, courseTitle, amount),
  }).catch(console.error);
}

export function sendSubscriptionNotificationEmail(to: string, contributorName: string, studentName: string, courseTitle: string) {
  sendEmail({
    to,
    subject: "New Subscriber - ED-Library",
    html: subscriptionNotificationTemplate(contributorName, studentName, courseTitle),
  }).catch(console.error);
}

export function sendWithdrawalSuccessEmail(to: string, name: string, amount: number) {
  sendEmail({
    to,
    subject: "Withdrawal Successful - ED-Library",
    html: withdrawalSuccessTemplate(name, amount),
  }).catch(console.error);
}

export function sendDepositSuccessEmail(to: string, name: string, amount: number) {
  sendEmail({
    to,
    subject: "Deposit Successful - ED-Library",
    html: depositSuccessTemplate(name, amount),
  }).catch(console.error);
}

export function sendNewFollowerEmail(to: string, contributorName: string, followerName: string) {
  sendEmail({
    to,
    subject: "New Follower - ED-Library",
    html: newFollowerTemplate(contributorName, followerName),
  }).catch(console.error);
}

export function sendStreakReminderEmail(to: string, name: string, currentStreak: number, hasStreak: boolean) {
  const subject = hasStreak ? "Keep your streak burning! 🔥" : "Start your upload streak today! ✨";
  sendEmail({
    to,
    subject: `${subject} - ED-Library`,
    html: streakReminderTemplate(name, currentStreak, hasStreak),
  }).catch(console.error);
}

export function sendNewPostFollowersEmail(to: string, contributorName: string, courseTitle: string, noteDescription: string) {
  sendEmail({
    to,
    subject: `New notes uploaded by ${contributorName}! 📝 - ED-Library`,
    html: newPostFollowersTemplate(contributorName, courseTitle, noteDescription),
  }).catch(console.error);
}

export function sendNewCourseFollowersEmail(to: string, contributorName: string, courseTitle: string, courseDescription: string) {
  sendEmail({
    to,
    subject: `New course created by ${contributorName}! 🎓 - ED-Library`,
    html: newCourseFollowersTemplate(contributorName, courseTitle, courseDescription),
  }).catch(console.error);
}

export function sendChatMessageDigestEmail(
  to: string,
  params: {
    recipientName: string;
    senders: string[];
    lastMessageSnippet?: string;
    chatLink: string;
  }
) {
  const isMultiple = params.senders.length > 1;
  const subject = isMultiple
    ? `New Messages from ${params.senders.slice(0, 2).join(" and ")}${params.senders.length > 2 ? " and others" : ""} - ED-Library`
    : `New Message from ${params.senders[0]} - ED-Library`;

  sendEmail({
    to,
    subject,
    html: chatMessageDigestTemplate(params),
  }).catch(console.error);
}

export function sendContestDailySummaryEmail(to: string, data: { points: number, total: number }) {
  sendEmail({
    to,
    subject: "Your Daily Contest Performance Update 🏆 - ED-Library",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4f46e5;">Contest Daily Summary</h2>
        <p>Your performance points for the day have been calculated!</p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Points Earned Today:</strong> <span style="color: #10b981; font-size: 1.2em;">${data.points.toFixed(1)}</span></p>
          <p style="margin: 0;"><strong>Total Contest Points:</strong> <span style="color: #6366f1; font-size: 1.2em;">${data.total.toFixed(1)}</span></p>
        </div>
        <p>Keep uploading high-quality content and sharing your course links to maximize your rewards.</p>
        <p>Best,<br/>ED-Library Team</p>
      </div>
    `,
  }).catch(console.error);
}
