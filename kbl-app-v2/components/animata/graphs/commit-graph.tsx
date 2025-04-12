import { cn } from "@/lib/utils"

interface CommitGraphProps {
  data: number[][]
  className?: string
  colorScheme?: "default" | "rank"
  rank?: number
}

const getColor = (count: number, colorScheme: "default" | "rank" = "default", rank = 0): string => {
  if (colorScheme === "default") {
    const colors: { [key: number]: string } = {
      0: "bg-gray-300",
      1: "bg-green-200",
      2: "bg-green-400",
      3: "bg-green-600",
    }
    return colors[count] ?? "bg-green-700"
  } else {
    // Rank-based coloring (gold -> silver -> bronze)
    if (rank <= 3) {
      // Gold gradient for top ranks
      const colors: { [key: number]: string } = {
        0: "bg-yellow-100",
        1: "bg-yellow-200",
        2: "bg-yellow-300",
        3: "bg-yellow-400",
      }
      return colors[count] ?? "bg-yellow-500"
    } else if (rank <= 6) {
      // Silver gradient for middle ranks
      const colors: { [key: number]: string } = {
        0: "bg-gray-100",
        1: "bg-gray-200",
        2: "bg-gray-300",
        3: "bg-gray-400",
      }
      return colors[count] ?? "bg-gray-500"
    } else {
      // Bronze gradient for lower ranks
      const colors: { [key: number]: string } = {
        0: "bg-amber-100",
        1: "bg-amber-200",
        2: "bg-amber-300",
        3: "bg-amber-400",
      }
      return colors[count] ?? "bg-amber-500"
    }
  }
}

function CommitGraph({ data, className, colorScheme = "default", rank = 0 }: CommitGraphProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div id="contributions" className="flex gap-[2px]">
        {data.map((week, i) => (
          <div key={`week-${i}`} id={`week-${i}`} className="flex flex-col gap-[2px]">
            {week.map((commitCount, j) => (
              <div
                key={`week-${i}-day-${j}`}
                id={`week-${i}-day-${j}`}
                className={cn(
                  "h-3 w-3 sm:h-3 sm:w-3 md:h-3 md:w-3 rounded-md",
                  getColor(commitCount, colorScheme, rank),
                )}
                title={`Points: ${commitCount}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default CommitGraph

