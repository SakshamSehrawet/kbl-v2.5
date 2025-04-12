import { google } from "googleapis"

export async function GET() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)

    // Fix the private_key formatting
    credentials.private_key = credentials.private_key.replace(/\\n/g, "\n")

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    const sheets = google.sheets({ version: "v4", auth })
    const spreadsheetId = process.env.SPREADSHEET_ID
    const range = "Scoring!A1:ZZ100" // Ensure it covers all required columns

    const response = await sheets.spreadsheets.values.get({ spreadsheetId, range })

    const rows = response.data.values
    if (!rows || rows.length < 2) {
      return new Response(JSON.stringify({ message: "No data found" }), { status: 404 })
    }

    // Extract team data (ignore the first row - header, and second row - column labels)
    const teams = rows
      .slice(3)
      .map((row) => {
        // Start from index 3 to skip headers
        const teamName = row[0]?.trim() || ""
        const totalPoints = Number.parseFloat(row[1]) || 0

        // Extract match scores & points (starting from column index 2)
        const matches = []
        for (let i = 2; i < row.length; i += 2) {
          if (row[i]) {
            matches.push({
              match: Math.floor(i / 2), // Match number
              score: Number.parseFloat(row[i]) || 0,
              points: Number.parseFloat(row[i + 1]) || 0,
            })
          }
        }

        return { name: teamName, totalPoints, matches }
      })
      .filter((team) => team.name) // Remove empty rows

    return new Response(JSON.stringify({ teams }), { status: 200, headers: { "Content-Type": "application/json" } })
  } catch (error) {
    console.error("Error fetching scoring data:", error)
    return new Response(JSON.stringify({ error: "Failed to fetch scoring data" }), { status: 500 })
  }
}

