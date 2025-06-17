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
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, RefreshCw } from "lucide-react";
import { Calendar as CalendarComp } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/trpc/react";
import Loading from "@/components/Loading";

export default function EventPage() {
  const { toast } = useToast();
  const defaultLayout = [25, 35, 40];
  const defaultCollapsed = false;
  const navCollapsedSize = 4;
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    new Date(),
  );
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // API calls
  // const { data: calendars, isLoading: isLoadingCalendars } =
  //   api.calendar.getCalendars.useQuery();
  const { data: events, isLoading: isLoadingEvents } =
    api.calendar.getEvents.useQuery();

  const { mutate: refreshCalendars } = api.calendar.getCalendars.useMutation({
    onSuccess: () => {
      toast({
        title: "Calendars refreshed",
        description: "Your calendars have been updated",
      });
      setIsRefreshing(false);
    },
    onError: (error) => {
      toast({
        title: "Refresh failed",
        description: error.message,
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
    setIsRefreshing(true);
    refreshCalendars();
  };

  const handleCreateEvent = () => {
    // TODO: Implement create event modal/dialog
    toast({
      title: "Create Event",
      description: "Create event functionality to be implemented",
    });
  };

  const handleEventSelect = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  // Get event dates
  const eventDates = React.useMemo(
    () => getEventDates(events?.records || []),
    [events],
  );

  // Convert event dates to Date objects for modifiers
  const eventDatesArray = Array.from(eventDates).map(
    (dateStr) => new Date(dateStr),
  );

  // if (isLoadingCalendars) {
  //   return (
  //     <div className="flex h-full items-center justify-center">
  //       <Loading />
  //     </div>
  //   );
  // }

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
                    onClick={handleRefreshCalendars}
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

              {/* Create Event Button */}
              <div className={cn("p-4", isCollapsed && "p-2")}>
                <Button
                  onClick={handleCreateEvent}
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
                </Button>
              </div>

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
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex h-[52px] items-center px-4 py-2">
                <h1 className="text-xl font-bold">Events</h1>
              </div>
              <Separator />

              {/* Event List */}
              <div className="flex-1 overflow-auto">
                {isLoadingEvents ? (
                  <div className="flex items-center justify-center p-8">
                    <Loading size="sm" className="h-6 w-6" />
                  </div>
                ) : events && events.length > 0 ? (
                  <div className="divide-y">
                    {events.records.map((event, index) => (
                      <div
                        key={event.id || index}
                        className={cn(
                          "hover:bg-accent cursor-pointer p-4 transition-colors",
                          selectedEventId === event.id && "bg-accent",
                        )}
                        onClick={() => handleEventSelect(event.id)}
                      >
                        <div className="space-y-1">
                          <h3 className="text-sm font-medium">
                            {event.subject || "Untitled Event"}
                          </h3>
                          <p className="text-muted-foreground text-xs">
                            {event.start.dateTime
                              ? new Date(
                                  event.start.dateTime,
                                ).toLocaleDateString()
                              : event.start.dateOnly
                                ? new Date(
                                    event.start.dateOnly,
                                  ).toLocaleDateString()
                                : "No date"}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {event.start.dateTime && event.end.dateTime
                              ? `${new Date(event.start.dateTime).toLocaleTimeString()} - ${new Date(event.end.dateTime).toLocaleTimeString()}`
                              : event.start.dateOnly && event.end.dateOnly
                                ? `${new Date(event.start.dateOnly).toLocaleDateString()} - ${new Date(event.end.dateOnly).toLocaleDateString()}`
                                : "All day"}
                          </p>
                          {event.location && (
                            <p className="text-muted-foreground truncate text-xs">
                              📍 {event.location}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <Calendar className="text-muted-foreground mx-auto h-12 w-12" />
                      <h3 className="mt-4 text-lg font-semibold">
                        No events found
                      </h3>
                      <p className="text-muted-foreground">
                        Create your first event to get started.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Right Panel - Event Details */}
          <ResizablePanel defaultSize={defaultLayout[2]} minSize={30}>
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex h-[52px] items-center px-4 py-2">
                <h2 className="text-lg font-semibold">Event Details</h2>
              </div>
              <Separator />

              {/* Event Details Content */}
              <div className="flex-1 overflow-auto p-4">
                {selectedEventId ? (
                  <div className="space-y-4">
                    {/* Selected event details will be displayed here */}
                    <div className="text-muted-foreground text-center">
                      <Calendar className="mx-auto mb-2 h-8 w-8" />
                      {/* <p>Event details for ID: {selectedEventId}</p> */}
                      <p className="text-sm">
                        Detailed event view to be implemented
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-muted-foreground text-center">
                      <Calendar className="mx-auto mb-4 h-12 w-12" />
                      <h3 className="mb-2 text-lg font-semibold">
                        Select an event
                      </h3>
                      <p>Choose an event from the list to view its details</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </TooltipProvider>
    </div>
  );
}

// Utility to extract event dates
const getEventDates = (events: any[]) => {
  const eventDates = new Set<string>();
  events?.forEach((event) => {
    const startDate = event.start.dateTime
      ? new Date(event.start.dateTime)
      : event.start.dateOnly
        ? new Date(event.start.dateOnly)
        : null;
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
