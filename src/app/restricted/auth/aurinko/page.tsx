"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { getAurinkoAuthUrl } from "@/lib/aurinko";
import { api } from "@/trpc/react";

const AurinkoConnect = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { data: EmailProvider } = api.user.getUserEmailProvider.useQuery();

  const [isConnecting, setIsConnecting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (user && !isConnecting && EmailProvider) {
      handleAurinkoAuth();
    }
  }, [user, isConnecting, EmailProvider]);

  async function handleAurinkoAuth() {
    if (!EmailProvider) {
      setError("Email provider not found. Please check your account settings.");
      return;
    }

    setIsConnecting(true);

    try {
      if (EmailProvider === "Google" || EmailProvider === "Office365") {
        const aurinkoAuthUrl = await getAurinkoAuthUrl(EmailProvider);
        console.log("authUrl", aurinkoAuthUrl);
        window.location.href = aurinkoAuthUrl;
      } else {
        setError(
          "Invalid email provider. Supported providers are Google and Office365.",
        );
        setIsConnecting(false);
        return;
      }
    } catch (error) {
      setError("Failed to connect to Aurinko. Please try again.");
      console.error("Aurinko connection error:", error);
      setIsConnecting(false);
      return;
    }
  }

  const retryConnection = () => {
    setError(null);
    handleAurinkoAuth();
  };

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6 text-center">
          <div>
            <h1 className="text-2xl font-bold text-red-600">
              Connection Failed
            </h1>
            <p className="text-muted-foreground mt-2">{error}</p>
          </div>
          <button
            onClick={retryConnection}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md space-y-6 text-center">
        <div>
          <h1 className="text-2xl font-bold">Connecting Your Account</h1>
          <p className="text-muted-foreground mt-2">
            Redirecting you to {EmailProvider} Provider to connect your email
            and calendar...
          </p>
        </div>
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
};

export default AurinkoConnect;
