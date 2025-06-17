"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { getAurinkoAuthUrl } from "@/lib/aurinko";

const File = () => {
  return (
    <div>
      <Button
        onClick={async () => {
          const authUrl = await getAurinkoAuthUrl("Office365");
          console.log("authUrl", authUrl);
          window.location.href = authUrl;
        }}
        variant="default"
      >
        Link Account
      </Button>
    </div>
  );
};

export default File;
