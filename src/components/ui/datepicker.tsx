"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date;
  onSelect: (date?: Date) => void;
  className?: string;
}

export function DatePicker({ value, onSelect, className }: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value);

  React.useEffect(() => {
    // Sync the internal state if the external value changes
    setSelectedDate(value);
  }, [value]);

  const handleConfirm = () => {
    onSelect(selectedDate);
    setIsOpen(false);
  };

  const handleCancel = () => {
    // Revert internal state to the original prop value and close
    setSelectedDate(value);
    setIsOpen(false);
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          initialFocus
        />
        <div className="flex justify-end gap-2 p-2 border-t">
          <Button variant="ghost" size="sm" onClick={handleCancel}>Cancel</Button>
          <Button size="sm" onClick={handleConfirm}>Confirm</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
