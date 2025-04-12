// InlineDatePicker.tsx - Create this as a new component
"use client";

import React from "react";
import { Calendar } from "./ui/calendar";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";

interface InlineDatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
}

const InlineDatePicker: React.FC<InlineDatePickerProps> = ({
  date,
  setDate,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setDate(new Date())}
        >
          Today
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setDate(addDays(new Date(), 1))}
        >
          Tomorrow
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setDate(addDays(new Date(), 3))}
        >
          In 3 days
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setDate(addDays(new Date(), 7))}
        >
          In a week
        </Button>
      </div>

      <div className="rounded-md border">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </div>

      {date && (
        <div className="text-sm">
          Selected: <span className="font-medium">{format(date, "PPP")}</span>
        </div>
      )}
    </div>
  );
};

export default InlineDatePicker;
