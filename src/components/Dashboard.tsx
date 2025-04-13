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
  const { data: userInfo } = api.user.getUserInfo.useQuery();
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

  useEffect(() => {
    if (userInfo) {
      setUserRole(userInfo.role);
    }
  }, [userInfo, setUserRole]);

  // if (userRole === "admin") router.push("/admin");

  return (
    <div>
      <h3>Hello {userInfo?.firstName}, hope you have a good day.</h3>
    </div>
  );
};

export default Dashboard;
