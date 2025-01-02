import { Stock } from "@prisma/client";
import { prisma } from "~/db.server";

export const listStocks = async (): Promise<Stock[]> => {
  return await prisma.stock.findMany();
};
