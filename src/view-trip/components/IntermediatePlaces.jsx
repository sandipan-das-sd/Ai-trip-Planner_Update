// import React from 'react';
// import { FaMapMarkerAlt, FaRoute } from 'react-icons/fa';
// import PlaceCardItem from './PlaceCardItem';

// function IntermediatePlaces({ trip }) {
//   // Check if intermediate places exist
//   const hasIntermediatePlaces = 
//     trip?.tripData?.intermediate_places && 
//     Array.isArray(trip.tripData.intermediate_places) && 
//     trip.tripData.intermediate_places.length > 0;

//   if (!hasIntermediatePlaces) {
//     return null; // Don't render anything if no intermediate places
//   }

//   return (
//     <div className="my-10">
//       <div className="flex items-center mb-6">
//         <FaRoute className="text-blue-500 mr-3 text-xl" />
//         <h2 className='font-bold text-2xl text-gray-800'>
//           Places to Visit Between {trip?.userSelection?.source?.label} and {trip?.userSelection?.location?.label}
//         </h2>
//       </div>

//       <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
//         <div className="text-blue-500 mr-3 mt-1">
//           <FaMapMarkerAlt />
//         </div>
//         <p className="text-blue-700">
//           These are interesting places you can visit on your way from {trip?.userSelection?.source?.label} to {trip?.userSelection?.location?.label}. 
//           Consider adding some of these stops to break up your journey.
//         </p>
//       </div>

//       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {trip.tripData.intermediate_places.map((place, index) => (
//           <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
//             <PlaceCardItem place={place} />
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default IntermediatePlaces;



import React, { useEffect, useState } from 'react';
import { FaMapMarkerAlt, FaRoute, FaInfoCircle, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import PlaceCardItem from './PlaceCardItem';
import { chatSession } from '../service/AIModel';

// API key for Google Maps
const API_KEY = "AIzaSyAf0ZvcA5XmS5iVs33z9lWbxQlGrTREdBo";

function IntermediatePlaces({ trip }) {
  const [intermediateOptions, setIntermediateOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if we already have intermediate places
    const hasIntermediatePlaces = 
      trip?.tripData?.intermediate_places && 
      Array.isArray(trip.tripData.intermediate_places) && 
      trip.tripData.intermediate_places.length > 0;
    
    // If we already have places, use those
    if (hasIntermediatePlaces) {
      setIntermediateOptions(trip.tripData.intermediate_places);
      setIsLoading(false);
      return;
    }
    
    // Only proceed if we have source and destination
    if (!trip?.userSelection?.source?.label || !trip?.userSelection?.location?.label) {
      setIsLoading(false);
      setError("Source or destination is missing");
      return;
    }

    const fetchInterestingPlaces = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const source = trip.userSelection.source.label;
        const destination = trip.userSelection.location.label;
        
        console.log(`Finding interesting places between ${source} and ${destination}`);
        
        // Prepare the prompt for OpenAI
        const prompt = generateOpenAIPrompt(source, destination);
        
        // Get places recommendations from OpenAI
        const aiResult = await getPlacesFromOpenAI(prompt);
        
        // If AI returned valid places, use them
        if (aiResult && aiResult.length > 0) {
          // Validate and enhance places with Geocoding API
          const validatedPlaces = await validatePlacesWithGeocoding(aiResult, source, destination);
          setIntermediateOptions(validatedPlaces);
        } else {
          // Fallback to manual data
          const fallbackPlaces = getManualPlacesAlongRoute(source, destination);
          setIntermediateOptions(fallbackPlaces);
        }
      } catch (error) {
        console.error("Error finding places:", error);
        setError(error.message);
        // If error occurs, use fallback data
        const fallbackPlaces = getManualPlacesAlongRoute(
          trip.userSelection.source.label, 
          trip.userSelection.location.label
        );
        setIntermediateOptions(fallbackPlaces);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterestingPlaces();
  }, [trip]);

  // Function to generate OpenAI prompt for place recommendations
  function generateOpenAIPrompt(source, destination) {
    return `Generate 5 interesting tourist places, attractions, or landmarks to visit between ${source} and ${destination} in India. 
    
These should be actual places along or near the route that travelers might stop at during their journey. 
    
Return the data as a JSON array of objects with this structure:
[
  {
    "name": "Place Name",
    "place": "Place Name",
    "details": "Brief description of the place (1-2 sentences)",
    "best_time_to_visit": "Best time to visit/opening hours",
    "ticket_pricing": "Entry fee or 'Free' if applicable",
    "rating": "4.5"
  }
]

Only include places that are actually between these two locations. Do NOT include places in either ${source} or ${destination} themselves. Ensure places are geographically between or reasonably near the route from ${source} to ${destination}.`;
  }

  // Function to get place recommendations from OpenAI
  async function getPlacesFromOpenAI(prompt) {
    try {
      const result = await chatSession.sendMessage(prompt);
      const responseText = result.response.text();
      
      // Parse the JSON from the response
      let parsedResult;
      try {
        // Find JSON in the response text
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        } else {
          // If no JSON array found, try parsing the entire response
          parsedResult = JSON.parse(responseText);
        }
      } catch (parseError) {
        console.error("Error parsing OpenAI response:", parseError);
        console.log("Raw response:", responseText);
        return [];
      }
      
      // If the response is an object with places property, use that
      if (Array.isArray(parsedResult)) {
        return parsedResult;
      } else if (parsedResult.places && Array.isArray(parsedResult.places)) {
        return parsedResult.places;
      } else {
        console.error("Unexpected response format from OpenAI");
        return [];
      }
    } catch (error) {
      console.error("Error calling OpenAI:", error);
      return [];
    }
  }

  // Function to validate and enhance places with Google Geocoding API
  async function validatePlacesWithGeocoding(places, source, destination) {
    const validatedPlaces = [];
    
    // First, geocode source and destination
    const sourceCoords = await geocodeLocation(source);
    const destCoords = await geocodeLocation(destination);
    
    if (!sourceCoords || !destCoords) {
      console.warn("Could not geocode source or destination");
      return places; // Return original places if geocoding fails
    }
    
    // Process each place
    for (const place of places) {
      try {
        // Geocode the place
        const searchTerm = `${place.name} ${place.place || ''} India`;
        const placeCoords = await geocodeLocation(searchTerm);
        
        if (!placeCoords) {
          console.warn(`Could not geocode place: ${place.name}`);
          continue; // Skip this place
        }
        
        // Check if place is between source and destination
        if (isPlaceBetween(sourceCoords, destCoords, placeCoords)) {
          // Enhanced place with coordinates
          validatedPlaces.push({
            ...place,
            place_name: place.name,
            geo_coordinates: `${placeCoords.lat},${placeCoords.lng}`,
            time: place.best_time_to_visit || "All day"
          });
        } else {
          console.log(`Place not between source and destination: ${place.name}`);
        }
      } catch (error) {
        console.error(`Error processing place ${place.name}:`, error);
      }
    }
    
    // If no places could be validated, return original list
    if (validatedPlaces.length === 0) {
      return places.map(place => ({
        ...place,
        place_name: place.name,
        time: place.best_time_to_visit || "All day"
      }));
    }
    
    return validatedPlaces;
  }

  // Function to geocode a location name to coordinates
  async function geocodeLocation(locationName) {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address: locationName,
            key: API_KEY
          }
        }
      );

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        return response.data.results[0].geometry.location;
      } else {
        console.warn(`Geocoding failed for ${locationName}: ${response.data.status}`);
        return null;
      }
    } catch (error) {
      console.error(`Error geocoding ${locationName}:`, error);
      return null;
    }
  }

  // Function to check if a place is geographically between source and destination
  function isPlaceBetween(source, destination, placeCoords) {
    // Create a bounding box for the route with buffer
    const minLat = Math.min(source.lat, destination.lat);
    const maxLat = Math.max(source.lat, destination.lat);
    const minLng = Math.min(source.lng, destination.lng);
    const maxLng = Math.max(source.lng, destination.lng);
    
    // Add a buffer zone (0.5 degrees, roughly 55km)
    const buffer = 0.5;
    
    // Check if place is within the bounding box (with buffer)
    const isWithinBox = 
      placeCoords.lat >= minLat - buffer && 
      placeCoords.lat <= maxLat + buffer &&
      placeCoords.lng >= minLng - buffer && 
      placeCoords.lng <= maxLng + buffer;
      
    if (!isWithinBox) {
      return false;
    }
    
    // Check if place isn't too close to source or destination (within 10km)
    const distanceToSource = calculateDistance(placeCoords, source);
    const distanceToDestination = calculateDistance(placeCoords, destination);
    
    if (distanceToSource < 10 || distanceToDestination < 10) {
      return false;
    }
    
    // Calculate route distance to check if detour is reasonable
    const routeDistance = calculateDistance(source, destination);
    const detourDistance = distanceToSource + distanceToDestination;
    
    // Allow a detour that's at most 50% longer than the direct route
    return detourDistance <= routeDistance * 1.5;
  }

  // Calculate distance between two points using Haversine formula
  function calculateDistance(point1, point2) {
    const toRad = value => value * Math.PI / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(point2.lat - point1.lat);
    const dLng = toRad(point2.lng - point1.lng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  }

  // Fallback function with manually curated list of popular places between major cities
  function getManualPlacesAlongRoute(source, destination) {
    // Convert source and destination to lowercase for easier comparison
    const sourceLower = source.toLowerCase();
    const destLower = destination.toLowerCase();
    
    // Popular routes in India with intermediate places
    let places = [];
    
    // Kolkata to Delhi route
    if ((sourceLower.includes('kolkata') && destLower.includes('delhi')) || 
        (sourceLower.includes('delhi') && destLower.includes('kolkata'))) {
      places = [
        {
          name: 'Bodh Gaya',
          place_name: 'Bodh Gaya',
          place: 'Bodh Gaya',
          geo_coordinates: '24.6961,84.9923',
          details: 'Bodh Gaya is a Buddhist pilgrimage site associated with Gautama Buddha\'s attainment of Enlightenment.',
          rating: '4.7',
          ticket_pricing: 'Free (Temple entry)',
          time: '6 AM - 9 PM'
        },
        {
          name: 'Varanasi',
          place_name: 'Varanasi',
          place: 'Varanasi',
          geo_coordinates: '25.3176,83.0130',
          details: 'One of the oldest continuously inhabited cities in the world and a major religious hub in India.',
          rating: '4.6',
          ticket_pricing: 'Free (Most ghats)',
          time: 'Best at sunrise/sunset'
        },
        {
          name: 'Allahabad (Prayagraj)',
          place_name: 'Allahabad',
          place: 'Allahabad',
          geo_coordinates: '25.4358,81.8464',
          details: 'The "City of Prime Ministers" is a sacred city situated at the confluence of three rivers.',
          rating: '4.4',
          ticket_pricing: 'Free (Most sites)',
          time: 'All day'
        },
        {
          name: 'Agra',
          place_name: 'Agra',
          place: 'Agra',
          geo_coordinates: '27.1767,78.0081',
          details: 'Home to the iconic Taj Mahal, Agra Fort, and Fatehpur Sikri.',
          rating: '4.8',
          ticket_pricing: 'Varies by monument',
          time: 'Sunrise to sunset'
        },
        {
          name: 'Jaipur',
          place_name: 'Jaipur',
          place: 'Jaipur',
          geo_coordinates: '26.9124,75.7873',
          details: 'The Pink City with magnificent forts, palaces, and vibrant markets.',
          rating: '4.7',
          ticket_pricing: 'Varies by site',
          time: '9 AM - 5 PM'
        }
      ];
    }
    // Mumbai to Delhi route
    else if ((sourceLower.includes('mumbai') && destLower.includes('delhi')) || 
             (sourceLower.includes('delhi') && destLower.includes('mumbai'))) {
      places = [
        {
          name: 'Udaipur',
          place_name: 'Udaipur',
          place: 'Udaipur',
          geo_coordinates: '24.5854,73.7125',
          details: 'Known as the "City of Lakes" with beautiful palaces and picturesque settings.',
          rating: '4.8',
          ticket_pricing: 'Varies by palace/museum',
          time: '9 AM - 5 PM'
        },
        {
          name: 'Jaipur',
          place_name: 'Jaipur',
          place: 'Jaipur',
          geo_coordinates: '26.9124,75.7873',
          details: 'The Pink City with magnificent forts, palaces, and vibrant markets.',
          rating: '4.7',
          ticket_pricing: 'Varies by site',
          time: '9 AM - 5 PM'
        },
        {
          name: 'Ajmer',
          place_name: 'Ajmer',
          place: 'Ajmer',
          geo_coordinates: '26.4499,74.6399',
          details: 'Home to the famous Ajmer Sharif Dargah and surrounded by Aravalli Hills.',
          rating: '4.5',
          ticket_pricing: 'Free (Dargah)',
          time: 'All day'
        }
      ];
    }
    // Generic fallback for other routes
    else {
      places = [
        {
          name: 'Tourist Attraction',
          place_name: 'Tourist Attraction',
          place: 'Tourist Attraction',
          geo_coordinates: '', // Will be filled if we can geocode
          details: `Interesting place to visit on your way from ${source} to ${destination}.`,
          rating: '4.5',
          ticket_pricing: 'Check at location',
          time: 'All day'
        }
      ];
      
      // Try to geocode source and destination to get midpoint
      geocodeLocation(source).then(sourceCoords => {
        if (sourceCoords) {
          geocodeLocation(destination).then(destCoords => {
            if (destCoords) {
              const midLat = (sourceCoords.lat + destCoords.lat) / 2;
              const midLng = (sourceCoords.lng + destCoords.lng) / 2;
              places[0].geo_coordinates = `${midLat},${midLng}`;
              
              // Update state if this happens after initial render
              if (intermediateOptions.length > 0 && !intermediateOptions[0].geo_coordinates) {
                setIntermediateOptions([...places]);
              }
            }
          });
        }
      });
    }
    
    return places;
  }

  // Don't render anything if no intermediate options or still loading with no data
  if (!intermediateOptions.length && !isLoading) {
    return null;
  }

  return (
    <div className="my-10">
      <div className="flex items-center mb-6">
        <FaRoute className="text-blue-500 mr-3 text-xl" />
        <h2 className='font-bold text-2xl text-gray-800'>
          Places to Visit Between {trip?.userSelection?.source?.label} and {trip?.userSelection?.location?.label}
        </h2>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center p-10">
          <FaSpinner className="animate-spin text-blue-500 mr-2" />
          <span>Finding interesting places along your route...</span>
        </div>
      ) : error ? (
        <div className="bg-yellow-50 p-4 rounded-lg mb-6 flex items-start">
          <div className="text-yellow-500 mr-3 mt-1">
            <FaInfoCircle />
          </div>
          <div>
            <p className="text-yellow-700 font-medium">Couldn't find new places</p>
            <p className="text-yellow-600 text-sm mt-1">
              {error}. Showing default recommendations.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
          <div className="text-blue-500 mr-3 mt-1">
            <FaMapMarkerAlt />
          </div>
          <p className="text-blue-700">
            These are interesting places you can visit on your way from {trip?.userSelection?.source?.label} to {trip?.userSelection?.location?.label}. 
            Consider adding some of these stops to break up your journey.
          </p>
        </div>
      )}
      
      {intermediateOptions.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {intermediateOptions.map((place, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <PlaceCardItem place={place} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default IntermediatePlaces;


