"use client";
import React from "react";

import { Button } from "@/components/ui/button";
import { getAurinkoAuthUrl } from "@/lib/aurinko";

const Email = () => {
  return (
    <div>
      <div>Email</div>
      <Button
        onClick={async () => {
          const authUrl = await getAurinkoAuthUrl("Google");
          window.location.href = authUrl;
        }}
        variant="default"
      >
        LinkWithAurinko
      </Button>
    </div>
  );
};

export default Email;
