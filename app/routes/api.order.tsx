import { Side, Stock } from "@prisma/client";
import { ActionFunction } from "@remix-run/node";
import { addOrder } from "~/repository/order.server";
import { getStockById, listStocks, updateStockQuantity } from "~/repository/stocks.server";
import {
  getUserById,
  getUserDetail,
  updateUserBalance,
  updateUserStock,
} from "~/repository/user.server";

export const action: ActionFunction = async ({ request }) => {
  const data = await request.json();
  const user = await getUserById(data.userId);
  if (!user) {
    return { error: "사용자 정보를 찾을 수 없습니다." };
  }

  try {
    if (data.type === "buy") {
      // 구매 주문 데이터 구조
      // {
      //   type: 'buy',
      //   orders: [{ stockId: string, quantity: number, price: number }],
      //   totalAmount: number,
      //   userId: string
      // }

      if (data.totalAmount > data.userBalance) {
        return { error: "잔액이 부족합니다." };
      }

      for (const order of data.orders) {

        const curStock = await getStockById(order.stockId);
        if (!curStock) {
          return { error: "주식 정보를 찾을 수 없습니다." };
        }
        if (curStock.quantity < order.quantity) {
          return { error: "주식 수량이 부족합니다." };
        }

        user.balance -= order.price * order.quantity;
        await addOrder(
          data.userId,
          order.stockId,
          order.quantity,
          order.price,
          Side.BUY
        );
        await updateUserStock(Side.BUY, data.userId, order.stockId, order.quantity);
        await updateUserBalance(data.userId, user.balance);
        await updateStockQuantity(order.stockId, Side.BUY, order.quantity);
      }

      const newUser = await getUserDetail(data.userId);
      const newStocks = await listStocks();

      return {
        success: true,
        message: "구매 주문이 완료되었습니다.",
        user: newUser,
        stocks: newStocks,
      };
    } else if (data.type === "sell") {
      // 판매 주문 데이터 구조
      // {
      //   type: 'sell',
      //   orders: [{ stockId: string, quantity: number, price: number }],
      //   totalAmount: number,
      //   userId: string
      // }

      console.log("userStock", data.userStocks)
      // 보유 수량 확인
      for (const order of data.orders) {
        const userStock = data.userStocks.find(
          (stock: Stock) => stock.id === order.stockId
        );
        console.log("ORDER", order);
        console.log("userSTock", userStock);
        if (!userStock || userStock.quantity < order.quantity) {
          return { error: "보유 수량이 부족합니다." };
        }
      }

      console.log("HOIT")
      for (const order of data.orders) {
        user.balance += order.price * order.quantity;
        await addOrder(
          data.userId,
          order.stockId,
          order.quantity,
          order.price,
          Side.SELL
        );
        await updateUserStock(Side.SELL, data.userId, order.stockId, order.quantity);
        await updateUserBalance(data.userId, user.balance);
        await updateStockQuantity(order.stockId, Side.SELL, order.quantity);
      }

      const newUser = await getUserDetail(data.userId);
      const newStocks = await listStocks();

      return {
        success: true,
        message: "판매 주문이 완료되었습니다.",
        user: newUser,
        stocks: newStocks,
      };
    }

    return { error: "잘못된 주문 타입입니다." };
  } catch (error) {
    return { error: "주문 처리 중 오류가 발생했습니다." };
  }
};
