import React from "react";
import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";

import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "CS One Stop Portal",
  description: "A one-stop portal for all your CS Community needs.",
  icons: [{ rel: "icon", url: "/logo.svg" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable}`}>
        <body className="min-h-screen">
          <TRPCReactProvider>
            <SignedIn>
              <main className="flex h-screen">
                <SidebarProvider defaultOpen={false}>
                  <AppSidebar isCollapsed={false} />
                  <div className="h-screen flex-1">{children}</div>
                </SidebarProvider>
              </main>
            </SignedIn>
            <SignedOut>
              <main>{children}</main>
            </SignedOut>
          </TRPCReactProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
