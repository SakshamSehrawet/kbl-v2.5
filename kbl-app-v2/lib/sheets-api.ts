import { fetchScoring, fetchFixtures, fetchTeams } from "./api-service"

interface TeamWithMatches {
  team: string
  points: number
  matchesPlayed: number
  matches: any[]
  owner: string
}

interface TeamWithRank extends TeamWithMatches {
  rank: number
}

interface LeaderboardEntry extends TeamWithRank {
  previousRank?: number
}

// Fetch leaderboard data from the API
export async function fetchLeaderboardData() {
  try {
    const data = await fetchScoring()
    const teamsData = await fetchTeams()

    // Find the latest match number
    const allMatches = data.teams.flatMap((team) => team.matches.map((match) => match.match))
    const latestMatch = Math.max(...allMatches)
    const secondLatestMatch = latestMatch > 1 ? latestMatch - 1 : 1

    // Calculate current rankings
    const currentData: TeamWithMatches[] = data.teams.map((team) => {
      return {
        team: team.name,
        points: team.totalPoints,
        matchesPlayed: team.matches.length,
        matches: team.matches,
        owner: teamsData.teamOwners.find((t) => team.name.includes(t.team) || t.team.includes(team.name))?.owner || "Unknown",
      }
    })

    // Sort and assign ranks
    const currentRanked: TeamWithRank[] = currentData
      .sort((a, b) => b.points - a.points) // Sort by points in descending order
      .map((team, index, array) => {
        // Assign ranks, handling ties
        if (index > 0 && team.points === array[index - 1].points) {
          return { ...team, rank: (array[index - 1] as TeamWithRank).rank }
        }
        return { ...team, rank: index + 1 }
      })

    // Calculate previous rankings (up to second latest match)
    const previousData: TeamWithMatches[] = data.teams.map((team) => {
      // Calculate points up to the second latest match
      const pointsUpToSecondLatest = team.matches
        .filter((match) => match.match <= secondLatestMatch)
        .reduce((sum, match) => sum + match.points, 0)

      return {
        team: team.name,
        points: pointsUpToSecondLatest,
        matchesPlayed: team.matches.filter((match) => match.match <= secondLatestMatch).length,
        matches: team.matches.filter((match) => match.match <= secondLatestMatch),
        owner: teamsData.teamOwners.find((t) => team.name.includes(t.team) || t.team.includes(team.name))?.owner || "Unknown",
      }
    })

    // Sort and assign previous ranks
    const previousRanked: TeamWithRank[] = previousData
      .sort((a, b) => b.points - a.points) // Sort by points in descending order
      .map((team, index, array) => {
        // Assign ranks, handling ties
        if (index > 0 && team.points === array[index - 1].points) {
          return { ...team, rank: (array[index - 1] as TeamWithRank).rank }
        }
        return { ...team, rank: index + 1 }
      })

    // Combine current data with previous rankings
    const result: LeaderboardEntry[] = currentRanked.map((team) => {
      const previousTeam = previousRanked.find((p) => p.team === team.team)
      return {
        ...team,
        previousRank: previousTeam?.rank || team.rank,
      }
    })

    return result
  } catch (error) {
    console.error("Failed to fetch leaderboard data:", error)
    return []
  }
}

// Fetch team performance data from the API
export async function fetchTeamPerformanceData() {
  try {
    const data = await fetchScoring()
    const teamsData = await fetchTeams()

    // Transform the data to match the expected format
    return data.teams.map((team) => {
      // Find the team owner
      const teamOwner = teamsData.teamOwners.find((t) => team.name.includes(t.team) || t.team.includes(team.name))?.owner || "Unknown"

      return {
        team: team.name.split(" (")[0],
        owner: teamOwner,
        total: team.totalPoints,
        matches: team.matches.map((match) => ({
          match: `Match ${match.match}`,
          score: match.score,
          points: match.points,
        })),
      }
    })
  } catch (error) {
    console.error("Failed to fetch team performance data:", error)
    return []
  }
}

// Fetch match schedule from the API
export async function fetchMatchSchedule() {
  try {
    const data = await fetchFixtures()

    // Transform the data to match the expected format
    return data.fixtures.map((fixture) => ({
      id: fixture.match,
      date: fixture.date,
      fixture: fixture.fixture,
      time: fixture.time,
      venue: fixture.venue,
    }))
  } catch (error) {
    console.error("Failed to fetch match schedule:", error)
    return []
  }
}

