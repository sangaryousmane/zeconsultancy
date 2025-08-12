"use client"

import * as React from "react"
import PhoneInput from "react-phone-number-input"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import "react-phone-number-input/style.css"

type PhoneNumber = string | undefined

export interface PhoneInputProps {
  id?: string
  label?: string
  value?: PhoneNumber
  onChange?: (value: PhoneNumber) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  required?: boolean
}

export function PhoneInputComponent({
  id,
  label,
  value,
  onChange,
  placeholder = "Enter phone number",
  disabled = false,
  className,
  required = false
}: PhoneInputProps) {
  const handleChange = (value: string | undefined) => {
    onChange?.(value)
  }
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      <PhoneInput
        id={id}
        international
        countryCallingCodeEditable={false}
        defaultCountry="US"

        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "phone-input",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        numberInputProps={{
          className: cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          )
        }}
        countrySelectProps={{
          className: cn(
            "flex h-10 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          )
        }}
      />
      <style jsx global>{`
        .phone-input {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .phone-input .PhoneInputCountry {
          flex-shrink: 0;
        }
        
        .phone-input .PhoneInputCountrySelect {
          border: 1px solid hsl(var(--border));
          border-radius: 6px;
          background: hsl(var(--background));
          padding: 8px 12px;
          font-size: 14px;
          min-width: 80px;
        }
        
        .phone-input .PhoneInputCountrySelect:focus {
          outline: none;
          ring: 2px;
          ring-color: hsl(var(--ring));
          ring-offset: 2px;
        }
        
        .phone-input .PhoneInputInput {
          flex: 1;
          border: 1px solid hsl(var(--border));
          border-radius: 6px;
          background: hsl(var(--background));
          padding: 8px 12px;
          font-size: 14px;
        }
        
        .phone-input .PhoneInputInput:focus {
          outline: none;
          ring: 2px;
          ring-color: hsl(var(--ring));
          ring-offset: 2px;
        }
        
        .phone-input .PhoneInputInput::placeholder {
          color: hsl(var(--muted-foreground));
        }
        
        .phone-input .PhoneInputCountryIcon {
          width: 20px;
          height: 15px;
          margin-right: 8px;
        }
      `}</style>
    </div>
  )
}