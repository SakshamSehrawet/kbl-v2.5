"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function Logo() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Prevent rendering until mounted to avoid flash
    return <div style={{ width: 150, height: 150 }} />
  }

  const logoSrc = resolvedTheme === "dark" ? "light-logo.png" : "dark-logo.png"

  return (
    <div className="flex items-center gap-2">
      <Image
        src={logoSrc}
        alt="KUCHBHI League Logo"
        width={150}
        height={150}
        className="filter grayscale"
      />
    </div>
  )
}
