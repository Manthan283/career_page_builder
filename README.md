RecruitKraft - Careers Page Builder / Lightweight ATS

A lightweight careers page builder with internal ATS capabilities.
Built for teams that want to publish jobs quickly, manage branding, and collaborate internally — without heavy infrastructure or redeploys.

✨ What This App Does

Create a public careers page for each company

Manage company branding and messaging

Create and publish job listings instantly

Invite teammates with role-based access

Secure editing via server-side authorization

Zero redeploys required to update jobs or branding

This is not a job marketplace; it is an internal SaaS-style tool focused on correctness, clarity, and extensibility.

🧱 Tech Stack

Frontend: Next.js (App Router), React Server Components

Backend: Next.js Route Handlers

Auth: NextAuth (session-based)

Database: PostgreSQL (Neon)

ORM: Prisma

Styling: Tailwind CSS

Deployment: Vercel

🚀 Live Demo

👉 Production URL:
<https://recruitkraft.vercel.app/>

🛠️ Local Setup
1. Clone the repository
git clone <https://github.com/Manthan283/career_page_builder.git>
cd career-page-builder

2. Install dependencies
pnpm install

3. Configure environment variables

Create a .env file:

DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000


The app is tested against Neon Postgres, but any PostgreSQL-compatible DB works.

4. Run database migrations
pnpm prisma migrate dev
pnpm prisma generate

5. Start the app
pnpm dev


App runs at:
http://localhost:3000

🧭 How to Use (Step-by-Step)

1️⃣ Sign In

Use credentials-based auth (Admin credentials mentioned in RecruitKraft Documentation)

Session-based authentication via NextAuth

2️⃣ Create a Company

Navigate to /create-company

Required fields:

Company Name

Hero Text (short public tagline)

This creates:

A company workspace

An OWNER membership for the creator

A public careers page at /{companySlug}/careers

3️⃣ Customize Branding

Inside the editor (/{companySlug}/edit):

Branding fields:

Company logo URL

Hero text (short tagline)

About company (longer description)

Primary color

Banner image URL

Culture video URL

Changes are saved instantly and reflected on the public page.

4️⃣ Create Jobs

Jobs are created inside the editor.

Job Fields
Section	Description
Title	Job title
Location	City / Remote
Job Type	Full-time / Part-time / Contract
About the role	High-level role description
What you’ll do	Responsibilities
Qualifications	Required skills
Nice to have	Optional skills
Custom section title	e.g. “How we work”
Custom section content	Free-form content

Jobs are immediately visible on the public careers page.

5️⃣ Invite Teammates

Owners/Admins can invite users via email.

Role-based access: OWNER / ADMIN / EDITOR / VIEWER

Secure token-based invite acceptance

Authorization enforced server-side

6️⃣ Public Careers Page

Public view:

/{companySlug}/careers
/{companySlug}/careers/{jobSlug}


SEO-friendly

No authentication required

Structured job data rendering