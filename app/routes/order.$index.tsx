import { RoundInfo, Stock } from "@prisma/client";
import { ActionFunction, LoaderFunction } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { getCurrentRoundInfo } from "~/repository/round.server";
import { listStocks } from "~/repository/stocks.server";
import {
  getUserDetail,
  UserWithStockAndRoundActions,
} from "~/repository/user.server";
import { useLoaderData } from "~/utils/useLoaderData";

export const action: ActionFunction = async ({ request }) => {};

export const loader: LoaderFunction = async ({ params }) => {
  const { index } = params;
  if (!index) {
    return { error: "User not found" };
  }
  const user = await getUserDetail(index as string);
  if (!user) {
    return { error: "User not found" };
  }
  const stocks = await listStocks();
  const currentRound = await getCurrentRoundInfo();

  return { user, stocks, round: currentRound };
};

interface OrderProps {
  user: UserWithStockAndRoundActions;
  stocks: Stock[];
  round: RoundInfo;
}

type ActionData = {
  error?: string;
};

export default function OrderPage() {
  const actionData = useActionData<ActionData>();
  const { user, stocks, round } = useLoaderData<OrderProps>();
  const [countDown, setCountDown] = useState(31);
  const [remainingSeconds, setRemainingSeconds] = useState(
    Math.max(
      0,
      Math.floor(
        (new Date(round.startedAt!).getTime() + 5 * 60 * 1000 - Date.now()) /
          1000
      )
    )
  );

  const handleOrder = async () => {
    alert("Order submitted!");
  };

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
      setCountDown((prev) => prev - 1);
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
          라운드 남은 시간: {Math.floor(remainingSeconds / 60)}분{" "}
          {remainingSeconds % 60}초
        </div>

        {/* Stocks List */}
        <div className="grid grid-cols-2 gap-4">
          {stocks.map((stock) => {
            const priceDifference = stock.prevPrice
              ? stock.price - stock.prevPrice
              : 0;
            const priceChange =
              priceDifference > 0
                ? "상승"
                : priceDifference < 0
                ? "하락"
                : "변동 없음";
            const priceChangeColor =
              priceDifference > 0
                ? "text-green-500"
                : priceDifference < 0
                ? "text-red-500"
                : "text-gray-500";

            return (
              <div
                key={stock.id}
                className="p-4 border rounded-lg shadow-md bg-white flex flex-col items-center"
              >
                <div className="text-lg font-semibold">{stock.name}</div>
                <div className="text-gray-700 mt-2 flex items-center">
                  {stock.price}원
                  {stock.prevPrice && (
                    <span className={`ml-2 ${priceChangeColor}`}>
                      ({priceDifference > 0 ? "+" : ""}
                      {priceDifference}원 {priceChange})
                    </span>
                  )}
                </div>
                <div className="text-gray-500 mt-1">{stock.quantity}개</div>
              </div>
            );
          })}
          <div className="text-center mb-4">거래 남은시간: {countDown}s</div>
          <div>
            <label
              htmlFor="order"
              className="block text-sm font-medium text-gray-700"
            >
              Order
            </label>
            <input
              type="text"
              id="order"
              name="order"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            onClick={() => handleOrder()}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            주문 넣기
          </button>
        </div>
        {countDown === 0 && (
          <p className="mt-4 text-center text-red-600">
            시간이 지났습니다. 다음 순서를 이용하세요.
          </p>
        )}
      </div>
    </div>
  );
}
