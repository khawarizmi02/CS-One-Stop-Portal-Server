"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function CreateForumButton() {
  const [role, setRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchRole() {
      const response = await fetch("/api/getRole");
      const data = await response.json();
      setRole(data.role ?? "user");
    }
    fetchRole();
  }, []);

  if (role !== "admin" && role !== "lecturer") {
    return null;
  }

  return (
    <Button
      onClick={() => {
        router.push("/forum/create");
      }}
    >
      Create Forum
    </Button>
  );
}
