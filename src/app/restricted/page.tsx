"use client";
import React from "react";
import { NewUser } from "./NewUser";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Layout } from "@/styles/page-layout";
import { useUser } from "@clerk/nextjs";
import { api } from "@/trpc/react";
import Loading from "@/components/Loading";

const Restricted = () => {
  const { isLoaded, user } = useUser();

  const { data: userInfo } = api.user.getUserInfo.useQuery(undefined, {
    enabled: isLoaded && !!user,
  });

  if (userInfo?.role === "admin") window.location.href = "/admin";
  if (userInfo?.role === "student" || userInfo?.role === "lecturer")
    window.location.href = "/";

  if (!isLoaded || !userInfo) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen min-w-full flex-col items-center justify-center">
      <div className={`${Layout.mwidth} flex w-full flex-col items-center`}>
        <NewUser />
        <SignOutButton>
          <Button variant="destructive" className="mt-10 px-5 py-5">
            Logout
          </Button>
        </SignOutButton>
      </div>
    </div>
  );
};

export default Restricted;
