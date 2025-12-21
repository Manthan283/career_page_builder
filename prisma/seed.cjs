// prisma/seed.cjs
require("dotenv").config();

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.job.deleteMany({});
  await prisma.company.deleteMany({});

  const company1 = await prisma.company.create({
    data: {
      slug: "vintera",
      name: "Vintera",
      description: "Interview preparation tools with AI feedback for devs.",
      website: "https://vintera.example.com",
      branding: {
        logo: "https://placehold.co/128x128?text=V",
        heroText: "We help candidates prepare and teams hire with confidence."
      }
    }
  });

  const company2 = await prisma.company.create({
    data: {
      slug: "acme-hr",
      name: "Acme HR",
      description: "Modern ATS for mid-market companies.",
      website: "https://acme-hr.example.com",
      branding: {
        logo: "https://placehold.co/128x128?text=A",
        heroText: "Hiring software that helps teams move faster and kinder."
      }
    }
  });

  await prisma.job.createMany({
    data: [
      {
        companyId: company1.id,
        title: "Senior Frontend Engineer",
        slug: "senior-frontend-engineer",
        location: "Remote",
        jobType: "Full-time",
        description: "<p>Work on our Next.js app. Ship performant UI.</p>"
      },
      {
        companyId: company1.id,
        title: "Product Designer",
        slug: "product-designer",
        location: "Bengaluru, India",
        jobType: "Full-time",
        description: "<p>Design experiences for recruiters and candidates.</p>"
      },
      {
        companyId: company2.id,
        title: "Customer Success Manager",
        slug: "customer-success-manager",
        location: "London, UK",
        jobType: "Full-time",
        description: "<p>Help customers get value from our ATS.</p>"
      }
    ]
  });

  console.log("Seed complete");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
