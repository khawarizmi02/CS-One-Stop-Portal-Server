import { SignUp } from "@clerk/nextjs";
import { env } from "@/env";

export default function Page() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <SignUp
        forceRedirectUrl={env.NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL}
      />
    </div>
  );
}
