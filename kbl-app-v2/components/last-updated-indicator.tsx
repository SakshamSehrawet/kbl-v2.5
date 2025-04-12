"use client"

import { useState, useEffect } from "react"
import { CircleCheckBig, RefreshCw } from "lucide-react"

export function LastUpdatedIndicator() {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const updateLastUpdated = () => {
      const now = new Date()
      const updatedDate = new Date()
      const formattedDate = formatDate(updatedDate, now)

      setLastUpdated(formattedDate)
      setLoading(false) // Stop loading once we have data
    }

    updateLastUpdated()

    // Update the time every minute
    const intervalId = setInterval(updateLastUpdated, 60000)

    return () => clearInterval(intervalId)
  }, [])

  const formatDate = (date: Date, now: Date) => {
    const dateString = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    const timeDifference = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)) // Difference in days

    if (timeDifference === 0) {
      return `Updated: Today at ${dateString}`
    } else if (timeDifference === 1) {
      return `Updated: Yesterday at ${dateString}`
    } else {
      return `Updated: ${timeDifference} days ago at ${dateString}`
    }
  }


  return (
    <div className="flex items-center text-xs text-muted-foreground">
      {loading ? (
        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
      ) : (
        <CircleCheckBig className="h-3 w-3 mr-1" /> 
      )}
      {loading ? "" : lastUpdated}
    </div>
  )
}

