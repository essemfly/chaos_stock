import { Stock, User } from "@prisma/client";
import { prisma } from "~/db.server";
import { RoundActionWithStocks } from "./round.server";

export type UserWithStockAndRoundActions = User & {
  stocks: Stock[];
  roundActions: RoundActionWithStocks[];
};

export const addUser = async (
  name: string,
  password: string
): Promise<User> => {
  return await prisma.user.create({
    data: {
      name: name,
      password: password,
    },
  });
};

export const getUserByName = async (name: string): Promise<User | null> => {
  return await prisma.user.findFirst({
    where: {
      name: name,
    },
  });
};

export const listUsers = async (): Promise<UserWithStockAndRoundActions[]> => {
  return await prisma.user.findMany({
    include: {
      stocks: true,
      roundActions: {
        include: {
          stock: true,
          roundInfo: true,
        },
      },
    },
  });
};

export const getUserDetail = async (
  id: string
): Promise<UserWithStockAndRoundActions | null> => {
  return await prisma.user.findFirst({
    where: {
      id: id,
    },
    include: {
      stocks: true,
      roundActions: {
        include: {
          stock: true,
          roundInfo: true,
        },
        orderBy: {
          roundInfo: {
            roundNumber: "asc",
          },
        },
      },
    },
  });
};
