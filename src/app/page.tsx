"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  useAuth,
  useUser,
  UserButton,
  SignInButton,
  SignedOut,
  SignOutButton,
} from "@clerk/nextjs";
import { Home, Bell, MessageSquare, Users, Mail, Calendar } from "lucide-react";
import { SignedIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Layout } from "@/styles/page-layout";

import HomeBg from "../../public/Home-BG.png";
import Logo from "../../public/logo.svg";
import { api } from "@/trpc/react";

const sidebarItems = [
  {
    name: "Announcement",
    icon: <Bell className="h-6 w-6" />,
    href: "/announcement",
  },
  {
    name: "Forum",
    icon: <MessageSquare className="h-6 w-6" />,
    href: "/forum",
  },
  { name: "Event", icon: <Calendar className="h-6 w-6" />, href: "/event" },
  { name: "Group", icon: <Users className="h-6 w-6" />, href: "/group" },
  { name: "Email", icon: <Mail className="h-6 w-6" />, href: "/email" },
];

const HomePage = () => {
  const { isSignedIn } = useUser();
  const [role, setRole] = React.useState<string | null>(null);
  const { data } = api.user.getUserInfo.useQuery(undefined, {
    enabled: isSignedIn === true,
  });
  const router = useRouter();

  useEffect(() => {
    async function fetchRole() {
      if (!isSignedIn) return;
      const response = await fetch("/api/getRole");
      const data = await response.json();
      setRole(data.role ?? "");
      if (data.role === "admin") {
        router.push("/admin");
      }

      if (data.role === "new") {
        router.push("/restricted");
      }
    }
    if (!isSignedIn) return;
    fetchRole();
  }, [router, isSignedIn]);

  if (!isSignedIn) {
    return (
      <div
        className="flex min-h-screen min-w-full flex-col items-center justify-center"
        style={
          !isSignedIn
            ? {
                backgroundImage: `url(${HomeBg.src})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: "rgba(0, 0, 20, 0.7)",
                backgroundBlendMode: "overlay",
              }
            : undefined
        }
      >
        <div className={`${Layout.mwidth} flex w-full flex-col items-center`}>
          <div className="flex flex-row items-center justify-center py-8">
            <Image src={Logo} alt="logo" />
            <div className="ml-3">
              <h1 className="text-3xl font-bold text-slate-100">
                CS ONE STOP PORTAL
              </h1>
              <h3 className="text-slate-100 uppercase">
                PORTAL FOR COMPUTER SCIENCE COMMUNITY
              </h3>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <SignInButton>
              <Button className="mt-10 px-5 py-5">Login Now</Button>
            </SignInButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen min-w-full flex-col items-center justify-center"
      style={
        !isSignedIn
          ? {
              backgroundImage: `url(${HomeBg.src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundColor: "rgba(0, 0, 20, 0.7)",
              backgroundBlendMode: "overlay",
            }
          : undefined
      }
    >
      <div className={`${Layout.mwidth} flex w-full flex-col items-center`}>
        <div className="flex flex-row items-center justify-center py-8">
          <Image src={Logo} alt="logo" />
          <div className="ml-3">
            <h1 className="text-3xl font-bold text-slate-800">
              CS ONE STOP PORTAL
            </h1>
            <h3 className="text-slate-800 uppercase">
              PORTAL FOR COMPUTER SCIENCE COMMUNITY
            </h3>
          </div>
        </div>
        <div className="w-full max-w-4xl">
          {/* User greeting and tasks */}
          <div className="bg-opacity-90 mb-6 flex items-center justify-between rounded-lg bg-white p-5 shadow-lg">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Hello, {data?.firstName} {data?.lastName}!
              </h2>
              <p className="text-gray-800">Hope you have a good day today!</p>
            </div>
            {/* <div className="min-w-32 rounded-md border border-orange-200 bg-white p-4 text-center shadow-sm">
              <h3 className="text-3xl font-bold text-gray-800">1</h3>
              <p className="text-sm font-medium text-orange-600">
                Tasks Pending
              </p>
            </div> */}
          </div>

          {/* Apps section */}
          <div className="bg-opacity-95 mt-8 overflow-hidden rounded-lg bg-white shadow-xl">
            <div className="bg-blue-600 p-4">
              <h3 className="text-center text-xl font-semibold text-white">
                Apps
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6 p-6 sm:grid-cols-2 md:grid-cols-4">
              {sidebarItems.map((item) => (
                <Link
                  href={item.href}
                  key={item.name}
                  className="flex flex-col items-center justify-center rounded-lg border border-gray-100 bg-white p-6 shadow-md transition-all hover:bg-gray-50 hover:shadow-lg"
                >
                  <div
                    className={`mb-3 rounded-full p-4 ${
                      item.name === "Home"
                        ? "bg-blue-100 text-blue-600"
                        : item.name === "Announcement"
                          ? "bg-red-100 text-red-600"
                          : item.name === "Forum"
                            ? "bg-indigo-100 text-indigo-600"
                            : item.name === "Group"
                              ? "bg-green-100 text-green-600"
                              : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span className="text-base font-medium text-gray-800">
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
