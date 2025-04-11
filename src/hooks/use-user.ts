import { auth } from "@clerk/nextjs/server";

const UseUser = async () => {
  const { userId, sessionId, getToken } = await auth();
  const role = await fetch("/api/getRole");

  return {
    userId,
    role,
    sessionId,
    getToken,
  };
};

export default UseUser;
