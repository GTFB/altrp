"use client"

import * as React from "react"
import PhoneInputWithCountry from "react-phone-number-input"
import "react-phone-number-input/style.css"
import { cn } from "@/lib/utils"
import type { Value as E164Number } from "react-phone-number-input"

export interface PhoneInputProps {
  value?: E164Number
  onChange?: (value: E164Number | undefined) => void
  disabled?: boolean
  placeholder?: string
  className?: string
  defaultCountry?: string
}

export function PhoneInput({
  value,
  onChange,
  disabled = false,
  placeholder = "Enter phone number",
  className,
  defaultCountry = "RU",
}: PhoneInputProps) {
  return (
    <PhoneInputWithCountry
      international
      defaultCountry={defaultCountry as any}
      value={value}
      onChange={(val) => onChange?.(val)}
      disabled={disabled}
      placeholder={placeholder}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  )
}

