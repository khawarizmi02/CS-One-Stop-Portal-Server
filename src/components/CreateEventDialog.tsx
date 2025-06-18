"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  Search,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Form schema with updated attendees structure
const createEventSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  startTime: z.string().min(1, "Start time is required"),
  durationType: z.enum(["days", "weeks", "months", "custom"]).default("days"),
  durationValue: z.number().min(1, "Duration must be at least 1").default(1),
  endTime: z.string().min(1, "End time is required"),
  timezone: z.string().default("UTC"),
  attendees: z.array(z.string().email()).optional(),
  selectedUsers: z.array(z.string()).optional(),
  selectedGroups: z.array(z.string()).optional(),
  showAs: z
    .enum(["free", "busy", "tentative", "outOfOffice", "unknown"])
    .default("busy"),
  sensitivity: z
    .enum(["normal", "private", "personal", "confidential"])
    .default("normal"),
});

type CreateEventFormData = z.infer<typeof createEventSchema>;

interface CreateEventDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  calendarId?: string;
  accountId: string;
  defaultDate?: Date;
}

// Generate time options in 15-minute intervals
const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      const displayTime = new Date(2000, 0, 1, hour, minute).toLocaleTimeString(
        [],
        {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        },
      );
      options.push({ value: time, label: displayTime });
    }
  }
  return options;
};

// Generate duration preset options
const generateDurationPresets = () => {
  return [
    { value: "1-days", label: "1 Day", type: "days", value_num: 1 },
    { value: "3-days", label: "3 Days", type: "days", value_num: 3 },
    { value: "7-days", label: "1 Week", type: "days", value_num: 7 },
    { value: "14-days", label: "2 Weeks", type: "days", value_num: 14 },
    { value: "1-months", label: "1 Month", type: "months", value_num: 1 },
    { value: "3-months", label: "3 Months", type: "months", value_num: 3 },
    { value: "custom", label: "Custom Duration", type: "custom", value_num: 1 },
  ];
};

export function CreateEventDialog({
  open,
  onOpenChange,
  calendarId,
  accountId,
  defaultDate,
}: CreateEventDialogProps) {
  const { toast } = useToast();
  const [attendeeInput, setAttendeeInput] = React.useState("");
  const [useCustomDuration, setUseCustomDuration] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  const timeOptions = generateTimeOptions();
  const durationPresets = generateDurationPresets();

  const { data: availableUsers, isLoading: loadingUsers } =
    api.user.getAll.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });

  const { data: availableGroups, isLoading: loadingGroups } =
    api.admin.getAppGroups.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });

  const form = useForm<CreateEventFormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      subject: "",
      description: "",
      location: "",
      startDate: defaultDate || new Date(),
      startTime: "09:00",
      durationType: "days",
      durationValue: 1,
      endTime: "10:00",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      attendees: [],
      selectedUsers: [],
      selectedGroups: [],
      showAs: "busy",
      sensitivity: "normal",
    },
  });

  const createEventMutation = api.calendar.createEvent.useMutation({
    onSuccess: () => {
      toast({
        title: "Event created",
        description: "Your event has been created successfully",
      });
      form.reset();
      onOpenChange?.(false);
    },
    onError: (error) => {
      toast({
        title: "Error creating event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate end date based on start date and duration
  const calculateEndDate = (
    startDate: Date,
    durationType: string,
    durationValue: number,
  ) => {
    switch (durationType) {
      case "days":
        return addDays(startDate, durationValue);
      case "weeks":
        return addWeeks(startDate, durationValue);
      case "months":
        return addMonths(startDate, durationValue);
      default:
        return addDays(startDate, durationValue);
    }
  };

  // Get calculated end date for display
  const getEndDate = () => {
    const startDate = form.getValues("startDate");
    const durationType = form.getValues("durationType");
    const durationValue = form.getValues("durationValue");

    if (!startDate) return null;
    return calculateEndDate(startDate, durationType, durationValue);
  };

  const selectedUsers = form.watch("selectedUsers") || [];
  const selectedGroups = form.watch("selectedGroups") || [];
  const attendees = form.watch("attendees") || [];

  const toggleSelectUser = (userId: string) => {
    const currentUsers = form.getValues("selectedUsers") || [];
    if (currentUsers.includes(userId)) {
      form.setValue(
        "selectedUsers",
        currentUsers.filter((id) => id !== userId),
        { shouldValidate: true },
      );
    } else {
      form.setValue("selectedUsers", [...currentUsers, userId], {
        shouldValidate: true,
      });
    }
  };

  const toggleSelectGroup = (groupId: string) => {
    const currentGroups = form.getValues("selectedGroups") || [];
    if (currentGroups.includes(groupId)) {
      form.setValue(
        "selectedGroups",
        currentGroups.filter((id) => id !== groupId),
        { shouldValidate: true },
      );
    } else {
      form.setValue("selectedGroups", [...currentGroups, groupId], {
        shouldValidate: true,
      });
    }
  };

  const filteredUsers = availableUsers?.filter((user) =>
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredGroups = availableGroups?.filter((group) =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const addAttendee = () => {
    if (attendeeInput && attendeeInput.includes("@")) {
      const currentAttendees = form.getValues("attendees") || [];
      if (!currentAttendees.includes(attendeeInput)) {
        form.setValue("attendees", [...currentAttendees, attendeeInput]);
        setAttendeeInput("");
      }
    }
  };

  const removeAttendee = (emailToRemove: string) => {
    const currentAttendees = form.getValues("attendees") || [];
    const updatedAttendees = currentAttendees.filter(
      (email) => email !== emailToRemove,
    );
    form.setValue("attendees", updatedAttendees);
    form.trigger("attendees");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addAttendee();
    }
  };

  const handleDurationPresetChange = (value: string) => {
    if (value === "custom") {
      setUseCustomDuration(true);
      form.setValue("durationType", "days");
      form.setValue("durationValue", 1);
    } else {
      setUseCustomDuration(false);
      const preset = durationPresets.find((p) => p.value === value);
      if (preset) {
        form.setValue("durationType", preset.type as any);
        form.setValue("durationValue", preset.value_num);
      }
    }
  };

  const onSubmit = (data: CreateEventFormData) => {
    const startDateTime = new Date(data.startDate);
    const [startHourRaw, startMinuteRaw] = data.startTime
      .split(":")
      .map(Number);
    const startHour = Number.isNaN(startHourRaw) ? 0 : startHourRaw;
    const startMinute = Number.isNaN(startMinuteRaw) ? 0 : startMinuteRaw;
    startDateTime.setHours(startHour ?? 0, startMinute ?? 0, 0, 0);

    const endDate = calculateEndDate(
      data.startDate,
      data.durationType,
      data.durationValue,
    );
    const endDateTime = new Date(endDate);
    const [endHourRaw, endMinuteRaw] = data.endTime.split(":").map(Number);
    const endHour = Number.isNaN(endHourRaw) ? 0 : endHourRaw;
    const endMinute = Number.isNaN(endMinuteRaw) ? 0 : endMinuteRaw;
    endDateTime.setHours(endHour ?? 0, endMinute ?? 0, 0, 0);

    // Collect user emails from selected users
    const userEmails = (data.selectedUsers || [])
      .map((userId) => {
        const user = availableUsers?.find((u) => u.id === userId);
        return user?.email || null;
      })
      .filter((email): email is string => !!email);

    // Collect user emails from selected groups
    const groupMemberEmails = (availableGroups || [])
      .filter((group) => data.selectedGroups?.includes(group.id))
      .flatMap((group) =>
        Array.isArray(group.members)
          ? group.members
              .filter((member) => typeof member === "string")
              .map((memberId) => {
                const user = availableUsers?.find((u) => u.id === memberId);
                return user?.email || null;
              })
              .filter((email): email is string => !!email)
          : [],
      );

    // Merge all attendees (manual emails, user emails, group member emails)
    const allAttendees = Array.from(
      new Set([...(data.attendees || []), ...userEmails, ...groupMemberEmails]),
    );

    if (allAttendees.length === 0) {
      toast({
        title: "No attendees selected",
        description: "Please add at least one attendee or select a user/group.",
        variant: "destructive",
      });
      return;
    }

    const eventData = {
      subject: data.subject,
      description: data.description,
      location: data.location,
      start: {
        dateTime: startDateTime.toISOString(),
        timezone: data.timezone,
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timezone: data.timezone,
      },
      showAs: data.showAs,
      sensitivity: data.sensitivity,
      meetingInfo: allAttendees.length
        ? {
            attendees: allAttendees.map((email) => ({
              id: email,
              emailAddress: {
                address: email,
              },
              type: "required" as const,
            })),
          }
        : undefined,
    };

    createEventMutation.mutate({
      accountId,
      eventData,
    });
  };

  return (
    <DialogContent className="max-h-[90vh] w-7xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Create New Event
        </DialogTitle>
        <DialogDescription>
          Fill in the details to create a new calendar event.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Subject */}
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject *</FormLabel>
                <FormControl>
                  <Input placeholder="Event title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Event description (optional)"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Location */}
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </FormLabel>
                <FormControl>
                  <Input placeholder="Event location (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Date and Time Grid */}
          <div className="space-y-6">
            {/* Start Date */}
            <div>
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        className="w-full rounded-md border"
                        initialFocus
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Duration and End Date */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <FormLabel>Duration *</FormLabel>
                <Select onValueChange={handleDurationPresetChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durationPresets.map((preset) => (
                      <SelectItem key={preset.value} value={preset.value}>
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {getEndDate() && (
                <div className="bg-muted rounded-md p-3">
                  <div className="text-muted-foreground text-sm font-medium">
                    End Date
                  </div>
                  <div className="text-lg font-semibold">
                    {format(getEndDate()!, "PPPP")}
                  </div>
                </div>
              )}
            </div>

            {/* Start Time and End Time */}
            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Start Time *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select start time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        {timeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      End Time *
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select end time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        {timeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Attendees */}
          <div className="space-y-3">
            <FormLabel className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Attendees
            </FormLabel>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={attendeeInput}
                onChange={(e) => setAttendeeInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button type="button" onClick={addAttendee} variant="outline">
                Add
              </Button>
            </div>
            {(attendees.length > 0 ||
              selectedUsers.length > 0 ||
              selectedGroups.length > 0) && (
              <div className="flex flex-wrap gap-2">
                {attendees.map((email) => (
                  <Badge
                    key={`email-${email}`}
                    variant="secondary"
                    className="gap-1"
                  >
                    {email}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground h-auto p-0"
                      onClick={() => removeAttendee(email)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
                {selectedUsers.map((id) => {
                  const user = availableUsers?.find((user) => user.id === id);
                  return (
                    <Badge
                      key={`user-${id}`}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {user?.firstName || "User"} {user?.lastName || ""}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground h-auto p-0"
                        onClick={() => toggleSelectUser(id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
                {selectedGroups.map((id) => {
                  const group = availableGroups?.find(
                    (group) => group.id === id,
                  );
                  return (
                    <Badge
                      key={`group-${id}`}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Users className="mr-1 h-3 w-3" />
                      {group?.name || "Group"}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-foreground h-auto p-0"
                        onClick={() => toggleSelectGroup(id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            )}
            <div className="flex flex-col gap-2">
              <div className="relative">
                <Search className="absolute top-2.5 left-2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for users or groups..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <ScrollArea className="h-64 rounded-md border">
                {loadingUsers || loadingGroups ? (
                  <div className="flex h-full items-center justify-center p-4">
                    <p className="text-gray-500">Loading...</p>
                  </div>
                ) : filteredUsers?.length || filteredGroups?.length ? (
                  <div className="flex flex-col">
                    {filteredGroups?.map((group) => (
                      <div
                        key={`group-${group.id}`}
                        className={`flex cursor-pointer items-center justify-between border-b p-3 hover:bg-gray-50 ${
                          selectedGroups.includes(group.id) ? "bg-gray-50" : ""
                        }`}
                        onClick={() => toggleSelectGroup(group.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                            <Users className="h-4 w-4 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium">{group.name}</p>
                            <p className="text-xs text-gray-500">
                              {Array.isArray(group.members)
                                ? group.members.length
                                : 0}{" "}
                              members
                            </p>
                          </div>
                        </div>
                        {selectedGroups.includes(group.id) && (
                          <div className="bg-primary rounded-full p-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                    {filteredUsers?.map((user) => (
                      <div
                        key={`user-${user.id}`}
                        className={`flex cursor-pointer items-center justify-between border-b p-3 hover:bg-gray-50 ${
                          selectedUsers.includes(user.id) ? "bg-gray-50" : ""
                        }`}
                        onClick={() => toggleSelectUser(user.id)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.imageUrl || ""} />
                            <AvatarFallback>
                              {user.firstName?.[0] || "U"} {user.lastName || ""}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.firstName || "User"} {user.lastName || ""}
                            </p>
                            {user.role && (
                              <p className="text-xs text-gray-500">
                                {user.role}
                              </p>
                            )}
                          </div>
                        </div>
                        {selectedUsers.includes(user.id) && (
                          <div className="bg-primary rounded-full p-1">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center p-4">
                    <p className="text-gray-500">No users or groups found</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="showAs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Show As</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="tentative">Tentative</SelectItem>
                      <SelectItem value="outOfOffice">Out of Office</SelectItem>
                      <SelectItem value="unknown">Unknown</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sensitivity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Privacy</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select privacy" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="confidential">Confidential</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={createEventMutation.isPending}
              className="min-w-[100px]"
            >
              {createEventMutation.isPending ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
