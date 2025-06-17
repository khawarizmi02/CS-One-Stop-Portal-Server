import { SignIn } from "@clerk/nextjs";
import { env } from "@/env";

export default function Page() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <SignIn
        forceRedirectUrl={env.NEXT_PUBLIC_CLERK_SIGN_IN_FORCE_REDIRECT_URL}
      />
    </div>
  );
}
