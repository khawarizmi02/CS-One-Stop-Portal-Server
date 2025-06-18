"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { DayContentProps } from "react-day-picker";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Separator } from "@/components/ui/separator";
import { Tabs } from "@/components/ui/tabs";
import SearchBar from "@/components/SearchBar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, RefreshCw } from "lucide-react";
import { Calendar as CalendarComp } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import Loading from "@/components/Loading";
import { EventList } from "@/components/EventList";
import { EventDisplay } from "@/components/EventDisplay";
import useEvents from "@/hooks/use-events";
import type { JsonValue } from "@prisma/client/runtime/library";
import { useLocalStorage } from "usehooks-ts";
import { CreateEventDialog } from "@/components/CreateEventDialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AuthButton from "@/components/AuthButton";

export default function EventPage() {
  const { toast } = useToast();
  const { events, isFetching } = useEvents();
  const [accountId, setAccountId] = useLocalStorage("accountId", "");
  const defaultLayout = [25, 35, 40];
  const defaultCollapsed = false;
  const navCollapsedSize = 4;
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date(),
  );
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [createEventDialogOpen, setCreateEventDialogOpen] =
    React.useState(false);

  // You'll need to get the calendarId from somewhere - this is just an example
  // You might want to store it in localStorage or get it from your events hook
  const [selectedCalendarId, setSelectedCalendarId] =
    React.useState<string>("");

  const { mutate: refreshCalendars } = api.calendar.syncEvents.useMutation({
    onSuccess: () => {
      toast({
        title: "Calendars refreshed",
        description: "Your calendars have been refreshed",
      });
      setIsRefreshing(false);
    },
    onError: (error) => {
      toast({
        title: "Refresh failed",
        variant: "destructive",
      });
      setIsRefreshing(false);
    },
  });

  // Cookie handling effect for layout persistence
  React.useEffect(() => {
    const layoutCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("react-resizable-panels:layout:event="));
    const collapsedCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("react-resizable-panels:collapsed:event="));

    if (collapsedCookie) {
      setIsCollapsed(JSON.parse(collapsedCookie.split("=")[1] ?? "false"));
    }
  }, []);

  const handleRefreshCalendars = () => {
    console.log("accounntId", accountId);
    if (!accountId) {
      toast({
        title: "Error",
        description: "No account selected",
        variant: "destructive",
      });
      return;
    }
    setIsRefreshing(true);
    refreshCalendars({ accountId: accountId });
  };

  const handleCreateEvent = () => {
    // Check if we have required data
    if (!accountId) {
      toast({
        title: "Error",
        description: "No account selected",
        variant: "destructive",
      });
      return;
    }

    // For now, we'll need a default calendarId. You might want to:
    // 1. Let user select a calendar in the dialog
    // 2. Use a default calendar
    // 3. Get available calendars from an API call
    if (!selectedCalendarId) {
      toast({
        title: "Error",
        description: "No calendar selected. Please select a calendar first.",
        variant: "destructive",
      });
      return;
    }

    setCreateEventDialogOpen(true);
  };

  // Get event dates
  const eventDates = React.useMemo(() => getEventDates(events || []), [events]);

  return (
    <div className="hidden h-screen flex-col md:flex">
      <TooltipProvider delayDuration={0}>
        <ResizablePanelGroup
          direction="horizontal"
          onLayout={(sizes: number[]) => {
            document.cookie = `react-resizable-panels:layout:event=${JSON.stringify(
              sizes,
            )}`;
          }}
          className="h-full min-h-screen items-stretch"
        >
          {/* Left Panel - Calendar Sidebar */}
          <ResizablePanel
            defaultSize={defaultLayout[0]}
            collapsedSize={navCollapsedSize}
            collapsible={true}
            minSize={15}
            maxSize={40}
            onCollapse={() => {
              setIsCollapsed(true);
              document.cookie = `react-resizable-panels:collapsed:event=${JSON.stringify(
                true,
              )}`;
            }}
            onResize={() => {
              setIsCollapsed(false);
              document.cookie = `react-resizable-panels:collapsed:event=${JSON.stringify(
                false,
              )}`;
            }}
            className={cn(
              isCollapsed &&
                "min-w-[50px] transition-all duration-300 ease-in-out",
            )}
          >
            <div className="flex h-full flex-1 flex-col">
              {/* Header */}
              <div
                className={cn(
                  "flex h-[54px] items-center justify-center py-2",
                  isCollapsed ? "h-[52px]" : "px-4",
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full bg-green-500 font-bold text-white",
                    isCollapsed ? "h-8 w-8" : "hidden",
                  )}
                >
                  <Calendar className="h-4 w-4" />
                </div>
                <div
                  className={cn(
                    "flex w-full items-center justify-between",
                    isCollapsed && "hidden",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <span className="font-semibold">Calendars</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={isRefreshing}
                    onClick={() => {
                      setIsRefreshing(true);
                      refreshCalendars({ accountId: accountId });
                    }}
                  >
                    {isRefreshing ? (
                      <Loading size="sm" className="h-4 w-4" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <Separator />

              {/* Create Event Button within Dialog */}
              <Dialog
                open={createEventDialogOpen}
                onOpenChange={setCreateEventDialogOpen}
              >
                <div className={cn("p-4", isCollapsed && "p-2")}>
                  <DialogTrigger asChild>
                    <AuthButton
                      roles={["lecturer"]}
                      className={cn("w-full", isCollapsed && "h-8 w-8 p-0")}
                      size={isCollapsed ? "sm" : "default"}
                    >
                      {isCollapsed ? (
                        <Plus className="h-4 w-4" />
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Event
                        </>
                      )}
                    </AuthButton>
                  </DialogTrigger>
                </div>
                <CreateEventDialog
                  calendarId={selectedCalendarId}
                  accountId={accountId}
                />
              </Dialog>

              {/* Calendar List */}
              <div className={cn("px-2", isCollapsed && "px-1")}>
                {!isCollapsed && (
                  <div className="rounded-lg border p-2">
                    <CalendarComp
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="w-full"
                      classNames={{
                        months:
                          "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 flex-1",
                        month: "space-y-4 w-full flex flex-col",
                        table: "w-full h-full border-collapse space-y-1",
                        head_row: "",
                        row: "w-full mt-2",
                      }}
                      modifiers={{
                        hasEvent: (date: Date) =>
                          eventDates.has(format(date, "yyyy-MM-dd")),
                      }}
                      modifiersClassNames={{
                        hasEvent: "relative", // Optional: for positioning the indicator
                      }}
                      components={{
                        DayContent: CustomDayContent, // Custom rendering for day content
                      }}
                    />
                  </div>
                )}
              </div>

              <Separator className="mx-2 my-4" />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Middle Panel - Event List */}
          <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
            <Tabs>
              <div className="flex h-[52px] items-center px-4 py-2">
                <h2 className="text-xl font-bold">Events</h2>
              </div>
              <Separator />
              <SearchBar />
              <EventList />
            </Tabs>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Event Details */}
          <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
            <EventDisplay />
          </ResizablePanel>
        </ResizablePanelGroup>
      </TooltipProvider>
    </div>
  );
}

type EventTypes = {
  id: string;
  subject: string;
  startDate: Date;
  endDate: Date;
  createdTime: Date | null;
  lastModifiedTime: Date | null;
  meetingInfo: JsonValue;
  organizer: JsonValue;
};

// Utility to extract event dates
const getEventDates = (events: EventTypes[]) => {
  const eventDates = new Set<string>();
  events?.forEach((event) => {
    const startDate = event.startDate;
    if (startDate) {
      // Format date to YYYY-MM-DD for comparison
      eventDates.add(format(startDate, "yyyy-MM-dd"));
    }
  });
  return eventDates;
};

// Custom day content to show a tick or dot
const CustomDayContent = ({ date, activeModifiers }: DayContentProps) => {
  const hasEvent = activeModifiers.hasEvent;
  return (
    <div className="relative flex items-center justify-center">
      <span>
        {date.getDate()}{" "}
        {hasEvent && (
          <span className="absolute bottom-0 h-1.5 w-1.5 rounded-full bg-green-500" />
        )}
      </span>
    </div>
  );
};
