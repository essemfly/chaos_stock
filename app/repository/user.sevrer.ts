import { RoundAction, Stock, User } from "@prisma/client";
import { prisma } from "~/db.server";

export type UserWithStockAndRoundActions = User & {
  stocks: Stock[];
  roundActions: RoundAction[];
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
      roundActions: true,
    },
  });
};
