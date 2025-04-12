"use client"

import { useRef, useEffect, useState } from "react"
import { Calendar, Clock, MapPin, Search, Filter } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { fetchMatchSchedule } from "@/lib/sheets-api"

interface Match {
  id: number
  date: string
  fixture: string
  time: string
  venue: string
}

export default function MatchSchedule() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVenues, setSelectedVenues] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")

const todayMatchRef = useRef<HTMLDivElement | null>(null)

useEffect(() => {
  async function loadData() {
    try {
      // Fetch match schedule data
      const data = await fetchMatchSchedule()
      setMatches(data)
    } catch (error) {
      console.error("Failed to fetch match schedule:", error)
    } finally {
      setLoading(false)
    }
  }

  loadData()
}, [])

useEffect(() => {
  if (todayMatchRef.current) {
    todayMatchRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
  }
}, [matches]) // Runs when matches are loaded


if (loading) {
  return (
    <div className="flex justify-center items-center h-20">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
    </div>
  )
}

  // Get unique venues for filter
  const venues = Array.from(new Set(matches.map((match) => match.venue)))

  // Filter matches based on search query and selected venues
  const filteredMatches = matches.filter((match) => {
    const matchesSearch =
      match.fixture.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.date.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesVenue = selectedVenues.length === 0 || selectedVenues.includes(match.venue)

    return matchesSearch && matchesVenue
  })

  // Group matches by month
  const groupedMatches = filteredMatches.reduce(
    (groups, match) => {
      const month = match.date.split(",")[0].split(" ")[0]
      if (!groups[month]) {
        groups[month] = []
      }
      groups[month].push(match)
      return groups
    },
    {} as Record<string, Match[]>,
  )

  // Get team names from fixtures
  const getTeams = (fixture: string) => {
    if(fixture.includes(" vs ")){
      const teams = fixture.split(" vs ")
      return teams
    }
    else return "??"
  }

  // Get team abbreviation
  const getTeamAbbr = (teamName: string) => {
    return teamName
      .split(" ")
      .map((word) => word[0])
      .join("")
  }

  // Get team color
  const getTeamColor = (teamName: string) => {
    const teamColors: Record<string, string> = {
      "Mumbai Indians": "bg-blue-600",
      "Chennai Super Kings": "bg-yellow-500",
      "Royal Challengers Bengaluru": "bg-red-600",
      "Kolkata Knight Riders": "bg-purple-600",
      "Delhi Capitals": "bg-blue-500",
      "Sunrisers Hyderabad": "bg-orange-500",
      "Punjab Kings": "bg-red-500",
      "Rajasthan Royals": "bg-pink-500",
      "Gujarat Titans": "bg-teal-500",
      "Lucknow Super Giants": "bg-cyan-500",
    }

    // Find the team color by checking if the team name contains any of the keys
    for (const [team, color] of Object.entries(teamColors)) {
      if (teamName.includes(team)) {
        return color
      } 
    }

    // Default color if no match
    return "bg-gray-500"
  }

  const getMatchStatus = (matchDate: string) => {
    try {
      const today = new Date()
      const currentYear = today.getFullYear() // Get current year
  
      // Extract month and day from the matchDate string
      const [month, day] = matchDate.split(",")[0].split(" ")
  
      // Construct a valid date string
      const formattedDate = `${month} ${day}, ${currentYear}`
      const matchDateObj = new Date(formattedDate)
  
      // Ensure matchDateObj is valid
      if (isNaN(matchDateObj.getTime())) {
        console.error("Invalid match date:", matchDate)
        return "unknown"
      }
  
      const todayStr = today.toISOString().split("T")[0]
      const matchDateStr = matchDateObj.toISOString().split("T")[0]
  
      if (matchDateStr === todayStr) return "today"
      if (matchDateObj < today) return "past"
      return "future"
    } catch (error) {
      console.error("Error parsing match date:", matchDate, error)
      return "unknown"
    }
  }
  
  
  
  

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by team, venue, or date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" />
                <span>Venue</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {venues.map((venue) => (
                <DropdownMenuCheckboxItem
                  key={venue}
                  checked={selectedVenues.includes(venue)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedVenues([...selectedVenues, venue])
                    } else {
                      setSelectedVenues(selectedVenues.filter((v) => v !== venue))
                    }
                  }}
                >
                  {venue}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex rounded-md border">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode("list")}
            >
              List
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode("calendar")}
            >
              Calendar
            </Button>
          </div>
        </div>
      </div>

      {viewMode === "list" ? (
        <>
          {Object.entries(groupedMatches).map(([month, monthMatches]) => (
            <div key={month} className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                {month}
              </h3>
              <div className="grid gap-3">
                {monthMatches.map((match) => {
                  const [team1, team2] = getTeams(match.fixture)
                  const matchStatus = getMatchStatus(match.date)

                  return (
                    <Card
                        key={match.id}
                        ref={matchStatus === "today" ? todayMatchRef : null} // Attach ref only to today's match
                        className={`overflow-hidden match-card 
                          ${matchStatus === "today" ? "border-2 border-t-8 border-yellow-500 dark:border-yellow-400" : ""} 
                          ${matchStatus === "past" ? "opacity-50 dark:opacity-40" : ""}
                        `}
                      >
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          <div className="bg-primary text-primary-foreground p-4 flex flex-col justify-center items-center md:w-32">
                            <span className="text-2xl font-bold">{match.date.split(",")[0].split(" ")[1]}</span>
                            <span>{match.date.split(",")[1]}</span>
                          </div>
                          <div className="p-4 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
                              <div className="flex-1 flex items-center justify-between sm:justify-start gap-3">
                                <div
                                  className={`w-10 h-10 rounded-full ${getTeamColor(team1)} flex items-center justify-center text-white font-bold`}
                                >
                                  {getTeamAbbr(team1)}
                                </div>
                                <span className="font-semibold">vs</span>
                                <div
                                  className={`w-10 h-10 rounded-full ${getTeamColor(team2)} flex items-center justify-center text-white font-bold`}
                                >
                                  {getTeamAbbr(team2)}
                                </div>
                              </div>
                              <Badge variant="outline" className="w-fit">
                                Match #{match.id}
                              </Badge>
                            </div>
                            <h4 className="font-semibold text-lg mb-2">{match.fixture}</h4>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {match.time}
                              </div>
                              <div className="hidden sm:block">•</div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {match.venue}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMatches.map((match) => {
            const [team1, team2] = getTeams(match.fixture)
            return (
              <Card key={match.id} className="overflow-hidden match-card">
                <div className="h-2 bg-primary"></div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline">Match #{match.id}</Badge>
                    <div className="text-sm text-muted-foreground">{match.date}</div>
                  </div>

                  <div className="flex items-center justify-center gap-4 my-4">
                    <div className="text-center">
                      <div
                        className={`w-16 h-16 rounded-full ${getTeamColor(team1)} flex items-center justify-center text-white font-bold text-xl mx-auto`}
                      >
                        {getTeamAbbr(team1)}
                      </div>
                      <div className="mt-2 font-medium text-sm">{team1}</div>
                    </div>
                    <div className="font-bold text-xl">vs</div>
                    <div className="text-center">
                      <div
                        className={`w-16 h-16 rounded-full ${getTeamColor(team2)} flex items-center justify-center text-white font-bold text-xl mx-auto`}
                      >
                        {getTeamAbbr(team2)}
                      </div>
                      <div className="mt-2 font-medium text-sm">{team2}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {match.time}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {match.venue}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {filteredMatches.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No matches found matching your search criteria.</p>
        </div>
      )}
    </div>
  )
}

