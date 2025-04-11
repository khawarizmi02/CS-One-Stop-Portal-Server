import { Metadata } from "next";

import { GroupSidebar } from "@/components/GroupSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Create T3 App",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/logo.svg" }],
};

export default function GroupPageLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="grid w-full grid-cols-[20%_77%] gap-4">
      <GroupSidebar />
      <section className="min-h-[calc(100dvh)]">{children}</section>
    </main>
  );
}
