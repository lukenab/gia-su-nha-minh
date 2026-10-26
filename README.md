# Gia Sư Nhà Mình

**Find the right English tutor for the way you learn.**

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

## Run locally

Requires Node.js 22 or later and a MongoDB connection.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set `MONGODB_URI`, `ADMIN_ALLOWED_EMAILS`, and `ADMIN_SESSION_SECRET` in `.env.local`, then open `http://localhost:3000`. The private dashboard is available at `/admin/login`. Authorized team members can set a password through a one-time email link; configure `RESEND_API_KEY` and `EMAIL_FROM` to deliver these links outside local development.
