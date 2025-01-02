import { RoundInfo, Stock } from "@prisma/client";
import { LoaderFunction } from "@remix-run/node";
import { getCurrentRoundInfo } from "~/repository/round.server";
import { listStocks } from "~/repository/stocks.server";
import { useLoaderData } from "~/utils/useLoaderData";
import { useState, useEffect } from "react";

export const loader: LoaderFunction = async () => {
  const stocks = await listStocks();
  const currentRound = await getCurrentRoundInfo();

  return { stocks, round: currentRound };
};

interface MarketProps {
  stocks: Stock[];
  round: RoundInfo;
}

export default function MarketPage() {
  const { stocks, round } = useLoaderData<MarketProps>();
  const [remainingSeconds, setRemainingSeconds] = useState(
    Math.max(
      0,
      Math.floor(
        (new Date(round.startedAt!).getTime() + 5 * 60 * 1000 - Date.now()) /
          1000
      )
    )
  );

  useEffect(() => {
    // 1초마다 남은 시간 업데이트
    const timer = setInterval(() => {
      setRemainingSeconds(
        Math.max(
          0,
          Math.floor(
            (new Date(round.startedAt!).getTime() +
              5 * 60 * 1000 -
              Date.now()) /
              1000
          )
        )
      );
    }, 1000);

    // 컴포넌트가 언마운트될 때 타이머 정리
    return () => clearInterval(timer);
  }, [round.startedAt]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-4 text-gray-900">
          혼돈의 주식시장
        </h1>

        {/* Round Information */}
        <div className="mb-4 text-center">
          <h2 className="text-lg font-semibold">Round {round.roundNumber}</h2>
          <p>시작 시간: {new Date(round.startedAt!).toLocaleTimeString()}</p>
          남은 시간: {Math.floor(remainingSeconds / 60)}분{" "}
          {remainingSeconds % 60}초
        </div>

        {/* Stocks List */}
        <div className="grid grid-cols-2 gap-4">
          {stocks.map((stock) => (
            <div
              key={stock.id}
              className="p-4 border rounded-lg shadow-md bg-white flex flex-col items-center"
            >
              <div className="text-lg font-semibold">{stock.name}</div>
              <div className="text-gray-700 mt-2">{stock.price}원</div>
              <div className="text-gray-500 mt-1">{stock.quantity}개</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
