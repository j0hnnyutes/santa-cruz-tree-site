const { PrismaClient, LeadStatus } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

function randomStatus(i) {
  if (i % 7 === 0) return LeadStatus.ARCHIVED;
  if (i % 5 === 0) return LeadStatus.CLOSED;
  if (i % 3 === 0) return LeadStatus.CONTACTED;
  return LeadStatus.NEW;
}

(async () => {
  try {
    const leads = [];

    for (let i = 1; i <= 100; i++) {
      const status = randomStatus(i);

      leads.push({
        leadId: crypto.randomUUID(),
        fullName: `Bulk Test Lead ${i}`,
        phoneDigits: `831555${String(1000 + i).slice(-4)}`,
        email: `bulk${i}@example.com`,
        service:
          i % 2 === 0
            ? "Tree Removal"
            : "Tree Trimming",
        details: "Bulk pagination / archive test",
        status,
        archivedAt:
          status === LeadStatus.ARCHIVED
            ? new Date()
            : null,
      });
    }

    await prisma.lead.createMany({
      data: leads,
    });

    const count = await prisma.lead.count();
    console.log("✅ Bulk insert complete. Total leads:", count);

  } catch (err) {
    console.error("❌ Insert failed:", err);
  } finally {
    await prisma.$disconnect();
  }
})();