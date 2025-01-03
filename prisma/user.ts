import { prisma } from "~/db.server";
import { addUser } from "~/repository/user.server";

async function main() {
  for (let i = 0; i < 15; i++) {
    await addUser(`user ${i}`, "1234");
  }
}

await main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
