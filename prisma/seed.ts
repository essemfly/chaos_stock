import { PrismaClient, RoundAction, Stock } from "@prisma/client";
import { saveRoundAction } from "~/repository/round.server";

const prisma = new PrismaClient();

async function createStocks() {
  const stockData: Partial<Stock>[] = [
    { name: "삼전전자", price: 2000, quantity: 20 },
    { name: "엘에스생활건강", price: 2000, quantity: 20 },
    { name: "현소자동차", price: 2000, quantity: 20 },
    { name: "GA칼텍스", price: 2000, quantity: 20 },
    { name: "씨마트", price: 2000, quantity: 20 },
    { name: "포스크", price: 2000, quantity: 20 },
    { name: "커피톡", price: 2000, quantity: 20 },
    { name: "빅하트", price: 2000, quantity: 20 },
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

async function createRounds(numOfRounds: number) {
  for (let i = 0; i < numOfRounds; i++) {
    await prisma.roundInfo.create({
      data: {
        roundNumber: i + 1,
      },
    });
  }
}

async function createRoundActions() {
  const stocks = await prisma.stock.findMany();
  const roundInfos = await prisma.roundInfo.findMany();
  const roundActions: Partial<RoundAction>[] = [];

  const oddProb = 0.1;
  // 각 주식별 트렌드 상태를 저장
  const stockTrends = new Map<
    string,
    {
      direction: "up" | "down" | "normal";
      remainingRounds: number;
      magnitude: number;
    }
  >();

  for (const stock of stocks) {
    // 각 주식의 초기 트렌드 설정
    stockTrends.set(stock.id, {
      direction: "normal",
      remainingRounds: 0,
      magnitude: 0,
    });
  }

  for (const stock of stocks) {
    let price = stock.price;
    for (const roundInfo of roundInfos) {
      const trend = stockTrends.get(stock.id)!;
      let diff = 0;

      // 큰 변동이 진행 중인 경우
      if (trend.remainingRounds > 0) {
        diff = calculateTrendDiff(
          stock.price,
          trend.magnitude,
          trend.direction
        );
        trend.remainingRounds--;

        // 트렌드 종료 시 초기화
        if (trend.remainingRounds === 0) {
          trend.direction = "normal";
          trend.magnitude = 0;
        }
      }
      // 일반적인 경우
      else {
        // 5% 확률로 큰 변동 발생
        if (Math.random() < oddProb) {
          trend.direction = Math.random() < 0.5 ? "up" : "down";
          trend.remainingRounds = Math.floor(Math.random() * 2) + 2; // 2-3라운드
          trend.magnitude = Math.random() * 0.15 + 0.1; // 10-25% 변동
          diff = calculateTrendDiff(
            stock.price,
            trend.magnitude,
            trend.direction
          );
        }
        // 80% 확률로 일반적인 변동
        else {
          const normalVariation = Math.random() * 0.1; // 최대 10% 변동
          diff = Math.floor(
            stock.price * (normalVariation * (Math.random() < 0.5 ? 1 : -1))
          );
        }
      }

      roundActions.push({
        roundInfoId: roundInfo.id,
        stockId: stock.id,
        price: price + diff,
        diff,
      });
      price = price + diff;
    }
  }

  return roundActions;
}

async function main() {
    await createStocks();
    await createRounds(12);
  // 총 정보개수는 15* 8 = 120개
  const roundActions = await createRoundActions();
  for (const action of roundActions) {
    await saveRoundAction(
      action.stockId!,
      action.diff!,
      action.roundInfoId!,
      action.price!
    );
  }
}

await main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

function calculateTrendDiff(
  currentPrice: number,
  magnitude: number,
  direction: "up" | "down" | "normal"
): number {
  if (direction === "normal") {
    return 0;
  }

  const change = Math.floor(currentPrice * magnitude);
  return direction === "up" ? change : -change;
}
