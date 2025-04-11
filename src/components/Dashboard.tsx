"use client";
import React, { useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { updateUserRoleMetadata } from "@/lib/clerk";
import { useToast } from "@/hooks/use-toast";
import useUser from "@/hooks/use-user";
import { api } from "@/trpc/react";
import { useLocalStorage } from "usehooks-ts";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [userRole, setUserRole] = useLocalStorage("userRole", "");
  const { mutate } = api.user.updateUserRole.useMutation({
    onSuccess: () => {
      toast({
        title: "User role updated",
        description: "The user role has been updated successfully.",
      });
    },
  });

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await fetch("/api/getRole");
        const data = await response.json();
        setUserRole(data.role);
        console.log("User role:", data.role);
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };
    fetchUserRole();
  }, []);

  // if (userRole === "admin") router.push("/admin");

  return (
    <div>
      <h1>Dashboard</h1>
      <Button
        onClick={() => {
          const userId = "user_2vJ0DIHpFqKiBwjK4V0N1BlfPR7";
          mutate({ userId, role: "student" });
        }}
      >
        update user role
      </Button>
      <div>
        <UserButton />
      </div>
    </div>
  );
};

export default Dashboard;
