"use client"

import * as React from "react"
import { Calendar } from "./calendar"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"
import { Popover, PopoverContent, PopoverTrigger } from "./popover"
import { IconCalendar, IconClock, IconX } from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { format, parse, isValid } from "date-fns"

export type DateTimePickerMode = "date" | "time" | "datetime"

export interface DateTimePickerProps {
  mode?: DateTimePickerMode
  value?: Date | null
  defaultValue?: Date | null
  onChange?: (date: Date | null) => void
  disabled?: boolean
  placeholder?: string
  dateFormat?: string
  timeFormat?: string
  className?: string
  locale?: Locale
}

export function DateTimePicker({
  mode = "datetime",
  value,
  defaultValue,
  onChange,
  disabled = false,
  placeholder,
  dateFormat = "dd.MM.yyyy",
  timeFormat = "HH:mm",
  className,
  locale,
}: DateTimePickerProps) {
  const [internalValue, setInternalValue] = React.useState<Date | null>(
    defaultValue || value || null
  )
  const [open, setOpen] = React.useState(false)
  const [timeInput, setTimeInput] = React.useState("")

  const currentValue = value !== undefined ? value : internalValue

  React.useEffect(() => {
    if (currentValue) {
      setTimeInput(format(currentValue, timeFormat))
    }
  }, [currentValue, timeFormat])

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    let newDate = date

    // If mode includes time and we have current time, preserve it
    if ((mode === "datetime" || mode === "time") && currentValue) {
      const hours = currentValue.getHours()
      const minutes = currentValue.getMinutes()
      const seconds = currentValue.getSeconds()
      newDate = new Date(date)
      newDate.setHours(hours, minutes, seconds)
    }

    if (value === undefined) {
      setInternalValue(newDate)
    }
    onChange?.(newDate)

    // Auto-close for date-only mode
    if (mode === "date") {
      setOpen(false)
    }
  }

  const handleTimeChange = (timeString: string) => {
    setTimeInput(timeString)

    // Parse time in HH:mm format
    const timeParts = timeString.match(/^(\d{1,2}):(\d{2})$/)
    if (!timeParts) return

    const hours = parseInt(timeParts[1], 10)
    const minutes = parseInt(timeParts[2], 10)

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return

    const newDate = currentValue ? new Date(currentValue) : new Date()
    newDate.setHours(hours, minutes, 0, 0)

    if (value === undefined) {
      setInternalValue(newDate)
    }
    onChange?.(newDate)
  }

  const handleClear = () => {
    if (value === undefined) {
      setInternalValue(null)
    }
    setTimeInput("")
    onChange?.(null)
  }

  const getDisplayValue = () => {
    if (!currentValue) return placeholder || getPlaceholder()

    if (mode === "date") {
      return format(currentValue, dateFormat, { locale })
    }
    if (mode === "time") {
      return format(currentValue, timeFormat, { locale })
    }
    return `${format(currentValue, dateFormat, { locale })} ${format(currentValue, timeFormat, { locale })}`
  }

  const getPlaceholder = () => {
    if (mode === "date") return "Select date"
    if (mode === "time") return "Select time"
    return "Select date and time"
  }

  const renderTrigger = () => {
    const Icon = mode === "time" ? IconClock : IconCalendar

    return (
      <Button
        variant="outline"
        disabled={disabled}
        className={cn(
          "w-full justify-start text-left font-normal",
          !currentValue && "text-muted-foreground",
          className
        )}
      >
        <Icon className="mr-2 size-4" />
        {getDisplayValue()}
        {currentValue && !disabled && (
          <IconX
            className="ml-auto size-4 opacity-50 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              handleClear()
            }}
          />
        )}
      </Button>
    )
  }

  // Time-only mode (no popover needed)
  if (mode === "time") {
    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <div className="flex items-center gap-2">
          <IconClock className="size-4 text-muted-foreground" />
          <Input
            type="time"
            value={timeInput}
            onChange={(e) => handleTimeChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder || "HH:MM"}
            className="flex-1"
          />
          {currentValue && !disabled && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="size-8"
            >
              <IconX className="size-4" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{renderTrigger()}</PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col">
          {/* Calendar for date selection */}
          {(mode === "date" || mode === "datetime") && (
            <Calendar
              mode="single"
              selected={currentValue || undefined}
              onSelect={handleDateSelect}
              disabled={disabled}
              locale={locale}
            />
          )}

          {/* Time picker for datetime mode */}
          {mode === "datetime" && (
            <div className="border-t p-3">
              <Label className="text-sm font-medium">Time</Label>
              <div className="mt-2 flex items-center gap-2">
                <IconClock className="size-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={timeInput}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  disabled={disabled}
                  placeholder="HH:MM"
                  className="flex-1"
                />
              </div>
            </div>
          )}

          {/* Footer actions */}
          {mode === "datetime" && (
            <div className="flex items-center justify-between border-t p-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={disabled}
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={() => setOpen(false)}
                disabled={disabled}
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

