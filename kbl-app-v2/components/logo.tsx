"use client"
import Image from "next/image"
import { useTheme } from "next-themes"

export function Logo() {
  const { theme } = useTheme()

  return (
    <div className="flex items-center gap-2">
      <Image
        src={theme === "dark" ? "light-logo.png" : "dark-logo.png"}
        alt="KUCHBHI League Logo"
        width={150}
        height={150}
        className="filter grayscale"
      />
    </div>
  )
}