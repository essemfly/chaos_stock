import { LoaderFunction } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { getCurrentRoundInfo } from "~/repository/round.server";
import { listStocks } from "~/repository/stocks.server";

export const loader: LoaderFunction = async () => {
  const stocks = await listStocks();
  const currentRound = await getCurrentRoundInfo();

  return { stocks, round: currentRound };
};

type ActionData = {
  error?: string;
};

export default function OrderPage() {
  const actionData = useActionData<ActionData>();
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
    const { user, error } = await response.json();
    if (error !== undefined) {
        alert(error);
        return;
    }

    console.log("NEW USER", user)
    alert(`환영합니다., ${user.name}!`);

    window.location.href = `/order/${user.id}`;
    setCountDown(30);
    setIsOrdering(true); // Start ordering phase
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
        <h1 className="text-2xl font-semibold text-center mb-4">주문하기</h1>
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
      </div>
    </div>
  );
}
