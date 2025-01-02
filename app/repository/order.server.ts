import { Side } from "@prisma/client";
import { prisma } from "~/db.server";

export const listOrders = async () => {
  return await prisma.order.findMany();
};

export const addOrder = async (
  userId: string,
  stockId: string,
  quantity: number,
  price: number,
  side: Side
) => {
  return await prisma.order.create({
    data: {
      userId: userId,
      stockId: stockId,
      quantity: quantity,
      price: price,
      side,
    },
  });
};
