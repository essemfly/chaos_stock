import { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
  return { message: "Hello from the server!" };
};

// 로그인해야 들어갈수있음
export default function User({ message }: { message: string }) {
  console.log("message", message);
  return <>User page with balance and records</>;
}
