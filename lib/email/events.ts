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
