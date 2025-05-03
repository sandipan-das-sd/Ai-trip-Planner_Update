// export const SelectTravelList = [
//     {
//         id:1,
//         title: 'Just Me',
//         desc: 'A sole traveles in exploration',
//         icon: '✈️',
//         people:'1 person'
//     },
//     {
//         id:2,
//         title: 'A Couple',
//         desc: 'Two traveles in tandem',
//         icon: '🥂',
//         people:'2 people'
//     },
//     {
//         id:3,
//         title: 'Family',
//         desc: 'A group of fun loving adv',
//         icon: '🏡',
//         people:'3 to 5 People'
//     },
//     {
//         id:4,
//         title: 'Friends',
//         desc: 'A bunch of thrill-seekes',
//         icon: '⛵',
//         people:'5 to 10 people'
//     }
// ]

// export const SelectBudgetOptions = [
//     {
//         id:1,
//         title: 'Cheap',
//         desc: 'Stay conscious of costs',
//         icon: '💵',
//     },
//     {
//         id:2,
//         title: 'Moderate',
//         desc: 'Keep cost on the average side',
//         icon: '💰',
//     },
//     {
//         id:3,
//         title: 'Luxury',
//         desc: 'Dont worry about cost',
//         icon: '💸',
//     }
// ]

// export const AI_PROMPT = 'Generate Travel Plan for Location : {location}, for {totalDays} Days for {traveler} with a {budget} budget ,Give me a Hotels options list with Hotel Name, Hotel address, Price, hotel image url, geo coordinates, rating, descriptions and suggest itinerary with place Name, Place Details, Place Image Url, Geo Coordinates, ticket Pricing, rating, Time travel each of the location for {totalDays} days with each day plan with best time to visit in JSON format'

// Example constants file with updated AI prompt

export const AI_PROMPT = `Generate Travel Plan for Location: {location}, for {totalDays} Days from {startDate} to {endDate} for {traveler} with a {budget} budget.

Give me a Hotels options list with Hotel Name, Hotel address, Price, hotel image url, geo coordinates, rating, descriptions. Include budget information for each hotel so they can be filtered by price range.

Also suggest an itinerary with place Name, Place Details, Place Image Url, Geo Coordinates, ticket Pricing, rating, Time travel each of the location for {totalDays} days with each day plan with best time to visit. IMPORTANT: Day numbering should start from 1 (not from 0).

If traveling from {source} to {location}, suggest interesting places to visit between these two locations.

Return all information in JSON format with the following structure:
{
  "hotel_options": [...],
  "itinerary": {
    "day1": { "plan": [...] },
    "day2": { "plan": [...] },
    ...
  },
  "intermediate_places": [...]
}`;

export const SelectBudgetOptions = [
  {
    icon: "💰",
    title: "Budget",
    desc: "Looking for affordable options",
  },
  {
    icon: "💵",
    title: "Moderate",
    desc: "Willing to spend a bit more",
  },
  {
    icon: "💎",
    title: "Luxury",
    desc: "Want the best experience",
  },
];

export const SelectTravelList = [
  {
    icon: "👫",
    title: "Couple",
    people: "Couple",
    desc: "Romantic getaway",
  },
  {
    icon: "👨‍👩‍👧‍👦",
    title: "Family",
    people: "Family",
    desc: "Family-friendly options",
  },
  {
    icon: "👥",
    title: "Friends",
    people: "Friends",
    desc: "Fun with friends",
  },
];
