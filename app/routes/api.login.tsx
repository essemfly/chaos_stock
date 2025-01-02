import { ActionFunction } from "@remix-run/node";
import { getUserByName } from "~/repository/user.server";

export const action: ActionFunction = async ({ request }) => {
  const { username, password } = await request.json();

  try {
    const alreadyUser = await getUserByName(username as string);
    if (!alreadyUser) {
      return { error: "가입되지 않은 사용자입니다." };
    }
    if (alreadyUser.password === (password as string)) {
      return { user: alreadyUser };
    }
    return { error: "비밀번호가 일치하지 않습니다." };
  } catch (error) {
    console.error(error);
    return { error: "An error occurred while creating the user." };
  }
};
