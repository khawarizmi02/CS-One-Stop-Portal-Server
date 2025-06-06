import React, { type ComponentProps } from "react";
import DOMPurify from "dompurify";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useThread } from "@/hooks/use-thread";
import { api, type RouterOutputs } from "@/trpc/react";
import { useAtom } from "jotai";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useLocalStorage } from "usehooks-ts";
import useThreads from "@/hooks/use-threads";
import { searchValueAtom } from "./SearchBar";

import { format } from "date-fns";

export function ThreadList() {
  const { threads, isFetching } = useThreads();
  const [threadId, setThreadId] = useThread();
  const [parent] = useAutoAnimate(/* optional config */);
  const [searchValue] = useAtom(searchValueAtom);

  // console.log("ThreadList", threads);

  // Add safety check to handle undefined threads
  const safeThreads = threads || [];

  const filteredThreads = searchValue
    ? safeThreads.filter(
        (thread) =>
          // Search in subject
          thread.subject?.toLowerCase().includes(searchValue.toLowerCase()) ||
          // Search in the latest email's body snippet
          thread.emails?.[thread.emails.length - 1]?.bodySnippet
            ?.toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          // Search in sender name
          thread.emails?.[thread.emails.length - 1]?.from?.name
            ?.toLowerCase()
            .includes(searchValue.toLowerCase()),
      )
    : safeThreads;

  const groupedThreads = filteredThreads.reduce(
    (acc, thread) => {
      // Add null check for thread.lastMessageDate
      const date = format(thread.lastMessageDate ?? new Date(), "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(thread);
      return acc;
    },
    {} as Record<string, typeof threads>,
  );

  // Show loading state when fetching
  if (isFetching && safeThreads.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading threads...</div>
      </div>
    );
  }

  // Show empty state when no threads
  if (!isFetching && safeThreads.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">No threads to display</div>
      </div>
    );
  }

  return (
    <div className="max-h-[calc(100vh-120px)] max-w-full overflow-y-scroll">
      <div className="flex flex-col gap-2 p-4 pt-0" ref={parent}>
        {Object.entries(groupedThreads).map(([date, threads]) => (
          <React.Fragment key={date}>
            <div className="mt-4 text-xs font-medium text-muted-foreground first:mt-0">
              {format(new Date(date), "MMMM d, yyyy")}
            </div>
            {threads?.map((item) => (
              <button
                id={`thread-${item.id}`}
                key={item.id}
                className={cn(
                  "relative flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all",
                )}
                onClick={() => {
                  setThreadId(item.id);
                }}
              >
                {threadId === item.id && (
                  <motion.div
                    className="absolute inset-0 z-[-1] rounded-lg bg-black/10 dark:bg-white/20"
                    layoutId="thread-list-item"
                    transition={{
                      duration: 0.1,
                      ease: "easeInOut",
                    }}
                  />
                )}
                <div className="flex w-full flex-col gap-1">
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">
                        {item.emails &&
                          item.emails.length > 0 &&
                          item.emails.at(-1)?.from?.name}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "ml-auto text-xs",
                        threadId === item.id
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {item.emails &&
                        item.emails.length > 0 &&
                        formatDistanceToNow(
                          item.emails.at(-1)?.sentAt ?? new Date(),
                          {
                            addSuffix: true,
                          },
                        )}
                    </div>
                  </div>
                  <div className="text-xs font-medium">{item.subject}</div>
                </div>
                <div
                  className="line-clamp-2 text-xs text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html:
                      item.emails && item.emails.length > 0
                        ? DOMPurify.sanitize(
                            item.emails.at(-1)?.bodySnippet ?? "",
                            {
                              USE_PROFILES: { html: true },
                            },
                          )
                        : "",
                  }}
                ></div>
                {item?.emails &&
                item?.emails?.length > 0 &&
                (item?.emails[0]?.sysLabels ?? []).length > 0 ? (
                  <div className="flex items-center gap-2">
                    {item.emails[0]?.sysLabels.map((label) => (
                      <Badge
                        key={label}
                        variant={getBadgeVariantFromLabel(label)}
                      >
                        {label}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </button>
            ))}
          </React.Fragment>
        ))}
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
