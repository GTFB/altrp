"use client"

import * as React from "react"
import PhoneInputWithCountry, { getCountries } from "react-phone-number-input"
import "react-phone-number-input/style.css"
import { cn } from "@/lib/utils"
import type { Value as E164Number } from "react-phone-number-input"

// Dynamically import flags to avoid issues with SSR and production builds
let FlagsModule: typeof import("country-flag-icons/react/3x2") | null = null

const loadFlags = async () => {
  if (!FlagsModule) {
    try {
      FlagsModule = await import("country-flag-icons/react/3x2")
    } catch (error) {
      console.warn("Failed to load country flags:", error)
    }
  }
  return FlagsModule
}

// Create flags object for react-phone-number-input
// This maps country codes to React flag components from country-flag-icons
const createFlagsMap = (Flags: typeof import("country-flag-icons/react/3x2") | null): Record<string, React.ComponentType<{ className?: string; title?: string }>> => {
  const flagsMap: Record<string, React.ComponentType<{ className?: string; title?: string }>> = {}
  
  if (!Flags) return flagsMap
  
  try {
    const countries = getCountries()
    countries.forEach((country) => {
      const FlagComponent = Flags[country.toUpperCase() as keyof typeof Flags] as React.ComponentType<{ className?: string; title?: string }> | undefined
      
      if (FlagComponent) {
        flagsMap[country] = FlagComponent
      }
    })
  } catch (error) {
    console.warn("Failed to create flags map:", error)
  }
  
  return flagsMap
}

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
  const [flags, setFlags] = React.useState<Record<string, React.ComponentType<{ className?: string; title?: string }>>>({})
  
  React.useEffect(() => {
    loadFlags().then((Flags) => {
      if (Flags) {
        setFlags(createFlagsMap(Flags))
      }
    })
  }, [])

  return (
    <PhoneInputWithCountry
      international
      defaultCountry={defaultCountry as any}
      value={value}
      onChange={(val) => onChange?.(val)}
      disabled={disabled}
      placeholder={placeholder}
      flags={flags}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
    />
  )
}

