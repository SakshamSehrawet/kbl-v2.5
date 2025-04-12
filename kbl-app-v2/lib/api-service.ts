// API service for fetching data from the backend

// Types for API responses
export interface TeamOwner {
  team: string
  owner: string
}

export interface Match {
  match: number
  score: number
  points: number
}

export interface TeamData {
  name: string
  totalPoints: number
  matches: Match[]
}

export interface ScoringData {
  teams: TeamData[]
}

export interface Fixture {
  match: number
  date: string
  fixture: string
  time: string
  venue: string
}

export interface FixturesData {
  fixtures: Fixture[]
}

export interface TeamsData {
  teamOwners: TeamOwner[]
}

// API functions
export async function fetchScoring(): Promise<ScoringData> {
  try {
    const response = await fetch("/api/scoring")
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching scoring data:", error)
    throw error
  }
}

export async function fetchFixtures(): Promise<FixturesData> {
  try {
    const response = await fetch("/api/fixtures")
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching fixtures data:", error)
    throw error
  }
}

export async function fetchTeams(): Promise<TeamsData> {
  try {
    const response = await fetch("/api/teams")
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching teams data:", error)
    throw error
  }
}

// Helper function to get the current date and time as a formatted string
export function getCurrentDateTime(): string {
  return new Date().toISOString()
}

