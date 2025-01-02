import { RoundAction, RoundInfo, Stock } from "@prisma/client";
import { prisma } from "~/db.server";

export type RoundActionWithStocks = RoundAction & {
  stock: Stock;
  roundInfo: RoundInfo;
};

export const getCurrentRoundInfo = async () => {
  return await prisma.roundInfo.findFirst({
    where: {
      startedAt: {
        not: null,
      },
      endedAt: null,
    },
  });
};

export const startRound = async () => {
  const roundToStart = await prisma.roundInfo.findFirst({
    where: {
      startedAt: null,
    },
    orderBy: {
      roundNumber: "asc",
    },
  });

  if (roundToStart) {
    return await prisma.roundInfo.update({
      where: {
        id: roundToStart.id,
      },
      data: {
        startedAt: new Date(),
      },
    });
  }

  return null; // Return null if no eligible round was found
};

export const endRound = async () => {
  const roundToEnd = await prisma.roundInfo.findFirst({
    where: {
      startedAt: {
        not: null,
      },
      endedAt: null,
    },
    orderBy: {
      roundNumber: "asc",
    },
  });

  if (roundToEnd) {
    return await prisma.roundInfo.update({
      where: {
        id: roundToEnd.id,
      },
      data: {
        endedAt: new Date(),
      },
    });
  }

  return null; // Return null if no eligible round was found
};

export const listRoundActions = async (): Promise<RoundAction[]> => {
  return await prisma.roundAction.findMany({});
};

export const listRoundActionsByRoundNumber = async (
  roundNumber: number
): Promise<RoundActionWithStocks[]> => {
  return await prisma.roundAction.findMany({
    where: {
      roundInfo: {
        roundNumber: roundNumber,
      },
    },
    include: {
      stock: true,
      roundInfo: true,
    },
  });
};

export const saveRoundAction = async (
  stockId: string,
  diff: number,
  roundInfoId: string,
  price: number
) => {
  return await prisma.roundAction.create({
    data: {
      stockId: stockId,
      price: price,
      roundInfoId: roundInfoId,
      diff,
    },
  });
};
