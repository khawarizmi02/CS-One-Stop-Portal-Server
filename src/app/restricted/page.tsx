import React from "react";
import { NewUser } from "./NewUser";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Layout } from "@/styles/page-layout";

const Restricted = () => {
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
