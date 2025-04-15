# API Documentation for KBL Fantasy League

## Base URL
`https://kbl-v2.vercel.app/api/`

## Endpoints

### 1. Scoring
**Endpoint:** `/scoring`

**Description:**
Returns the scoring details of all teams, including total points and match-wise breakdown.

**Request:**
```http
GET /api/scoring
```

**Response:**
```json
{
  "teams": [
    {
      "name": "The HAMS (Saksham)",
      "totalPoints": 30,
      "matches": [
        { "match": 1, "score": 939, "points": 9 },
        { "match": 2, "score": 901, "points": 7 },
        { "match": 3, "score": 832, "points": 9 },
        { "match": 4, "score": 822, "points": 5 }
      ]
    },
    ...
  ]
}
```

### 2. Teams
**Endpoint:** `/teams`

**Description:**
Returns the list of teams along with their respective owners.

**Request:**
```http
GET /api/teams
```

**Response:**
```json
{
  "teamOwners": [
    { "team": "DS XI PRO MAX", "owner": "Dhruv" },
    { "team": "The HAMS", "owner": "Saksham" },
    ...
  ]
}
```

### 3. Fixtures
**Endpoint:** `/fixtures`

**Description:**
Returns the upcoming match fixtures with dates, teams, timings, and venue details.

**Request:**
```http
GET /api/fixtures
```

**Response:**
```json
{
  "fixtures": [
    {
      "match": 1,
      "date": "March 22, Saturday",
      "fixture": "Kolkata Knight Riders vs Royal Challengers Bengaluru",
      "time": "19:30",
      "venue": "Kolkata"
    },
    ...
  ]
}
```


## Usage
These API endpoints can be accessed using any HTTP client like Postman or directly via browser. Integrate these in your frontend to fetch and display league information dynamically.

## Try it Live
[Scoring](https://kbl-v1.vercel.app/api/scoring)  |  [Teams](https://kbl-v1.vercel.app/api/teams)  |  [Fixtures](https://kbl-v1.vercel.app/api/fixtures)  

