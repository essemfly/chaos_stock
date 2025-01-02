import { Stock } from "@prisma/client";
import { prisma } from "~/db.server";

export const listStocks = async (): Promise<Stock[]> => {
  return await prisma.stock.findMany();
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
