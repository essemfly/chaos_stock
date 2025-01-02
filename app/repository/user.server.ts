import { Side, Stock, User, UserStock } from "@prisma/client";
import { prisma } from "~/db.server";
import { RoundActionWithStocks } from "./round.server";

export type UserStockWithStock = UserStock & {
  stock: Stock;
};

export type UserWithStockAndRoundActions = User & {
  userStocks: UserStockWithStock[];
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

export const updateUserStock = async (
  side: Side,
  userId: string,
  stockId: string,
  quantity: number
): Promise<UserStock> => {
  const userStock = await prisma.userStock.findFirst({
    where: {
      userId: userId,
      stockId: stockId,
    },
  });

  if (userStock) {
    return await prisma.userStock.update({
      where: {
        id: userStock.id,
      },
      data: {
        quantity:
          side === Side.BUY
            ? userStock.quantity + quantity
            : userStock.quantity - quantity,
      },
    });
  }

  return await prisma.userStock.create({
    data: {
      quantity: quantity,
      userId: userId,
      stockId: stockId,
    },
  });
};

export const updateUserBalance = async (
  id: string,
  balance: number
): Promise<User> => {
  return await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      balance: balance,
    },
  });
};

export const getUserById = async (id: string): Promise<User | null> => {
  return await prisma.user.findFirst({
    where: {
      id: id,
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
      userStocks: {
        include: {
          stock: true,
        },
      },
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
      userStocks: {
        include: {
          stock: true,
        },
      },
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
