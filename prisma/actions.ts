import { RoundAction, User } from "@prisma/client";
import { prisma } from "~/db.server";
import { listRoundActions } from "~/repository/round.server";
import {
  listUsers,
} from "~/repository/user.server";

async function main() {
  const users = await listUsers();
  const actions = await listRoundActions();
  await assignRoundActionsToUsers(actions, users);
}

await main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

async function assignRoundActionsToUsers(
  roundActions: RoundAction[],
  users: User[]
) {
  const shuffledActions = roundActions.sort(() => Math.random() - 0.5);
  let actionIndex = 0;

  for (const user of users) {
    const userActions = [];
    for (let i = 0; i < 5 && actionIndex < shuffledActions.length; i++) {
      const action = shuffledActions[actionIndex];
      if (!action.userId) {
        action.userId = user.id;
        userActions.push(action);
        actionIndex++;
      }
    }

    await prisma.roundAction.updateMany({
      where: {
        id: { in: userActions.map((action) => action.id) },
      },
      data: {
        userId: user.id,
      },
    });
  }
}
