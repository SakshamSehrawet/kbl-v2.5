"use client"

import { useEffect, useState, useRef } from "react"
import { Trophy, ChevronUp, ChevronDown, Minus, Star, Share2, Camera  } from "lucide-react"
import html2canvas from "html2canvas"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { fetchLeaderboardData } from "@/lib/sheets-api"

import CommitGraph from "@/components/animata/graphs/commit-graph"
interface LeaderboardEntry {
  rank: number
  team: string
  matchesPlayed: number
  points: number
  previousRank?: number
  owner?: string
  matches?: Array<{
    match: number
    score: number
    points: number
  }>
}

export default function LeaderboardTable() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const leaderboardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchLeaderboardData()

        // Sort by points in descending order
        const sortedData = [...data].sort((a, b) => b.points - a.points)

        // Assign ranks, properly handling multi-way ties
        let currentRank = 1
        let currentPoints = -1
        let sameRankCount = 0

        const rankedData = sortedData.map((team, index) => {
          // If this is a new points value, assign a new rank
          if (team.points !== currentPoints) {
            currentRank = index + 1
            currentPoints = team.points
            sameRankCount = 0
          } else {
            // This is a tie, keep the same rank
            sameRankCount++
          }

          return {
            ...team,
            rank: currentRank,
          }
        })

        setLeaderboard(rankedData)
      } catch (error) {
        console.error("Failed to fetch leaderboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Poll data every minute
    const intervalId = setInterval(loadData, 60000)
    return () => clearInterval(intervalId)
  }, [])


  if (loading) {
    return (
      <div className="flex justify-center items-center h-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    )
  }
  

  const getInitials = (name: string) => {
    return name
      .split(" (")[0]
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const getAvatarColor = (name: string) => {
    const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500"]
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  const getRankChange = (current: number, previous?: number) => {
    if (!previous || current === previous) return <Minus className="h-4 w-4 text-gray-400" />
    return current < previous ? (
      <div className="flex items-center text-green-500">
        <ChevronUp className="h-6 w-6 mr-1" />
        <span className="text-xs">{previous - current}</span>
      </div>
    ) : (
      <div className="flex items-center text-red-500">
        <ChevronDown className="h-6 w-6 mr-1" />
        <span className="text-xs">{current - previous}</span>
      </div>
    )
  }

  // Convert match data to commit graph format
  const getCommitGraphData = (matches?: Array<{ match: number; points: number }>) => {
    if (!matches || matches.length === 0) {
      return [Array(7).fill(0)]
    }

    const rows = 3;

    // Create a 2D array for the commit graph
    // We'll use a single row with points data
    const graphData: number[][] = []

    // Group matches into weeks (7 matches per week)
    const maxMatch = Math.max(...matches.map((m) => m.match))
    const weeks = Math.ceil(maxMatch / rows)

    for (let week = 0; week < weeks; week++) {
      const weekData: number[] = []
      for (let day = 0; day < rows; day++) {
        const matchNumber = week * rows + day + 1
        const match = matches.find((m) => m.match === matchNumber)
        weekData.push(match ? Math.min(3, Math.floor(match.points / 3)) : 0)
      }
      graphData.push(weekData)
    }

    return graphData
  }

  // Get teams that rank 1, 2, or 3 (considering ties)
  const topTeams = leaderboard.filter((entry) => entry.rank <= 3)

  return (
    <div  className="space-y-6 bg-transparent hover:bg-transparent">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {topTeams.map((entry) => (
          <Card
            key={entry.team}
            className={`overflow-hidden bg-transparent hover:bg-transparent ${entry.rank === 1 ? "border-yellow-500" : entry.rank === 2 ? "border-gray-400" : "border-amber-700"}`}
          >
            <div className={`h-2 ${entry.rank === 1 ? "bg-yellow-500" : entry.rank === 2 ? "bg-gray-400" : "bg-amber-700"}`}></div>
            <CardContent className="pt-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className={`h-12 w-12 ${getAvatarColor(entry.team)}`}>
                    <AvatarFallback>{getInitials(entry.team)}</AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -right-1 rounded-full bg-background flex items-center justify-center w-6 h-6 border-2 border-background">
                    <Trophy className={`h-3 w-3 ${entry.rank === 1 ? "text-yellow-500" : entry.rank === 2 ? "text-gray-400" : "text-amber-700"}`} />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold">{entry.team.split(" (")[0]}</h3>
                  <p className="text-sm text-muted-foreground">{entry.owner}</p>
                  <p className="text-xs text-muted-foreground">{entry.matchesPlayed} matches</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{entry.points}</div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div ref={leaderboardRef} className="px-[2px]rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Rank</TableHead>
              <TableHead>Team</TableHead>
              <TableHead className="text-center w-[100px]">Points</TableHead>
              <TableHead className="items-center w-[100px]">Movement</TableHead>
              <TableHead className="text-center">History</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.map((entry) => {
              // Convert match data to commit graph format
              const commitGraphData = getCommitGraphData(entry.matches)

              return (
              <TableRow key={entry.team} className={entry.rank <= 3 ? "bg-muted/10" : ""}>
                <TableCell className="font-medium">
                  <div className="flex items-center">
                    {entry.rank <= 3 && <Trophy className={`h-5 w-5 mr-1 ${entry.rank === 1 ? "text-yellow-500" : entry.rank === 2 ? "text-gray-400" : "text-amber-700"}`} />}
                    {entry.rank}
                  </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className={`h-8 w-8 ${getAvatarColor(entry.team)}`}>
                        <AvatarFallback>{getInitials(entry.team)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <span className="font-medium">{entry.team.split(" (")[0]}</span>
                        <span className="text-xs text-muted-foreground block">{entry.owner}</span>
                      </div>
                    </div>
                </TableCell>
                <TableCell className="text-center">
                  <div>
                    <span className="font-medium">{entry.points}</span>
                    <span className="text-xs text-muted-foreground block">{entry.matchesPlayed}</span>
                  </div>
                </TableCell>
                <TableCell className="flex flex-col items-center justify-center">{getRankChange(entry.rank, entry.previousRank)}</TableCell>
                  <TableCell className="text-center font-bold relative">
                    <div className=" items-center justify-center overflow-hidden">
                    <CommitGraph data={commitGraphData} colorScheme="default" rank={entry.rank} />
                    </div>
                  </TableCell>
              </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
