import { teamOwners } from "../../data/data.js"

export async function GET() {
  // Parse the team owners to extract team and owner
  const parsedTeamOwners = teamOwners.map((item) => {
    
      return {
        team: item.split(" (")[0],
        owner: item.split(" (")[1].slice(0, -1),
      }
  })

  return Response.json({ teamOwners: parsedTeamOwners })
}

