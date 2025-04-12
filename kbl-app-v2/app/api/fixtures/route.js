import { fixtures } from "../../data/data.js"

export async function GET() {
  return Response.json({ fixtures })
}

