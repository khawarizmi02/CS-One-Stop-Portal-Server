"use client";

import React, { useState, useEffect, forwardRef } from "react";
import { Button, ButtonProps } from "./ui/button";

type AuthButtonProps = {
  roles: string[];
  children: React.ReactNode;
} & ButtonProps;

const AuthButton = forwardRef<HTMLButtonElement, AuthButtonProps>(
  ({ roles, children, ...props }, ref) => {
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
      async function fetchRole() {
        const response = await fetch("/api/getRole");
        const data = await response.json();
        setRole(data.role ?? "user");
      }
      fetchRole();
    }, []);

    if (!role || !roles.includes(role)) return null;
    return (
      <Button ref={ref} {...props}>
        {children}
      </Button>
    );
  },
);

AuthButton.displayName = "AuthButton";

export default AuthButton;
