// app/help/page.tsx
import type { Metadata } from "next";
import HelpClient from "./HelpClient";

export const metadata: Metadata = {
  title: "Help Center | ED-Library",
  description:
    "Find answers to frequently asked questions about ED-Library — covering getting started, courses, accounts, technical issues, and how to contact support.",
};

export default function HelpPage() {
  return <HelpClient />;
}
