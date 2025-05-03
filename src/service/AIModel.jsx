import { OpenAI } from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Required for client-side usage
});

// Configuration for OpenAI API calls
const openAIConfig = {
  model: "gpt-3.5-turbo", // Using GPT-3.5 Turbo model
  temperature: 1,
  max_tokens: 4000, // Maximum tokens for response
  response_format: { type: "json_object" }, // Ensure JSON response
};

// Create a chat session object that mimics the Gemini API interface
class ChatSession {
  constructor() {
    this.messages = [
      {
        role: "system",
        content:
          "You are a travel planning assistant. Provide detailed travel plans in JSON format with hotel options, itineraries, and places to visit. Include specific details like geo coordinates, prices, ratings, and descriptions.",
      },
      {
        role: "user",
        content:
          "Generate Travel Plan for Location : Las Vegas, for 3 Days for Couple with a Cheap budget ,Give me a Hotels options list with Hotel Name, Hotel address, Price, hotel image url, geo coordinates, rating, descriptions and suggest itinerary with place Name, Place Details, Place Image Url, Geo Coordinates, ticket Pricing, rating, Time travel each of the location for 3 days with each day plan with best time to visit in JSON format",
      },
      {
        role: "assistant",
        content: `{
  "hotel_options": [
    {
      "name": "The D Las Vegas",
      "address": "301 Fremont Street, Las Vegas, NV 89101",
      "price": "from $35/night",
      "image_url": "https://www.thedorleans.com/media/images/hero-images/hero-home-new.jpg",
      "geo_coordinates": "36.1696,-115.1420",
      "rating": "4.0 stars",
      "description": "Located in the heart of Downtown Las Vegas, The D is a budget-friendly option with a retro vibe. It offers a casino, multiple dining options, and a rooftop pool."
    },
    {
      "name": "Circus Circus Hotel & Casino",
      "address": "2880 Las Vegas Blvd S, Las Vegas, NV 89109",
      "price": "from $40/night",
      "image_url": "https://media.cntraveler.com/photos/5e3c1834794e280008b6420d/master/pass/circus-circus-hotel-and-casino-las-vegas-01.jpg",
      "geo_coordinates": "36.1183,-115.1694",
      "rating": "3.5 stars",
      "description": "Known for its circus-themed attractions, Circus Circus offers a family-friendly atmosphere with affordable accommodations, a large casino, and a midway with carnival games."
    },
    {
      "name": "Golden Nugget Hotel & Casino",
      "address": "129 E Fremont St, Las Vegas, NV 89101",
      "price": "from $50/night",
      "image_url": "https://www.goldennugget.com/las-vegas/images/hero-image-las-vegas-hotel.jpg",
      "geo_coordinates": "36.1684,-115.1419",
      "rating": "4.5 stars",
      "description": "A historic and glamorous hotel located on Fremont Street, Golden Nugget boasts a world-class casino, multiple restaurants, a large pool complex, and a shark tank."
    }
  ],
  "itinerary": [
    {
      "day": "Day 1",
      "plan": [
        {
          "time": "Morning (9:00 AM - 12:00 PM)",
          "place": "Fremont Street Experience",
          "details": "Explore the vibrant Fremont Street Experience, a pedestrian mall with live music, street performers, and the famous Viva Vision light show.",
          "image_url": "https://www.visitlasvegas.com/media/2015/11/Fremont-Street-Experience.jpg",
          "geo_coordinates": "36.1696,-115.1420",
          "ticket_pricing": "Free",
          "rating": "4.5 stars"
        },
        {
          "time": "Afternoon (12:00 PM - 3:00 PM)",
          "place": "Pinball Hall of Fame",
          "details": "Play classic pinball machines from all eras at the Pinball Hall of Fame, a fun and nostalgic experience.",
          "image_url": "https://www.pinballhalloffame.org/img/slideshow/slider_img_02.jpg",
          "geo_coordinates": "36.1708,-115.1434",
          "ticket_pricing": "$15 per person",
          "rating": "4.0 stars"
        },
        {
          "time": "Evening (7:00 PM - 10:00 PM)",
          "place": "The Neon Museum",
          "details": "Take a guided tour of the Neon Museum, a collection of iconic Las Vegas signs from the past.",
          "image_url": "https://www.neonmuseum.org/wp-content/uploads/2018/12/NEON-MUSEUM-LAS-VEGAS-SIGN-TOUR-IMAGE.jpg",
          "geo_coordinates": "36.1745,-115.1443",
          "ticket_pricing": "$25 per person",
          "rating": "4.5 stars"
        }
      ]
    },
    {
      "day": "Day 2",
      "plan": [
        {
          "time": "Morning (10:00 AM - 1:00 PM)",
          "place": "Hoover Dam",
          "details": "Take a day trip to Hoover Dam, an engineering marvel and a popular tourist destination.",
          "image_url": "https://www.nps.gov/articles/000/images/hoover-dam_06.jpg",
          "geo_coordinates": "36.0288,-114.9667",
          "ticket_pricing": "Free admission",
          "rating": "4.5 stars"
        },
        {
          "time": "Afternoon (2:00 PM - 5:00 PM)",
          "place": "Red Rock Canyon National Conservation Area",
          "details": "Hike or drive through the stunning Red Rock Canyon, offering beautiful rock formations and scenic views.",
          "image_url": "https://www.nps.gov/articles/000/images/red-rock-canyon-01.jpg",
          "geo_coordinates": "36.1000,-115.2500",
          "ticket_pricing": "$15 per vehicle",
          "rating": "4.5 stars"
        },
        {
          "time": "Evening (7:00 PM - 10:00 PM)",
          "place": "Free Show on the Strip",
          "details": "Catch a free show on the Las Vegas Strip, such as the Bellagio Fountains or the volcano at the Mirage.",
          "image_url": "https://www.bellagio.com/content/dam/mgmresorts/bellagio/images/bellagio-fountains-hero-mobile.jpg",
          "geo_coordinates": "36.1140,-115.1720",
          "ticket_pricing": "Free",
          "rating": "4.5 stars"
        }
      ]
    },
    {
      "day": "Day 3",
      "plan": [
        {
          "time": "Morning (10:00 AM - 12:00 PM)",
          "place": "The LINQ Promenade",
          "details": "Stroll along the LINQ Promenade, a shopping and dining area with a High Roller observation wheel.",
          "image_url": "https://www.caesars.com/content/dam/caesars/linq/images/hero-image-linq-promenade-mobile.jpg",
          "geo_coordinates": "36.1166,-115.1709",
          "ticket_pricing": "From $25 for the High Roller",
          "rating": "4.0 stars"
        },
        {
          "time": "Afternoon (12:00 PM - 3:00 PM)",
          "place": "The Mob Museum",
          "details": "Learn about the history of organized crime in Las Vegas at the Mob Museum, a fascinating and interactive experience.",
          "image_url": "https://www.themobmuseum.org/media/images/hero/mob-museum-exterior-1200x560-2022-08-03_11-49-03.jpg",
          "geo_coordinates": "36.1690,-115.1438",
          "ticket_pricing": "$25 per person",
          "rating": "4.5 stars"
        },
        {
          "time": "Evening (7:00 PM - 10:00 PM)",
          "place": "Buffet Dinner",
          "details": "Enjoy a budget-friendly buffet dinner at one of the many casinos on the Strip.",
          "image_url": "https://www.caesars.com/content/dam/caesars/paris/images/restaurants/buffet-paris.jpg",
          "geo_coordinates": "36.1140,-115.1720",
          "ticket_pricing": "Varies by casino and buffet",
          "rating": "4.0 stars"
        }
      ]
    }
  ]
}`,
      },
    ];
  }

  // Method to send a message to the OpenAI API
  async sendMessage(message) {
    try {
      // Add the new user message to the conversation history
      this.messages.push({
        role: "user",
        content: message,
      });

      // Make the API call to OpenAI
      const response = await openai.chat.completions.create({
        ...openAIConfig,
        messages: this.messages,
      });

      // Extract the response content
      const responseContent = response.choices[0].message.content;

      // Add the assistant's response to the conversation history
      this.messages.push({
        role: "assistant",
        content: responseContent,
      });

      // Return a response object that mimics the Gemini API response structure
      return {
        response: {
          text: () => responseContent,
        },
      };
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      throw error;
    }
  }
}

// Export the chat session instance
export const chatSession = new ChatSession();
