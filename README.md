# Gia Sư Nhà Mình

Gia Sư Nhà Mình is a web platform that connects learners with one-on-one English tutors in Cần Thơ. Rather than asking learners to browse a long list of profiles, the platform starts with their learning goals, current level, availability, preferred learning format, and budget. The team uses this information to review suitable tutor profiles and support an informed introduction.

Learners can study online or meet their tutor in person in Cần Thơ. They remain in control of the decision: teaching approach, schedule, and tuition are discussed before lessons begin.

## How it works

1. **Learners share their needs.** A guided form collects their English learning goals and practical preferences.
2. **Tutors present their experience.** Tutors submit their teaching areas, supported learner levels, availability, qualifications, and expected fee.
3. **The team reviews and connects.** Gia Sư Nhà Mình reviews tutor information, compares profiles against each request, and records introductions through the admin dashboard.
4. **Both sides decide.** Learners and tutors discuss the proposed arrangement and decide whether to begin lessons.

## Platform features

- Guided learner request and tutor application forms, with data stored in MongoDB
- A private dashboard for managing learner requests and tutor profiles
- Tutor profile review and status tracking
- Filters to identify tutors based on learning needs
- Introduction records and outcome tracking
- Responsive interfaces for desktop and mobile
- Privacy and terms pages

Matching is **team assisted**: the platform organizes relevant information, while the team reviews each introduction. It does not automatically select a tutor or decide on behalf of either party.

## Technology

Built with **Next.js, TypeScript, MongoDB, and Mongoose**.

## Project structure

Application code lives in `src/` and is grouped by feature:

```text
src/
  app/        routes, layouts, loading/error states and route handlers only
  features/   landing, learner-requests, tutor-applications, admin-auth, admin
              (components, styles, validation and a server/ folder for server-only code)
  shared/     UI primitives, formatters, constants and database helpers used by several features
  proxy.ts    admin return-path header
tests/        node:test suites
public/       static assets
```

Modules in `server/` folders import `server-only`, so they cannot end up in a client bundle. The admin data layer also requires an `AdminActor`, which only the session guards can issue.

## Run locally

Requires Node.js 22 or later and a MongoDB connection.

```bash
npm install
cp .env.example .env.local
npm run dev
```
## Admin operations

The admin area supports request ownership, tutor review and availability, manual introductions, separate learner and tutor confirmations, and receipt tracking. A VND 50,000 learner connection fee becomes due only after both parties agree to begin lessons. Confirmed connections and lessons that have actually started remain separate milestones. Revenue counts recorded payments only; reversing a receipt does not transfer or refund money automatically.

Each protected list supports a filtered CSV download (up to 10,000 records; narrow filters for larger exports). Exports require an authenticated admin session and neutralize spreadsheet formulas. The admin shell includes a keyboard-accessible account menu, mobile navigation, loading states, and a persistent light/dark preference. Selected UI primitives are adapted from the local project-management-system frontend; its preview data and authentication are not used.

### Provision an administrator

1. Configure `MONGODB_URI`, `ADMIN_SESSION_SECRET` (at least 32 random characters), and `ADMIN_ALLOWED_EMAILS` in `.env.local`.
2. Run `npm run admin:create`. Enter an allowed email, display name, and a password of at least 10 characters. Password input is hidden; only a scrypt hash is stored.
3. Sign in at `/admin/login` using email and password. Public administrator registration, Google sign-in, and the old shared development password are disabled.
4. To explicitly reset an existing account from a trusted terminal, run `npm run admin:create -- --reset`. Optional email password recovery for existing accounts requires Resend configuration in production.

The provisioning script does not change the email allow-list. Removing an email from `ADMIN_ALLOWED_EMAILS` revokes access on subsequent requests. Never commit `.env.local` or bootstrap passwords.

### Existing data

Existing requests and tutor profiles are preserved. Older tutor records without `acceptingStudents` must have their availability confirmed in the tutor detail page before they appear in new matching candidates. Existing connections do not become paid automatically. For a legacy `STARTED` connection, administrators can record both parties' confirmations before recording an actual payment. Existing receipts and changes retain an audit history.

### Validation

Run `npm test`, `npm run test:db`, `npm run build`, and `npm run test:e2e`. Database and HTTP tests use temporary MongoDB instances and never require production data.
