import React from "react";
import { useAtom } from "jotai";
import { useLocalStorage } from "usehooks-ts";
import { api } from "@/trpc/react";
import { useThread } from "@/hooks/use-thread";
import useThreads from "@/hooks/use-threads";
import { useEvent } from "@/hooks/use-event";
import useEvents from "@/hooks/use-events";
import { isSearchingAtom } from "@/components/SearchBar";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Paperclip,
  Bell,
  Mail,
  Copy,
  ExternalLink,
  CheckCircle,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const EventDisplay = () => {
  const { events } = useEvents();
  const [eventId] = useEvent();
  const today = new Date();
  const _event = events?.find((event) => event.id === eventId);
  const [isSearching] = useAtom(isSearchingAtom);

  const [accountId] = useLocalStorage("accountId", "");

  const { data: foundEvent } = api.calendar.getEventById.useQuery(
    {
      accountId,
      eventId: _event?.id ?? "",
    },
    { enabled: !!accountId && !!_event },
  );

  const event = foundEvent;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  };

  const formatTimeRange = (startDate: Date, endDate: Date) => {
    const start = formatTime(startDate);
    const end = formatTime(endDate);
    return `${start} - ${end}`;
  };

  const getOrganizerInfo = (organizerString: string) => {
    try {
      const organizer = JSON.parse(organizerString);
      return organizer.emailAddress;
    } catch {
      return null;
    }
  };

  const getMeetingInfo = (meetingInfoString: string) => {
    try {
      return JSON.parse(meetingInfoString);
    } catch {
      return null;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getResponseIcon = (response: string) => {
    switch (response) {
      case "accepted":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "declined":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "tentative":
        return <HelpCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <HelpCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!event) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground text-center">
          <Calendar className="mx-auto mb-4 h-12 w-12" />
          <h3 className="mb-2 text-lg font-semibold">Select an event</h3>
          <p>Choose an event from the list to view its details</p>
        </div>
      </div>
    );
  }

  const organizerInfo = getOrganizerInfo(String(event?.organizer ?? "{}"));
  const meetingInfo = getMeetingInfo(String(event?.meetingInfo ?? "{}"));
  const attendees = meetingInfo?.attendees || [];

  return (
    <TooltipProvider>
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="bg-background border-b p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-foreground mb-2 font-semibold">
                {event.subject}
              </h2>
              <div className="text-muted-foreground flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatDate(event.startDate)} •{" "}
                    {formatTimeRange(event.startDate, event.endDate)}
                  </span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span className="max-w-xs truncate">{event.location}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={event.showAs === "busy" ? "default" : "secondary"}
              >
                {event.showAs}
              </Badge>
              {event.hasAttachments && (
                <Tooltip>
                  <TooltipTrigger>
                    <Paperclip className="text-muted-foreground h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>Has attachments</TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6 overflow-auto p-4">
          {/* Time and Location Card */}
          <Card className="gap-4">
            <CardHeader className="">
              <CardTitle className="text-md flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid gap-4">
                <div className="flex items-start gap-3">
                  <Clock className="text-muted-foreground mt-0.5 h-4 w-4" />
                  <div>
                    <p className="font-medium">{formatDate(event.startDate)}</p>
                    <p className="text-muted-foreground text-sm">
                      {formatTimeRange(event.startDate, event.endDate)}{" "}
                      (Malaysia Time)
                    </p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="text-muted-foreground mt-0.5 h-4 w-4" />
                    <div className="flex-1">
                      <p className="font-medium">{event.location}</p>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-sm text-blue-600 hover:text-blue-800"
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps/search/${encodeURIComponent(event.location ?? "")}`,
                            "_blank",
                          )
                        }
                      >
                        View map <ExternalLink className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {event.reminder &&
                  (() => {
                    let reminderObj: any = event.reminder;
                    if (typeof reminderObj === "string") {
                      try {
                        reminderObj = JSON.parse(reminderObj);
                      } catch {
                        reminderObj = {};
                      }
                    }
                    return (
                      reminderObj.overrides &&
                      reminderObj.overrides.length > 0 && (
                        <div className="flex items-start gap-3">
                          <Bell className="text-muted-foreground mt-0.5 h-4 w-4" />
                          <div>
                            <p className="font-medium">Reminder</p>
                            <p className="text-muted-foreground text-sm">
                              {reminderObj.overrides[0].minutes} minutes before
                            </p>
                          </div>
                        </div>
                      )
                    );
                  })()}
              </div>
            </CardContent>
          </Card>

          {/* Organizer and Attendees Card */}
          <Card className="gap-3">
            <CardHeader className="">
              <CardTitle className="text-md flex items-center gap-2">
                <Users className="h-5 w-5" />
                People
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Organizer */}
              {organizerInfo && (
                <div>
                  <h4 className="mb-2 flex items-center gap-2 font-medium">
                    <User className="h-4 w-4" />
                    Organizer
                  </h4>
                  <div className="bg-muted/30 flex items-center gap-3 rounded-lg border p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(
                          organizerInfo.name || organizerInfo.address,
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {organizerInfo.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {organizerInfo.address}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(organizerInfo.address)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Attendees */}
              {attendees.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">
                    Attendees ({attendees.length})
                  </h4>
                  <div className="space-y-2">
                    {attendees.map((attendee: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 rounded-lg border p-2"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(
                              attendee.emailAddress?.name ||
                                attendee.emailAddress?.address ||
                                "U",
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {attendee.emailAddress?.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {attendee.emailAddress?.address}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getResponseIcon(attendee.response)}
                          <Badge variant="outline" className="text-xs">
                            {attendee.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description Card */}
          {event.description && (
            <Card className="gap-1">
              <CardHeader className="">
                <CardTitle className="text-md">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="text-muted-foreground font-sans text-sm whitespace-pre-wrap">
                    {event.description.split("\r\n").slice(0, 3).join("\n")}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attachments Card */}
          {event.hasAttachments &&
            event.attachments &&
            event.attachments.length > 0 && (
              <Card className="gap-3">
                <CardHeader className="">
                  <CardTitle className="text-md flex items-center gap-2">
                    <Paperclip className="h-5 w-5" />
                    Attachments ({event.attachments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {event.attachments.map((attachment: any, index: number) => (
                      <div
                        key={index}
                        className="hover:bg-muted/50 flex cursor-pointer items-center gap-3 rounded-lg border p-2"
                      >
                        <Paperclip className="text-muted-foreground h-4 w-4" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {attachment.name}
                          </p>
                          {attachment.size && (
                            <p className="text-muted-foreground text-xs">
                              {attachment.size} bytes
                            </p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Quick Actions */}
          <Card className="gap-1">
            <CardHeader className="">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm">
                  <Mail className="mr-2 h-4 w-4" />
                  Reply
                </Button>
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Add to Calendar
                </Button>
                <Button variant="outline" size="sm">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Details
                </Button>
                {event.htmlLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      event.htmlLink && window.open(event.htmlLink, "_blank")
                    }
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in Outlook
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
};
