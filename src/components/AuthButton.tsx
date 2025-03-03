"use client";

import React, { useState, useEffect } from "react";

import { Button, ButtonProps } from "./ui/button";

type AuthButtonProps = {
  roles: string[];
  children: React.ReactNode;
} & ButtonProps;

const AuthButton: React.FC<AuthButtonProps> = ({
  roles,
  children,
  ...props
}) => {
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
  return <Button {...props}>{children}</Button>;
};

export default AuthButton;
