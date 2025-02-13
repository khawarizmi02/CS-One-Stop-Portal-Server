import "@/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

import { ClerkProvider, SignedIn, SignedOut } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Create T3 App",
  description: "Generated by create-t3-app",
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
              <SidebarProvider>
                <AppSidebar />
                {children}
              </SidebarProvider>
            </SignedIn>
            <SignedOut>{children}</SignedOut>
          </TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
