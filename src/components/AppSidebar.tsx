"use client";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@clerk/nextjs";
import usePageName from "@/hooks/use-pageName";
import { buttonVariants } from "@/components/ui/button";
import {
  Home,
  MessageSquare,
  Users,
  Mail,
  FileText,
  LogOut,
  Bell,
  Menu,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "usehooks-ts";

interface AppSidebarProps {
  className?: string;
  isCollapsed?: boolean;
}

export function AppSidebar({
  className,
  isCollapsed = false,
}: AppSidebarProps) {
  const sidebarItems = [
    { name: "Home", icon: <Home className="mr-2 h-4 w-4" />, href: "/" },
    {
      name: "Announcement",
      icon: <Bell className="mr-2 h-4 w-4" />,
      href: "/announcement",
    },
    {
      name: "Forum",
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
      href: "/forum",
    },
    { name: "Group", icon: <Users className="mr-2 h-4 w-4" />, href: "/group" },
    { name: "Email", icon: <Mail className="mr-2 h-4 w-4" />, href: "/email" },
    // {
    //   name: "File",
    //   icon: <FileText className="mr-2 h-4 w-4" />,
    //   href: "/file",
    // },
  ];

  const { pageName } = usePageName();
  const [userRole] = useLocalStorage("userRole", "");

  // if (userRole === "admin") return null;

  if (pageName === "privacy" || pageName === "term-of-service") return null;

  return (
    <Sidebar
      collapsible="icon"
      className={cn(
        "min-h-screen transition-all duration-300",
        isCollapsed ? "w-14" : "w-60",
        className,
      )}
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarTrigger key="sidebar-trigger" className="pl-1" />
          </SidebarMenu>
          <SidebarMenu>
            {sidebarItems.map((item) => {
              const isActive = item.href === `/${pageName}`;
              return isCollapsed ? (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <SidebarMenuItem>
                      <Link href={item.href}>
                        <SidebarMenuButton
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon" }),
                            "h-9 w-9",
                            isActive && "bg-gray-200 dark:bg-gray-700", // Active class
                          )}
                        >
                          {item.icon}
                          <span className="sr-only">{item.name}</span>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.name}</TooltipContent>
                </Tooltip>
              ) : (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      className={cn(
                        isActive && "bg-gray-200 dark:bg-gray-700", // Active class
                      )}
                    >
                      {item.icon}
                      {item.name}
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SignOutButton key="sidebar-logout">
              {isCollapsed ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon" }),
                        "h-9 w-9 text-red-600 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20",
                      )}
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="sr-only">Log Out</span>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent side="right">Log Out</TooltipContent>
                </Tooltip>
              ) : (
                <SidebarMenuButton className="text-red-600 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </SidebarMenuButton>
              )}
            </SignOutButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
