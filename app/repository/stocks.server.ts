import { Side, Stock } from "@prisma/client";
import { prisma } from "~/db.server";

export const listStocks = async (): Promise<Stock[]> => {
  return await prisma.stock.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

export const updateStock = async (
  id: string,
  price: number,
  prevPrice: number
): Promise<Stock> => {
  return await prisma.stock.update({
    where: {
      id: id,
    },
    data: {
      price: price,
      prevPrice: prevPrice,
    },
  });
};

export const updateStockQuantity = async (
  id: string,
  side: Side,
  quantity: number
): Promise<Stock> => {
  if (side === Side.BUY) {
    return await prisma.stock.update({
      where: {
        id: id,
      },
      data: {
        quantity: {
          decrement: quantity,
        },
      },
    });
  }

  return await prisma.stock.update({
    where: {
      id: id,
    },
    data: {
      quantity: {
        increment: quantity,
      },
    },
  });
};
