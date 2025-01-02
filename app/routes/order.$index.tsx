import { RoundInfo, Stock } from "@prisma/client";
import { LoaderFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import { getCurrentRoundInfo } from "~/repository/round.server";
import { listStocks } from "~/repository/stocks.server";
import {
  getUserDetail,
  UserWithStockAndRoundActions,
} from "~/repository/user.server";
import { useLoaderData } from "~/utils/useLoaderData";

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

interface OrderItem {
  stockId: string;
  stockName: string;
  price: number;
  quantity: number;
}

export default function OrderPage() {
  const {
    user: initialUser,
    stocks: initialStocks,
    round,
  } = useLoaderData<OrderProps>();
  const [user, setUser] = useState<UserWithStockAndRoundActions>(initialUser);
  const [stocks, setStocks] = useState<Stock[]>(initialStocks);
  const [countDown, setCountDown] = useState(31);
  const [activeTab, setActiveTab] = useState<"buy" | "sell">("buy");
  const [orderList, setOrderList] = useState<OrderItem[]>([]);
  const [sellOrderList, setSellOrderList] = useState<OrderItem[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(
    Math.max(
      0,
      Math.floor(
        (new Date(round.startedAt!).getTime() + 5 * 60 * 1000 - Date.now()) /
          1000
      )
    )
  );

  const handleStockClick = (stock: Stock) => {
    const existingOrderIndex = orderList.findIndex(
      (order) => order.stockId === stock.id
    );

    if (existingOrderIndex !== -1) {
      // If stock already exists in order list, increment quantity
      const updatedOrders = [...orderList];
      updatedOrders[existingOrderIndex].quantity += 1;
      setOrderList(updatedOrders);
    } else {
      // If stock doesn't exist, add new order
      setOrderList([
        ...orderList,
        {
          stockId: stock.id,
          stockName: stock.name,
          price: stock.price,
          quantity: 1,
        },
      ]);
    }
  };

  const updateOrderQuantity = (stockId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setOrderList(orderList.filter((order) => order.stockId !== stockId));
    } else {
      setOrderList(
        orderList.map((order) =>
          order.stockId === stockId
            ? { ...order, quantity: newQuantity }
            : order
        )
      );
    }
  };

  const handleSellStockClick = (stock: Stock) => {
    const existingOrderIndex = sellOrderList.findIndex(
      (order) => order.stockId === stock.id
    );

    if (existingOrderIndex !== -1) {
      const updatedOrders = [...sellOrderList];
      updatedOrders[existingOrderIndex].quantity += 1;
      setSellOrderList(updatedOrders);
    } else {
      // stock.currentPrice를 사용하거나 관련 주식의 현재 가격을 가져와야 함
      const currentStock = stocks.find((s) => s.id === stock.id);
      setSellOrderList([
        ...sellOrderList,
        {
          stockId: stock.id,
          stockName: stock.name,
          price: currentStock?.price || 0,
          quantity: 1,
        },
      ]);
    }
  };

  const updateSellOrderQuantity = (stockId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setSellOrderList(
        sellOrderList.filter((order) => order.stockId !== stockId)
      );
    } else {
      setSellOrderList(
        sellOrderList.map((order) =>
          order.stockId === stockId
            ? { ...order, quantity: newQuantity }
            : order
        )
      );
    }
  };

  const getTotalAmount = () => {
    return orderList.reduce(
      (sum, order) => sum + order.price * order.quantity,
      0
    );
  };

  const getTotalSellAmount = () => {
    return sellOrderList.reduce(
      (sum, order) => sum + order.price * order.quantity,
      0
    );
  };

  const handleOrder = async () => {
    try {
      const orderData = {
        type: activeTab,
        userId: user.id,
        userBalance: user.balance,
        userStocks: user.userStocks,
        orders:
          activeTab === "buy"
            ? orderList.map((order) => ({
                stockId: order.stockId,
                quantity: order.quantity,
                price: order.price,
              }))
            : sellOrderList.map((order) => ({
                stockId: order.stockId,
                quantity: order.quantity,
                price: order.price,
              })),
        totalAmount:
          activeTab === "buy" ? getTotalAmount() : getTotalSellAmount(),
      };

      const response = await fetch(`/api/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (result.error) {
        alert(result.error);
        return;
      }

      alert(result.message);
      setOrderList([]);
      setSellOrderList([]);

      setUser(result.user);
      setStocks(result.stocks);

      // TODO: 페이지 새로고침 또는 데이터 리프레시 로직 추가
    } catch (error) {
      alert("주문 처리 중 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
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

    return () => clearInterval(timer);
  }, [round.startedAt]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-4 text-gray-900">
          혼돈의 주식시장
        </h1>

        {/* User Balance */}
        <div className="mb-4 text-right">
          <span className="font-semibold">보유 금액: </span>
          <span className="text-blue-600">
            {user.balance.toLocaleString()}원
          </span>
        </div>

        {/* Round Information */}
        <div className="mb-4 text-center">
          <h2 className="text-lg font-semibold">Round {round.roundNumber}</h2>
          <p>시작 시간: {new Date(round.startedAt!).toLocaleTimeString()}</p>
          <p>
            라운드 남은 시간: {Math.floor(remainingSeconds / 60)}분{" "}
            {remainingSeconds % 60}초
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            onClick={() => setActiveTab("buy")}
            className={`py-2 px-4 rounded-md text-center font-medium ${
              activeTab === "buy"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            구매
          </button>
          <button
            onClick={() => setActiveTab("sell")}
            className={`py-2 px-4 rounded-md text-center font-medium ${
              activeTab === "sell"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            판매
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === "buy" && (
          <>
            {/* Stocks List */}
            <div className="grid grid-cols-2 gap-4 mb-4">
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
                    className="p-4 border rounded-lg shadow-md bg-white flex flex-col items-center cursor-pointer hover:bg-gray-50"
                    onClick={() => handleStockClick(stock)}
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
            </div>

            <div className="text-center mb-4">거래 남은시간: {countDown}s</div>

            {/* Order List */}
            {orderList.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">주문 목록</h3>
                <div className="space-y-2">
                  {orderList.map((order) => (
                    <div
                      key={order.stockId}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span className="font-medium">{order.stockName}</span>
                      <span className="font-medium">
                        {order.price * order.quantity}원
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateOrderQuantity(
                              order.stockId,
                              order.quantity - 1
                            )
                          }
                          className="px-2 py-1 bg-gray-200 rounded"
                        >
                          -
                        </button>
                        <span>{order.quantity}개</span>
                        <button
                          onClick={() =>
                            updateOrderQuantity(
                              order.stockId,
                              order.quantity + 1
                            )
                          }
                          className="px-2 py-1 bg-gray-200 rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total Amount */}
            {orderList.length > 0 && (
              <div className="mb-4 text-right">
                <span className="font-semibold">총 금액: </span>
                <span className="text-green-600">
                  {getTotalAmount().toLocaleString()}원
                </span>
              </div>
            )}
          </>
        )}

        {activeTab === "sell" && (
          <>
            {/* User's Stocks List */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {user.userStocks.map((userStock) => {
                return (
                  <div
                    key={userStock.id}
                    className="p-4 border rounded-lg shadow-md bg-white flex flex-col items-center cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSellStockClick(userStock.stock)}
                  >
                    <div className="text-lg font-semibold">{userStock.stock.name}</div>
                    <div className="text-gray-500 mt-1">
                      보유: {userStock.quantity}개
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mb-4">거래 남은시간: {countDown}s</div>

            {/* Sell Order List */}
            {sellOrderList.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">판매 목록</h3>
                <div className="space-y-2">
                  {sellOrderList.map((order) => (
                    <div
                      key={order.stockId}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span className="font-medium">{order.stockName}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateSellOrderQuantity(
                              order.stockId,
                              order.quantity - 1
                            )
                          }
                          className="px-2 py-1 bg-gray-200 rounded"
                        >
                          -
                        </button>
                        <span>{order.quantity}개</span>
                        <button
                          onClick={() =>
                            updateSellOrderQuantity(
                              order.stockId,
                              order.quantity + 1
                            )
                          }
                          className="px-2 py-1 bg-gray-200 rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total Sell Amount */}
            {sellOrderList.length > 0 && (
              <div className="mb-4 text-right">
                <span className="font-semibold">총 판매금액: </span>
                <span className="text-green-600">
                  {getTotalSellAmount().toLocaleString()}원
                </span>
              </div>
            )}
          </>
        )}

        {/* User Balance */}
        <div className="mb-4 text-right">
          <span className="font-semibold">보유 금액: </span>
          <span className="text-blue-600">
            {user.balance.toLocaleString()}원
          </span>
        </div>

        <button
          onClick={handleOrder}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          {activeTab === "buy" ? "구매" : "판매"} 주문 넣기
        </button>

        {countDown === 0 && (
          <p className="mt-4 text-center text-red-600">
            시간이 지났습니다. 다음 순서를 이용하세요.
          </p>
        )}
      </div>
    </div>
  );
}
