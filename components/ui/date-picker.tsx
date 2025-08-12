"use client"

import * as React from "react"
import ReactDatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

export interface DatePickerProps {
  id?: string
  label?: string
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  className?: string
}

export function DatePicker({
  id,
  label,
  value,
  onChange,
  placeholder = "Select a date",
  disabled = false,
  minDate,
  maxDate,
  className
}: DatePickerProps) {
  const CustomInput = React.forwardRef<HTMLInputElement, any>(
    ({ value, onClick, placeholder }, ref) => (
      <div className="relative">
        <input
          ref={ref}
          value={value}
          onClick={onClick}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "cursor-pointer pr-10"
          )}
        />
        <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    )
  )
  CustomInput.displayName = "CustomInput"

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </Label>
      )}
      <ReactDatePicker
         selected={value}
         onChange={(date: Date | null) => onChange?.(date || undefined)}
         minDate={minDate}
         maxDate={maxDate}
         disabled={disabled}
         placeholderText={placeholder}
         customInput={<CustomInput />}
         dateFormat="MMM dd, yyyy"
         showPopperArrow={false}
         popperClassName="z-50"
        calendarClassName={cn(
          "!bg-popover !border-border !shadow-md !rounded-md !p-3",
          "[&_.react-datepicker__header]:!bg-transparent [&_.react-datepicker__header]:!border-b [&_.react-datepicker__header]:!border-border",
          "[&_.react-datepicker__current-month]:!text-foreground [&_.react-datepicker__current-month]:!font-semibold",
          "[&_.react-datepicker__day-name]:!text-muted-foreground [&_.react-datepicker__day-name]:!font-medium",
          "[&_.react-datepicker__day]:!text-foreground [&_.react-datepicker__day]:!bg-transparent [&_.react-datepicker__day]:hover:!bg-accent [&_.react-datepicker__day]:hover:!text-accent-foreground",
          "[&_.react-datepicker__day--selected]:!bg-primary [&_.react-datepicker__day--selected]:!text-primary-foreground [&_.react-datepicker__day--selected]:hover:!bg-primary",
          "[&_.react-datepicker__day--today]:!bg-accent [&_.react-datepicker__day--today]:!text-accent-foreground [&_.react-datepicker__day--today]:!font-semibold",
          "[&_.react-datepicker__day--disabled]:!text-muted-foreground [&_.react-datepicker__day--disabled]:!cursor-not-allowed [&_.react-datepicker__day--disabled]:!opacity-50",
          "[&_.react-datepicker__day--outside-month]:!text-muted-foreground [&_.react-datepicker__day--outside-month]:!opacity-50",
          "[&_.react-datepicker__navigation]:!top-3 [&_.react-datepicker__navigation]:hover:!text-foreground [&_.react-datepicker__navigation]:!text-muted-foreground",
          "[&_.react-datepicker__navigation-icon]:!top-1",
          "[&_.react-datepicker__triangle]:!hidden"
        )}
      />
    </div>
  )
}