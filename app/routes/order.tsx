import { RoundInfo, Stock } from "@prisma/client";
import { LoaderFunction } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { getCurrentRoundInfo } from "~/repository/round.server";
import { listStocks } from "~/repository/stocks.server";
import { useLoaderData } from "~/utils/useLoaderData";

export const loader: LoaderFunction = async () => {
  const stocks = await listStocks();
  const currentRound = await getCurrentRoundInfo();

  return { stocks, round: currentRound };
};

interface OrderProps {
  stocks: Stock[];
  round: RoundInfo;
}

type ActionData = {
  error?: string;
};

export default function OrderPage() {
  const actionData = useActionData<ActionData>();
  const { stocks, round } = useLoaderData<OrderProps>();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [countDown, setCountDown] = useState(30);
  const [isOrdering, setIsOrdering] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    const response = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Login failed");
    }
    const newUser = await response.json();
    alert(`환영합니다., ${newUser.name}!`);

    setCountDown(30);
    setIsOrdering(true); // Start ordering phase
  };

  const handleOrder = async () => {
    alert("Order submitted!");
  };

  useEffect(() => {
    if (isOrdering) {
      if (countDown > 0) {
        const timer = setTimeout(() => {
          setCountDown((prev) => prev - 1);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        setIsOrdering(false); // Automatically stop ordering after countdown reaches 0
      }
    }
  }, [isOrdering, countDown]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        {!isOrdering ? (
          <>
            <h1 className="text-2xl font-semibold text-center mb-4">
              User Login
            </h1>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  이름
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleLogin}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Login
              </button>
            </div>

            {actionData?.error && (
              <p className="mt-4 text-sm text-red-600 text-center">
                {actionData.error}
              </p>
            )}
          </>
        ) : (
          <>
            <div>
              <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                  <h1 className="text-2xl font-semibold text-center mb-4 text-gray-900">
                    혼돈의 주식시장
                  </h1>

                  {/* Round Information */}
                  <div className="mb-4 text-center">
                    <h2 className="text-lg font-semibold">
                      Round {round.roundNumber}
                    </h2>
                    <p>
                      시작 시간:{" "}
                      {new Date(round.startedAt!).toLocaleTimeString()}
                    </p>
                    <p>
                      남은 시간:{" "}
                      {Math.max(
                        0,
                        Math.floor(
                          (new Date(round.startedAt!).getTime() +
                            5 * 60 * 1000 -
                            Date.now()) /
                            1000
                        )
                      )
                        .toString()
                        .padStart(2, "0")}
                      초
                    </p>
                  </div>

                  {/* Stocks List */}
                  <div>
                    {stocks.map((stock) => (
                      <div
                        key={stock.id}
                        className="flex items-center justify-between"
                      >
                        <div>{stock.name}</div>
                        <div>{stock.price}원</div>
                        <div>{stock.quantity}개</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-center mb-4">
                Time Remaining: {countDown}s
              </div>
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
                Submit Order
              </button>
            </div>
            {countDown === 0 && (
              <p className="mt-4 text-center text-red-600">
                Time is up! Orders are now closed.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
