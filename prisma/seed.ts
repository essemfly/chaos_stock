import { PrismaClient, Stock } from "@prisma/client";

const prisma = new PrismaClient();

async function createStocks() {
  const stockData: Partial<Stock>[] = [
    { name: "삼전전자", price: 50, quantity: 30 },
    { name: "엘에스생활건강", price: 50, quantity: 30 },
    { name: "현소자동차", price: 50, quantity: 30 },
    { name: "GA칼텍스", price: 50, quantity: 30 },
    { name: "씨마트", price: 50, quantity: 30 },
    { name: "포스크", price: 50, quantity: 30 },
    { name: "커피톡", price: 50, quantity: 30 },
    { name: "빅하트", price: 50, quantity: 30 },
  ];

  for (const stock of stockData) {
    await prisma.stock.create({
      data: {
        name: stock.name!,
        price: stock.price!,
        quantity: stock.quantity,
      },
    });
  }
}
async function main() {
  await createStocks();
}

await main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
