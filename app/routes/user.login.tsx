import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { addUser, getUserByName } from "~/repository/user.sevrer";

export const loader: LoaderFunction = async () => {
  return { message: "Hello from the server!" };
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const username = formData.get("username");
  const password = formData.get("password");

  try {
    const alreadyUser = await getUserByName(username as string);
    if (!alreadyUser) {
      const newUser = await addUser(username as string, password as string);
      return redirect(`/user/${newUser.id}`);
    }

    if (alreadyUser.password === (password as string)) {
      return redirect(`/user/${alreadyUser.id}`);
    }
    return { error: "이미 가입된 사용자입니다." };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while creating the user." };
  }
};

type ActionData = {
  error?: string;
};

export default function User() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-4 text-gray-900">
          혼돈의 주식시장 가입
        </h1>
        <Form method="post" className="space-y-4">
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
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              비밀번호(4자리 편한숫자)
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Login
          </button>
        </Form>
        {actionData?.error && (
          <p className="mt-4 text-sm text-red-600 text-center">
            {actionData.error}
          </p>
        )}
      </div>
    </div>
  );
}
