"use client"

import { useEffect, useState } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchTeamPerformanceData } from "@/lib/sheets-api"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LastUpdatedIndicator } from "./last-updated-indicator"

interface MatchPerformance {
  match: string
  score: number
  points: number
}

interface TeamData {
  team: string
  owner: string
  total: number
  matches: MatchPerformance[]
}

export default function TeamPerformance() {
  const [teamData, setTeamData] = useState<TeamData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleString())

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch team performance data
        const data = await fetchTeamPerformanceData()
        setTeamData(data)

        // Update last refreshed time
        setLastRefreshed(new Date().toLocaleString())

        if (!selectedTeam && data.length > 0) {
          setSelectedTeam(data[0].team)
        }
      } catch (error) {
        console.error("Failed to fetch team performance data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Set up polling to refresh data every minute
    const intervalId = setInterval(loadData, 60000)

    return () => clearInterval(intervalId)
  }, [selectedTeam])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-500"></div>
      </div>
    )
  }

  // Prepare data for the points chart
  const pointsChartData = teamData
    .map((team) => ({
      name: team.team,
      points: team.total,
    }))
    .sort((a, b) => b.points - a.points)

  // Prepare data for the match-wise performance chart
  const matchWiseData = teamData.reduce(
    (acc, team) => {
      team.matches.forEach((match) => {
        const matchNumber = match.match
        if (!acc[matchNumber]) {
          acc[matchNumber] = {}
        }
        acc[matchNumber][team.team] = match.points
      })
      return acc
    },
    {} as Record<string, Record<string, number>>,
  )

  const matchWiseChartData = Object.entries(matchWiseData).map(([match, teams]) => ({
    match,
    ...teams,
  }))

  // Prepare data for the selected team's performance
  const selectedTeamData = teamData.find((team) => team.team === selectedTeam)

  const selectedTeamMatchData =
    selectedTeamData?.matches.map((match) => ({
      name: match.match,
      score: match.score,
      points: match.points,
    })) || []

  // Prepare data for radar chart
  const radarData = teamData.map((team) => {
    const matchData = team.matches.reduce(
      (acc, match) => {
        acc[match.match] = match.points
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      team: team.team,
      ...matchData,
    }
  })

  // Prepare data for pie chart
  const pieData = teamData.map((team) => ({
    name: team.team,
    value: team.total,
  }))

  const COLORS = [
    "#3b82f6",
    "#ef4444",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#06b6d4",
    "#f97316",
    "#6366f1",
    "#14b8a6",
  ]

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-orange-500",
      "bg-cyan-500",
    ]

    // Simple hash function to get consistent color for a name
    const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <LastUpdatedIndicator></LastUpdatedIndicator>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="comparison">Compare</TabsTrigger>
          <TabsTrigger value="table">Table</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Total Points Distribution</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pointsChartData} layout="vertical">
                    <CartesianGrid horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={window.innerWidth < 768 ? 100 : 150}/>
                    <Tooltip
                      formatter={(value) => [`${value} points`, "Total"]}
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar dataKey="points" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Points Distribution</h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} points`, "Total"]}
                        contentStyle={{
                          backgroundColor: "var(--background)",
                          border: "1px solid var(--border)",
                          borderRadius: "0.5rem",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <Card>
          <CardHeader>
              {/* Mobile: Dropdown Selector */}
              <div className="md:hidden">
                <select
                  className="w-full p-2 border rounded-md text-sm"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                >
                  {teamData.map((team) => (
                    <option key={team.team} value={team.team}>
                      {team.team + " (" + team.owner +")"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tablet & Desktop: Grid Layout */}
              <div className="hidden md:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {teamData.map((team) => (
                  <Card
                    key={team.team}
                    className={`team-card cursor-pointer ${selectedTeam === team.team ? "ring-2 ring-primary" : ""}`}
                    onClick={() => setSelectedTeam(team.team)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className={`h-10 w-10 ${getAvatarColor(team.team)}`}>
                          <AvatarFallback>{getInitials(team.team)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-sm">{team.team}</h3>
                          <p className="text-xs text-muted-foreground">{team.owner}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{team.total}</div>
                        <div className="text-xs text-muted-foreground">points</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div className="flex items-center gap-3 mb-4 md:mb-0">
                  <Avatar className={`h-12 w-12 ${getAvatarColor(selectedTeam || "")}`}>
                    <AvatarFallback>{getInitials(selectedTeam || "")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-bold">{selectedTeam}</h3>
                    <p className="text-sm text-muted-foreground">Owner: {selectedTeamData?.owner}</p>
                    <p className="text-sm text-muted-foreground">{selectedTeamData?.matches.length} matches played</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{selectedTeamData?.total}</div>
                  <div className="text-sm text-muted-foreground">total points</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Match Performance</h4>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={selectedTeamMatchData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
                        <YAxis yAxisId="right" orientation="right" stroke="#ef4444" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--background)",
                            border: "1px solid var(--border)",
                            borderRadius: "0.5rem",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Legend />
                        <Bar yAxisId="left" dataKey="points" fill="#3b82f6" name="Points" radius={[4, 4, 0, 0]} />
                        <Bar
                          yAxisId="right"
                          dataKey="score"
                          fill="#ef4444"
                          name="Dream11 Score"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold mb-4">Points Trend</h4>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedTeamMatchData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--background)",
                            border: "1px solid var(--border)",
                            borderRadius: "0.5rem",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="points"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          name="Points"
                          dot={{ r: 6 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Team Comparison</h3>
              <div className="h-[500px] w-full overflow-x-auto flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart
                    outerRadius={window.innerWidth < 768 ? 120 : 250} // Reduce radius for mobile
                    data={matchWiseChartData}
                  >
                    <PolarGrid />
                    <PolarAngleAxis 
                      dataKey="match" 
                      tick={{ fontSize: window.innerWidth < 768 ? 10 : 12 }} // Smaller font for mobile
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 12]} tick={{ fontSize: 10 }} />
                    {teamData.map((team, index) => (
                      <Radar
                        key={team.team}
                        name={team.team}
                        dataKey={team.team}
                        stroke={COLORS[index % COLORS.length]}
                        fill={COLORS[index % COLORS.length]}
                        fillOpacity={0.15}
                      />
                    ))}
                    <Legend wrapperStyle={{ fontSize: window.innerWidth < 768 ? 10 : 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        <TabsContent value="table" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Team</th>
                      <th className="text-left py-2 px-4">Owner</th>
                      <th className="text-center py-2 px-4">Total</th>
                      {Array.from({ length: Math.max(...teamData.map((t) => t.matches.length)) }, (_, i) => (
                        <th key={i} className="text-center py-2 px-4 whitespace-nowrap">
                          <div>Match {i + 1}</div>
                          <div className="text-xs text-muted-foreground">Score</div>
                          <div className="text-xs text-muted-foreground">Points</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {teamData
                      .sort((a, b) => b.total - a.total)
                      .map((team) => (
                        <tr key={team.team} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-4">
                            <div className="flex items-center gap-2">
                              <Avatar className={`h-8 w-8 ${getAvatarColor(team.team)}`}>
                                <AvatarFallback>{getInitials(team.team)}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{team.team}</span>
                            </div>
                          </td>
                          <td className="py-2 px-4">{team.owner}</td>
                          <td className="py-2 px-4 text-center font-bold">{team.total}</td>
                          {Array.from({ length: Math.max(...teamData.map((t) => t.matches.length)) }, (_, i) => {
                            const match = team.matches.find((m) => m.match === `Match ${i + 1}`)
                            return (
                              <td key={i} className="py-2 px-4 text-center">
                                <div>{match?.score || "-"}</div>
                                <div className="font-semibold">{match?.points || "-"}</div>
                              </td>
                            )
                          })}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

