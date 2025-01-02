import { prisma } from "~/db.server";
import { endRound } from "~/repository/round.server";

async function main() {
  await endRound();
}

await main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
