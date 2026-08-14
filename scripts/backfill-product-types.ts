// One-off backfill: classify a pairing `type` for every existing product whose
// `attributes.type` is missing. Idempotent — only touches rows without a type.
// Run with --dry-run first to review before writing.
import prisma from "@/lib/prisma";
import { classifyTypeFromText } from "@/lib/complementary-pairings";

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const products = await prisma.product.findMany({
    include: { category: true },
  });

  const toUpdate = products.filter((p) => {
    const attrs = p.attributes as Record<string, unknown> | null;
    return !attrs || !attrs.type;
  });

  console.log(`${toUpdate.length} of ${products.length} products missing attributes.type`);

  for (const p of toUpdate) {
    const type = classifyTypeFromText(p.name, p.description, p.category.name);
    const existingAttrs = (p.attributes as Record<string, unknown> | null) || {};
    console.log(`${p.category.name.padEnd(20)} | ${p.name.padEnd(45)} -> ${type}`);
    if (!dryRun) {
      await prisma.product.update({
        where: { id: p.id },
        data: { attributes: { ...existingAttrs, type } },
      });
    }
  }

  console.log(dryRun ? "\nDry run only — no writes made." : "\nDone.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
