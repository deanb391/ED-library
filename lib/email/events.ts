import { sendEmail } from "./sendEmail";
import { contributorUnderReviewTemplate } from "./templates/contributorUnderReview";
import { contributorApprovedTemplate } from "./templates/contributorApproved";
import { purchaseNotificationTemplate } from "./templates/purchaseNotification";
import { subscriptionNotificationTemplate } from "./templates/subscriptionNotification";
import { withdrawalSuccessTemplate } from "./templates/withdrawalSuccess";
import { depositSuccessTemplate } from "./templates/depositSuccess";

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
