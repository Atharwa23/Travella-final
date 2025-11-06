export const SelectBudgetOptions = [
    {
        id:1,
        icon: "💵",
        title:"Cheap",
        desc: "Economize and Save"
    },
    {
        id: 2,
        icon: "💰",
        title:"Moderate",
        desc: "Balance Cost and Comfort"
    },
    {
        id:3,
        icon: "💎",
        title:"Luxury",
        desc: "Induldge without Limits"
    },
]

export const SelectNoOfPersons = [
    {
        id:1,
        icon: "🚶",
        title: "Solo",
        desc: "Discovering on Your Own",
        no: "1 Person"
    },
    {
        id:2,
        icon: "💑",
        title: "Partner",
        desc: "Exploring with a Loved One",
        no: "2 People"
    },
    {
        id:3,
        icon: "👨‍👩‍👧‍👦",
        title: "Family",
        desc: "Fun for All Ages",
        no: "3 to 5 People"
    },
    {
        id:4,
        icon: "🤝",
        title: "Friends",
        desc: "Adventure with Your Crew",
        no: "5 to 10 People"
    },
]

export const PROMPT = `
You are a JSON-only generator. Return exactly ONE valid JSON object (no extra text).

Schema you MUST follow:

{
  "tripOverview": {
    "location": string,
    "noOfDays": number,
    "people": number,
    "budget": string
  },
  "hotels": [
    {
      "hotelName": string,
      "description": string,
      "address": string,
      "rating": number,
      "price": string,
      "locationMap": string,
      "coordinates": {
        "latitude": number | null,
        "longitude": number | null
      },
      "imageUrl": string,
      "raw": object | null
    }
  ],
  "itinerary": {
    // ALWAYS use day1, day2, day3 style numeric keys
    "day1": {
      "theme": string,
      "morning": {
        "activity": string,
        "details": string,
        "timings": string,
        "pricing": string,
        "location": string,
        "imageURL": string,
        "coordinates": {
          "latitude": number | null,
          "longitude": number | null
        }
      },
      "afternoon": { /* same fields as morning */ },
      "evening": { /* same fields as morning */ }
      // optional extra time slots allowed (night etc.)
    },
    "day2": { ... }
  }
}

Rules:
- Output ONLY the JSON object, nothing else.
- If a field is unknown, return "" or null.
- Hotels must be an array.
- Pricing MUST respect the given budget.
- Images = imageURL or imageUrl allowed (both accepted).
- Coordinates numeric or null.
- activity must be the name of the place
- timings must also include time(12hr clock format) along with the parts of the day
- dont include resting and eating in the itinerary

Create the JSON for:
Location: {location}
Days: {noOfDays}
People: {People}
Budget: {Budget}
`
