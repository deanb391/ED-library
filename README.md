# ED-Library

Welcome to the ED-Library codebase. This project is a comprehensive educational resource sharing platform where students and contributors can upload, review, and monetize academic materials, courses, and documents.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Backend/Database/Auth/Storage**: Appwrite (BaaS)
- **Email**: Resend
- **AI/LLM**: Google GenAI
- **Analytics**: PostHog
- **Payments**: Flutterwave

## Project Structure

- `app/`: Next.js App Router structure. Contains all routes, layouts, and API wrappers (`app/api/`).
  - `app/admin/`: Admin dashboards for reviewing documents, contributors, ads, and contest scoring.
  - `app/contributor/`: Contributor dashboard for managing uploads, analytics, earnings, and referrals.
  - `app/contest/`: The 30-Day Contributor Challenge marketing and enrollment pages.
- `components/`: Reusable React UI components (modals, cards, layout pieces).
- `lib/`: Core utilities and logic.
  - `lib/api/`: Frontend API wrapper functions that call the Next.js API routes (which act as proxies/secure endpoints).
  - `lib/services/`: Backend services that directly interact with Appwrite databases, storage, and external APIs. This is where the core business logic lives.
  - `lib/appwrite/`: Appwrite client and server SDK initialization.
- `context/`: React context providers (e.g., `UserContext`).

## Core Concepts

1. **Users & Contributors**: Regular users can view content. A user can apply to become a `Contributor`. Only approved contributors can upload content and participate in contests.
2. **Documents & Courses**: Contributors upload documents or create courses, which are stored in Appwrite and linked to their profile.
3. **Admin Review**: All contributor applications and document uploads go through an admin review pipeline (often augmented with `ai-reviewer.service.ts`).
4. **Wallets & Earnings**: Contributors earn money through ad revenue sharing, paid courses, and contests.

## Getting Started

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the required Appwrite and API keys.

3. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.
