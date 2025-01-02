import { prisma } from "~/db.server";
import { startRound } from "~/repository/round.server";

async function main() {
  await startRound();
}

await main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
