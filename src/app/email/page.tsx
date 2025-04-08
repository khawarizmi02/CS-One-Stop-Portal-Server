"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import Loading from "@/components/Loading";
import { useLocalStorage } from "usehooks-ts";
import EmailSidebar from "@/components/EmailSidebar";
import { api } from "@/trpc/react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { getAurinkoAuthUrl } from "@/lib/aurinko";
import { ThreadList } from "@/components/ThreadList";
import SearchBar from "@/components/SearchBar";

export default function MailPage() {
  const { toast } = useToast();
  const defaultLayout = [20, 32, 48];
  const defaultCollapsed = false;
  const navCollapsedSize = 4;
  const [done, setDone] = useLocalStorage("threadDone", false);
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [accountId, setAccountId] = useLocalStorage("accountId", "");

  const { data: account, isLoading: isLoadingAccount } =
    api.mail.getAccount.useQuery();

  // Handle cookie reading client-side
  React.useEffect(() => {
    const layoutCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("react-resizable-panels:layout:mail="));
    const collapsedCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("react-resizable-panels:collapsed="));

    if (layoutCookie) {
      console.log(
        "Layout from cookie:",
        JSON.parse(layoutCookie?.split("=")[1] ?? "[]"),
      );
    }
    if (collapsedCookie) {
      const collapsedValue = JSON.parse(
        collapsedCookie.split("=")[1] ?? "false",
      );
      setIsCollapsed(collapsedValue);
    }
  }, []);

  React.useEffect(() => {
    if (account) {
      setAccountId(account.id);
    }
  }, [account, setAccountId]);

  if (isLoadingAccount) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!accountId) {
    toast({
      title: "No account found",
      description: "Please add an account to continue.",
      variant: "destructive",
    });
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">No account found</div>
        <Button
          onClick={async () => {
            const authUrl = await getAurinkoAuthUrl("Google");
            window.location.href = authUrl;
          }}
          variant="default"
        >
          Link Account
        </Button>
      </div>
    );
  }

  return (
    <div className="hidden h-screen flex-col md:flex">
      <TooltipProvider delayDuration={0}>
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={(sizes: number[]) => {
            document.cookie = `react-resizable-panels:layout:mail=${JSON.stringify(
              sizes,
            )}`;
          }}
          className="h-full min-h-screen items-stretch"
        >
          <ResizablePanel
            defaultSize={defaultLayout[0]}
            collapsedSize={navCollapsedSize}
            collapsible={true}
            minSize={15}
            maxSize={40}
            onCollapse={() => {
              setIsCollapsed(true);
              document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
                true,
              )}`;
            }}
            onResize={() => {
              setIsCollapsed(false);
              document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(
                false,
              )}`;
            }}
            className={cn(
              isCollapsed &&
                "min-w-[50px] transition-all duration-300 ease-in-out",
            )}
          >
            <div className="flex h-full flex-1 flex-col">
              <div
                className={cn(
                  "flex h-[54px] items-center justify-center py-2",
                  isCollapsed ? "h-[52px]" : "px-2",
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full bg-blue-500 font-bold text-white",
                    isCollapsed ? "h-8 w-8" : "hidden",
                  )}
                >
                  {account?.emailAddress?.charAt(0).toUpperCase()}
                </div>
                <div className={cn(isCollapsed && "hidden")}>
                  {account?.emailAddress}
                </div>
              </div>
              <Separator />
              <EmailSidebar isCollapsed={isCollapsed} />
              <div className="flex-1"></div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
            <Tabs
              defaultValue="inbox"
              value={done ? "done" : "inbox"}
              onValueChange={(tab) => {
                if (tab === "done") {
                  setDone(true);
                } else {
                  setDone(false);
                }
              }}
            >
              <div className="flex h-[52px] items-center px-4 py-2">
                {" "}
                <h1 className="text-xl font-bold">Inbox</h1>
                <TabsList className="ml-auto">
                  <TabsTrigger
                    value="inbox"
                    className="text-zinc-600 dark:text-zinc-200"
                  >
                    Inbox
                  </TabsTrigger>
                  <TabsTrigger
                    value="done"
                    className="text-zinc-600 dark:text-zinc-200"
                  >
                    Done
                  </TabsTrigger>
                </TabsList>
              </div>
              <Separator />
              <SearchBar />
              <TabsContent value="inbox" className="m-0">
                <ThreadList />
              </TabsContent>
              <TabsContent value="done" className="m-0">
                <ThreadList />
              </TabsContent>
            </Tabs>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
            {/* Placeholder for ThreadDisplay */}
          </ResizablePanel>
        </ResizablePanelGroup>
      </TooltipProvider>
    </div>
  );
}
