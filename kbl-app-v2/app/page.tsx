"use client"

import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight, Trophy, Github } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import LeaderboardTable from "@/components/leaderboard-table"
import MatchSchedule from "@/components/match-schedule"
import TeamPerformance from "@/components/team-performance"
import { ThemeToggle } from "@/components/theme-toggle"
import { LastUpdatedIndicator } from "@/components/last-updated-indicator"
import { Logo } from "@/components/logo"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background dark:bg-background">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-2 items-center">
            <Logo />
            
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <ThemeToggle />
              <Link href="https://github.com/SakshamSehrawet/kbl-v1" target="_blank">
                <Button variant="ghost" size="icon">
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </Button>
                
              </Link>
              <Link href="https://github.com/SakshamSehrawet/kbl-v1/blob/4ee06a9a6e237bed7c6dd68cd05c338536801055/kbl-app-v1/API_README.md" target="_blank">
                <Button variant="ghost" size="icon">
                  <span className="h-5 w-5" >API</span>
                  <span className="sr-only">GitHub</span>
                </Button>
                
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 py-2" id="dashboard">
        <div className="container px-[2px] md:px-6">
          <Tabs defaultValue="leaderboard" className="mt-8">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="leaderboard" className="text-sm sm:text-base">
                Leaderboard
              </TabsTrigger>
              <TabsTrigger value="performance" className="text-sm sm:text-base">
                Performance
              </TabsTrigger>
              <TabsTrigger value="schedule" className="text-sm sm:text-base">
                Schedule
              </TabsTrigger>
            </TabsList>
            <TabsContent value="leaderboard" className=" mt-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-3 team-card">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="flex items-center">
                        Current Standings
                      </CardTitle>
                      <LastUpdatedIndicator />
                    </div>
                  </CardHeader>
                  <CardContent >
                    <Suspense fallback={<LeaderboardSkeleton />}>
                      <LeaderboardTable />
                    </Suspense>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="performance" className="mt-6">
              <Card className="team-card">
                <CardHeader>
                  <CardTitle>Performance</CardTitle>
                  <CardDescription>Detailed performance of each team across all matches.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<PerformanceSkeleton />}>
                    <TeamPerformance />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="schedule" className="mt-6">
              <Card className="team-card">
                <CardHeader>
                  <CardTitle>Schedule</CardTitle>
                  <CardDescription>Complete schedule of IPL 2025 matches.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<ScheduleSkeleton />}>
                    <MatchSchedule />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <footer className="border-t py-6 md:py-0 bg-background dark:bg-background">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <Link href="https://dream11.com" target="_blank">
            <Button variant="ghost" size="icon">
              <span className="text-sm text-muted-foreground">Dream11 </span><ArrowRight />
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  )
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      {Array(10)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
        ))}
    </div>
  )
}

function PerformanceSkeleton() {
  return (
    <div className="space-y-4">
      {Array(10)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-1/4 rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
          </div>
        ))}
    </div>
  )
}

function ScheduleSkeleton() {
  return (
    <div className="space-y-4">
      {Array(10)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-2/3 rounded-md" />
            </div>
          </div>
        ))}
    </div>
  )
}

