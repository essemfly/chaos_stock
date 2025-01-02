import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  getUserDetail,
  UserWithStockAndRoundActions,
} from "~/repository/user.server";

export const loader: LoaderFunction = async ({ params }) => {
  const { index: userId } = params;
  if (!userId) {
    return { status: 404, message: "User not found" };
  }
  console.log("userId", userId);
  const user = await getUserDetail(userId as string);

  console.log("user", user?.name);
  return { user };
};

interface UserPageProps {
  user: UserWithStockAndRoundActions;
}

export default function UserPage() {
  const { user } = useLoaderData<UserPageProps>();
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-6">
      {/* User Info Section */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg mb-6">
        <h1 className="text-2xl font-semibold text-center mb-4">
          User Profile
        </h1>
        <p className="text-gray-700">
          <strong>Name:</strong> {user.name}
        </p>
        <p className="text-gray-700">
          <strong>Balance:</strong> {user.balance} 원
        </p>
      </div>

      {/* User Stocks Section */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Stocks</h2>
        <div className="grid grid-cols-3 gap-4">
          {user.stocks.map((stock) => (
            <div
              key={stock.id}
              className="p-4 border rounded-lg shadow-sm bg-gray-50 flex flex-col items-center"
            >
              <div className="font-medium">{stock.name}</div>
              <div className="text-gray-600 mt-2">{stock.price}원</div>
              <div className="text-gray-500 mt-1">{stock.quantity}개</div>
            </div>
          ))}
        </div>
      </div>

      {/* User Round Actions Section */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg">
        <h2 className="text-xl font-semibold mb-4">Round Actions</h2>
        <ul className="space-y-4">
          {user.roundActions.map((action, index) => (
            <li
              key={index}
              className="p-4 border rounded-lg shadow-sm bg-gray-50 flex justify-between items-center"
            >
              <p className="text-gray-500">{action.roundInfo.roundNumber}라운드</p>
              <div>
                <p className="font-medium">Stock: {action.stock.name}</p>
              </div>
              <p className="text-gray-600">Price: {action.price}원</p>
              <p className="text-gray-600">
                {action.diff}원{" "}
                {action.diff > 0 ? "상승" : action.diff < 0 ? "하락" : ""}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
