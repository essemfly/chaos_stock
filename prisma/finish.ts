import { prisma } from "~/db.server";
import {
  endRound,
  listRoundActionsByRoundNumber,
} from "~/repository/round.server";
import { updateStock } from "~/repository/stocks.server";

async function main() {
  const currentRound = await endRound();
  if (!currentRound) {
    console.log("No round to end");
    return;
  }
  const actions = await listRoundActionsByRoundNumber(
    currentRound.roundNumber + 1
  );
  if (actions.length === 0) {
    console.log("No actions to process");
    return;
  }

  for (const action of actions) {
    await updateStock(action.stockId, action.price, action.stock.price);
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
