import React, { type ComponentProps } from "react";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useEvent } from "@/hooks/use-event";
import useEvents from "@/hooks/use-events";
import { api, type RouterOutputs } from "@/trpc/react";
import { useAtom } from "jotai";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useLocalStorage } from "usehooks-ts";
import { searchValueAtom } from "./SearchBar";

import { format } from "date-fns";
import Loading from "./Loading";

// Helper function to safely parse organizer JSON string
function parseOrganizer(organizerString: string | null | undefined) {
  if (!organizerString) return null;

  try {
    const parsed = JSON.parse(organizerString);
    return parsed?.emailAddress?.name || parsed?.emailAddress?.address || null;
  } catch (error) {
    console.warn("Failed to parse organizer:", error);
    return null;
  }
}

export function EventList() {
  const { events, isFetching } = useEvents();
  const [eventId, setEventId] = useEvent();
  const [parent] = useAutoAnimate(/* optional config */);
  const [searchValue] = useAtom(searchValueAtom);

  // Add safety check to handle undefined events
  const safeEvents = events || [];

  const filteredEvents = searchValue
    ? safeEvents.filter((event) => {
        // Search in subject
        const subjectMatch = event.subject
          ?.toLowerCase()
          .includes(searchValue.toLowerCase());

        // Search in the event organizer (parse the JSON string first)
        const organizerName =
          typeof event.organizer === "string"
            ? parseOrganizer(event.organizer)
            : null;
        const organizerMatch = organizerName
          ?.toLowerCase()
          .includes(searchValue.toLowerCase());

        return subjectMatch || organizerMatch;
      })
    : safeEvents;

  // Show loading state when fetching
  if (isFetching && safeEvents.length === 0) {
    return (
      <div className="flex h-full items-center justify-center gap-2">
        <Loading size="sm" />
        <div className="text-muted-foreground">Loading events...</div>
      </div>
    );
  }

  // Show empty state when no events
  if (!isFetching && safeEvents.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">No events to display</div>
      </div>
    );
  }

  return (
    <div className="max-h-[calc(100vh-120px)] max-w-full overflow-y-auto">
      <div className="flex flex-col gap-1 p-2" ref={parent}>
        {filteredEvents.map((item) => {
          const organizerName =
            typeof item.organizer === "string"
              ? parseOrganizer(item.organizer)
              : null;

          return (
            <button
              id={`event-${item.id}`}
              key={item.id}
              className={cn(
                "hover:bg-accent/50 relative flex flex-col items-start gap-1 rounded-md border p-3 text-left transition-all",
                eventId === item.id && "bg-accent border-accent-foreground/20",
              )}
              onClick={() => {
                setEventId(item.id);
              }}
            >
              {eventId === item.id && (
                <motion.div
                  className="bg-accent absolute inset-0 z-[-1] rounded-md"
                  layoutId="event-list-item"
                  transition={{
                    duration: 0.15,
                    ease: "easeInOut",
                  }}
                />
              )}

              {/* Main subject - highlighted */}
              <div className="text-foreground mb-1 text-sm font-semibold">
                {item.subject || "Untitled Event"}
              </div>

              {/* Event details row */}
              <div className="text-muted-foreground flex w-full items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {/* Organizer */}
                  <span className="flex items-center gap-1">
                    <span className="text-[10px] opacity-60">by</span>
                    <span className="font-medium">
                      {organizerName || "Unknown"}
                    </span>
                  </span>

                  {/* Event start date */}
                  {item.startDate && (
                    <span className="flex items-center gap-1">
                      <span className="text-[10px] opacity-60">starts</span>
                      <span className="font-medium">
                        {format(new Date(item.startDate), "MMM d, h:mm a")}
                      </span>
                    </span>
                  )}
                </div>

                {/* Created time */}
                <span className="text-[10px] opacity-60">
                  {formatDistanceToNow(item.createdTime ?? new Date(), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getBadgeVariantFromLabel(
  label: string,
): ComponentProps<typeof Badge>["variant"] {
  if (["work"].includes(label.toLowerCase())) {
    return "default";
  }

  if (["personal"].includes(label.toLowerCase())) {
    return "outline";
  }

  return "secondary";
}
