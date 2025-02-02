import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@clerk/nextjs";
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

interface AppSidebarProps {
  className?: string;
}

export function AppSidebar({ className }: AppSidebarProps) {
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
    {
      name: "File",
      icon: <FileText className="mr-2 h-4 w-4" />,
      href: "/file",
    },
  ];

  return (
    <Sidebar collapsible="icon" className={cn("min-h-screen w-60", className)}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarTrigger />
          </SidebarMenu>
          <SidebarMenu>
            {sidebarItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton>
                    {item.icon}
                    {item.name}
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SignOutButton>
              <SidebarMenuButton className="text-red-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20">
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </SidebarMenuButton>
            </SignOutButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
