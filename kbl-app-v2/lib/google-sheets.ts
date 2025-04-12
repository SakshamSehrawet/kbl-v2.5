import { google } from 'googleapis';

let cachedData: any = null; // Stores the latest fetched data
let lastFetchedTime: number = 0; // Timestamp of the last fetch
const POLL_INTERVAL = 3 * 60 * 1000; // Poll every 3 minutes

async function fetchData() {
    try {
        const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}');

        // Fix private_key formatting
        if (credentials.private_key) {
            credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
        }

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ["https://www.googleapis.com/auth/spreadsheets"]
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.SPREADSHEET_ID;
        const range = 'Scoring!A1:Z100';

        const response = await sheets.spreadsheets.values.get({ spreadsheetId, range });
        const rows = response.data.values;

        if (!rows || rows.length < 2) {
            throw new Error('No data found');
        }

        // Extract team data (skip headers)
        const teams = rows.slice(3).map(row => {
            const teamName = row[0]?.trim() || '';
            const totalPoints = parseFloat(row[1]) || 0;

            // Extract match scores & points (starting from column index 2)
            const matches = [];
            for (let i = 2; i < row.length; i += 2) {
                if (row[i]) {
                    matches.push({
                        match: Math.floor(i / 2), // Match number
                        score: parseFloat(row[i]) || 0,
                        points: parseFloat(row[i + 1]) || 0
                    });
                }
            }

            return { name: teamName, totalPoints, matches };
        }).filter(team => team.name);

        // Update cache
        cachedData = { teams, lastUpdated: new Date().toISOString() };
        lastFetchedTime = Date.now();
    } catch (error) {
        console.error('Error fetching scoring data:', error);
    }
}

// Initial fetch
fetchData();

// Start polling every 30 seconds
setInterval(fetchData, POLL_INTERVAL);

export async function GET() {
    if (!cachedData) {
        return new Response(JSON.stringify({ error: 'Data not available yet' }), { status: 503 });
    }

    return new Response(JSON.stringify(cachedData), { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
    });
}
