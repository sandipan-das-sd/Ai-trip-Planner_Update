// // import React from 'react';
// // import { FaMapMarkerAlt, FaRoute } from 'react-icons/fa';
// // import PlaceCardItem from './PlaceCardItem';

// // function IntermediatePlaces({ trip }) {
// //   // Check if intermediate places exist
// //   const hasIntermediatePlaces = 
// //     trip?.tripData?.intermediate_places && 
// //     Array.isArray(trip.tripData.intermediate_places) && 
// //     trip.tripData.intermediate_places.length > 0;

// //   if (!hasIntermediatePlaces) {
// //     return null; // Don't render anything if no intermediate places
// //   }

// //   return (
// //     <div className="my-10">
// //       <div className="flex items-center mb-6">
// //         <FaRoute className="text-blue-500 mr-3 text-xl" />
// //         <h2 className='font-bold text-2xl text-gray-800'>
// //           Places to Visit Between {trip?.userSelection?.source?.label} and {trip?.userSelection?.location?.label}
// //         </h2>
// //       </div>

// //       <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
// //         <div className="text-blue-500 mr-3 mt-1">
// //           <FaMapMarkerAlt />
// //         </div>
// //         <p className="text-blue-700">
// //           These are interesting places you can visit on your way from {trip?.userSelection?.source?.label} to {trip?.userSelection?.location?.label}. 
// //           Consider adding some of these stops to break up your journey.
// //         </p>
// //       </div>

// //       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
// //         {trip.tripData.intermediate_places.map((place, index) => (
// //           <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
// //             <PlaceCardItem place={place} />
// //           </div>
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }

// // export default IntermediatePlaces;



// import React, { useEffect, useState } from 'react';
// import { FaMapMarkerAlt, FaRoute, FaInfoCircle, FaSpinner, FaSearch } from 'react-icons/fa';
// import axios from 'axios';
// import PlaceCardItem from './PlaceCardItem';
// import { chatSession } from '../../service/AIModel';

// // API key for Google Maps
// const API_KEY = "AIzaSyAf0ZvcA5XmS5iVs33z9lWbxQlGrTREdBo";

// function IntermediatePlaces({ trip }) {
//   const [intermediateOptions, setIntermediateOptions] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [retryCount, setRetryCount] = useState(0);

//   useEffect(() => {
//     // Check if we already have intermediate places
//     const hasIntermediatePlaces = 
//       trip?.tripData?.intermediate_places && 
//       Array.isArray(trip.tripData.intermediate_places) && 
//       trip.tripData.intermediate_places.length > 0;
    
//     // If we already have places, use those
//     if (hasIntermediatePlaces) {
//       setIntermediateOptions(trip.tripData.intermediate_places);
//       setIsLoading(false);
//       return;
//     }
    
//     // Only proceed if we have source and destination
//     if (!trip?.userSelection?.source?.label || !trip?.userSelection?.location?.label) {
//       setIsLoading(false);
//       setError("Source or destination is missing");
//       return;
//     }

//     const fetchInterestingPlaces = async () => {
//       setIsLoading(true);
//       setError(null);
      
//       try {
//         const source = trip.userSelection.source.label;
//         const destination = trip.userSelection.location.label;
        
//         console.log(`Finding interesting places between ${source} and ${destination}`);
        
//         // First, get coordinates for source and destination
//         const sourceCoords = await geocodeLocation(source);
//         const destCoords = await geocodeLocation(destination);
        
//         if (!sourceCoords || !destCoords) {
//           throw new Error("Could not get coordinates for source or destination");
//         }
        
//         console.log(`Source coords: ${sourceCoords.lat},${sourceCoords.lng}`);
//         console.log(`Destination coords: ${destCoords.lat},${destCoords.lng}`);
        
//         // Try OpenAI first
//         let places = [];
        
//         try {
//           // Get places recommendations from OpenAI
//           const aiResult = await getPlacesFromOpenAI(source, destination);
          
//           // If AI returned valid places, use them
//           if (aiResult && aiResult.length > 0) {
//             // Validate places with geocoding
//             places = await enhanceWithGeocoding(aiResult, sourceCoords, destCoords);
//           }
//         } catch (aiError) {
//           console.error("Error from OpenAI, trying Google Places instead:", aiError);
//         }
        
//         // If OpenAI failed or returned no results, try Google Places API
//         if (places.length === 0) {
//           // Try to find places along the route using Google Places API
//           places = await findPlacesWithGooglePlaces(sourceCoords, destCoords);
//         }
        
//         // If we still have no places, try a different search technique
//         if (places.length === 0 && retryCount < 2) {
//           setRetryCount(retryCount + 1);
//           console.log(`No places found. Retry attempt ${retryCount + 1}`);
//           // Retry with a different strategy (wider area or different types)
//           places = await searchWiderAreaForPlaces(sourceCoords, destCoords, retryCount + 1);
//         }
        
//         // If we found places, use them
//         if (places.length > 0) {
//           setIntermediateOptions(places);
//         } else {
//           throw new Error("No interesting places found along this route");
//         }
//       } catch (error) {
//         console.error("Error finding places:", error);
//         setError(error.message);
//         // Try to generate synthetic places based on route
//         const syntheticPlaces = await generateSyntheticPlaces(
//           trip.userSelection.source.label, 
//           trip.userSelection.location.label
//         );
//         setIntermediateOptions(syntheticPlaces);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchInterestingPlaces();
//   }, [trip, retryCount]);

//   // Function to get place recommendations from OpenAI
//   async function getPlacesFromOpenAI(source, destination) {
//     try {
//       // Create prompt for OpenAI
//       const prompt = `Generate 5 interesting tourist places to visit between ${source} and ${destination} in India.

// I need actual tourist destinations, attractions, or landmarks that are geographically located between these two cities and would make good stops for travelers on a road trip.

// Return ONLY a JSON object with this exact structure:
// {
//   "intermediate_places": [
//     {
//       "place_name": "Name of Place",
//       "place": "Name of Place",
//       "details": "Brief description of what makes this place interesting (1-2 sentences)",
//       "rating": "4.5",
//       "ticket_pricing": "Free" or "₹X per person" or "Varies",
//       "best_time_to_visit": "Morning", "Afternoon", "Evening", or specific hours
//     }
//   ]
// }

// Only include actual places that are geographically between these locations.`;

//       // Call OpenAI API using the existing chatSession
//       const result = await chatSession.sendMessage(prompt);
//       const responseText = result.response.text();
      
//       console.log("OpenAI response:", responseText);
      
//       // Parse the JSON from the response
//       try {
//         // Try to parse the entire response as JSON
//         const parsedResult = JSON.parse(responseText);
        
//         // If the response is an object with intermediate_places property, use that
//         if (parsedResult.intermediate_places && Array.isArray(parsedResult.intermediate_places)) {
//           return parsedResult.intermediate_places;
//         } else if (Array.isArray(parsedResult)) {
//           // If it's just an array, use that
//           return parsedResult;
//         } else {
//           console.error("Unexpected response format from OpenAI");
//           return [];
//         }
//       } catch (parseError) {
//         console.error("Error parsing OpenAI response:", parseError);
        
//         // Try to extract JSON from text response
//         try {
//           const jsonMatch = responseText.match(/\{[\s\S]*\}/);
//           if (jsonMatch) {
//             const extractedJson = JSON.parse(jsonMatch[0]);
//             if (extractedJson.intermediate_places && Array.isArray(extractedJson.intermediate_places)) {
//               return extractedJson.intermediate_places;
//             } else if (Array.isArray(extractedJson)) {
//               return extractedJson;
//             }
//           }
//         } catch (extractError) {
//           console.error("Error extracting JSON:", extractError);
//         }
        
//         return [];
//       }
//     } catch (error) {
//       console.error("Error calling OpenAI:", error);
//       return [];
//     }
//   }

//   // Function to add coordinates to places using Geocoding API
//   async function enhanceWithGeocoding(places, sourceCoords, destCoords) {
//     const enhancedPlaces = [];
    
//     // Process each place
//     for (const place of places) {
//       try {
//         // Skip if no place name
//         if (!place.place_name && !place.place && !place.name) {
//           continue;
//         }
        
//         // Get the place name from any available field
//         const placeName = place.place_name || place.place || place.name || "";
        
//         // Geocode the place
//         const searchTerm = `${placeName} India`;
//         const placeCoords = await geocodeLocation(searchTerm);
        
//         if (!placeCoords) {
//           console.warn(`Could not geocode place: ${placeName}`);
//           // Add the place anyway, but without coordinates
//           enhancedPlaces.push({
//             ...place,
//             place_name: placeName,
//             place: placeName,
//             time: place.best_time_to_visit || place.time || "All day"
//           });
//           continue;
//         }
        
//         // Check if place is along the route
//         if (isPlaceAlongRoute(sourceCoords, destCoords, placeCoords)) {
//           // Enhanced place with coordinates
//           enhancedPlaces.push({
//             ...place,
//             place_name: placeName,
//             place: placeName,
//             geo_coordinates: `${placeCoords.lat},${placeCoords.lng}`,
//             time: place.best_time_to_visit || place.time || "All day"
//           });
//         } else {
//           console.log(`${placeName} is not along the route from ${sourceCoords.lat},${sourceCoords.lng} to ${destCoords.lat},${destCoords.lng}`);
//         }
//       } catch (error) {
//         console.error(`Error enhancing place:`, error);
//       }
//     }
    
//     return enhancedPlaces;
//   }

//   // Function to find places using Google Places API
//   async function findPlacesWithGooglePlaces(sourceCoords, destCoords) {
//     try {
//       // Calculate midpoint and distance
//       const midpoint = {
//         lat: (sourceCoords.lat + destCoords.lat) / 2,
//         lng: (sourceCoords.lng + destCoords.lng) / 2
//       };
      
//       const distance = calculateDistance(sourceCoords, destCoords);
//       const searchRadius = Math.min(distance * 0.3, 50000); // 30% of route distance, max 50km
      
//       console.log(`Searching for places near ${midpoint.lat},${midpoint.lng} with radius ${searchRadius}m`);
      
//       // Search for tourist attractions
//       const response = await axios.get(
//         'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
//         {
//           params: {
//             location: `${midpoint.lat},${midpoint.lng}`,
//             radius: searchRadius,
//             type: 'tourist_attraction',
//             key: API_KEY
//           }
//         }
//       );
      
//       if (response.data.status === 'OK' && response.data.results.length > 0) {
//         // Convert Places API results to our format
//         return response.data.results.map(place => ({
//           place_name: place.name,
//           place: place.name,
//           details: place.vicinity || `A popular attraction near ${place.name}`,
//           geo_coordinates: `${place.geometry.location.lat},${place.geometry.location.lng}`,
//           rating: place.rating ? place.rating.toString() : "4.0",
//           ticket_pricing: "Check on-site",
//           time: "Opening hours vary"
//         }));
//       } else {
//         console.log("No places found with Google Places API, status:", response.data.status);
//         return [];
//       }
//     } catch (error) {
//       console.error("Error with Google Places API:", error);
//       return [];
//     }
//   }

//   // Function to search a wider area or with different types
//   async function searchWiderAreaForPlaces(sourceCoords, destCoords, attempt) {
//     try {
//       // Calculate route distance
//       const distance = calculateDistance(sourceCoords, destCoords);
      
//       // On first retry, search along the route at multiple points
//       if (attempt === 1) {
//         // Create 3 points along the route
//         const points = [
//           {
//             lat: sourceCoords.lat + (destCoords.lat - sourceCoords.lat) * 0.25,
//             lng: sourceCoords.lng + (destCoords.lng - sourceCoords.lng) * 0.25
//           },
//           {
//             lat: sourceCoords.lat + (destCoords.lat - sourceCoords.lat) * 0.5,
//             lng: sourceCoords.lng + (destCoords.lng - sourceCoords.lng) * 0.5
//           },
//           {
//             lat: sourceCoords.lat + (destCoords.lat - sourceCoords.lat) * 0.75,
//             lng: sourceCoords.lng + (destCoords.lng - sourceCoords.lng) * 0.75
//           }
//         ];
        
//         // Search at each point
//         const allPlaces = [];
//         for (const point of points) {
//           try {
//             const radius = Math.min(distance * 0.2, 50000); // 20% of route distance, max 50km
            
//             // Try with different types
//             const types = ['tourist_attraction', 'hindu_temple', 'mosque', 'museum', 'park'];
            
//             for (const type of types) {
//               const response = await axios.get(
//                 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
//                 {
//                   params: {
//                     location: `${point.lat},${point.lng}`,
//                     radius: radius,
//                     type: type,
//                     key: API_KEY
//                   }
//                 }
//               );
              
//               if (response.data.status === 'OK' && response.data.results.length > 0) {
//                 // Add results to all places
//                 const newPlaces = response.data.results.map(place => ({
//                   place_name: place.name,
//                   place: place.name,
//                   details: place.vicinity || `A popular ${type.replace('_', ' ')} near ${place.name}`,
//                   geo_coordinates: `${place.geometry.location.lat},${place.geometry.location.lng}`,
//                   rating: place.rating ? place.rating.toString() : "4.0",
//                   ticket_pricing: "Check on-site",
//                   time: "Opening hours vary"
//                 }));
                
//                 allPlaces.push(...newPlaces);
                
//                 // If we have enough places, stop searching
//                 if (allPlaces.length >= 5) {
//                   break;
//                 }
//               }
//             }
            
//             // If we have enough places, stop searching
//             if (allPlaces.length >= 5) {
//               break;
//             }
//           } catch (error) {
//             console.error(`Error searching at point ${point.lat},${point.lng}:`, error);
//           }
//         }
        
//         return allPlaces;
//       } 
//       // On second retry, use text search instead of nearby search
//       else if (attempt === 2) {
//         // Get names of cities/regions along the route
//         const regions = await findRegionsAlongRoute(sourceCoords, destCoords);
        
//         // Search for attractions in each region
//         const allPlaces = [];
//         for (const region of regions) {
//           try {
//             const response = await axios.get(
//               'https://maps.googleapis.com/maps/api/place/textsearch/json',
//               {
//                 params: {
//                   query: `tourist attractions in ${region}`,
//                   key: API_KEY
//                 }
//               }
//             );
            
//             if (response.data.status === 'OK' && response.data.results.length > 0) {
//               // Add results to all places
//               const newPlaces = response.data.results.map(place => ({
//                 place_name: place.name,
//                 place: place.name,
//                 details: place.formatted_address || `A popular attraction in ${region}`,
//                 geo_coordinates: `${place.geometry.location.lat},${place.geometry.location.lng}`,
//                 rating: place.rating ? place.rating.toString() : "4.0",
//                 ticket_pricing: "Check on-site",
//                 time: "Opening hours vary"
//               }));
              
//               // Filter to only include places along the route
//               const filteredPlaces = newPlaces.filter(place => {
//                 const [lat, lng] = place.geo_coordinates.split(',').map(parseFloat);
//                 return isPlaceAlongRoute(sourceCoords, destCoords, { lat, lng });
//               });
              
//               allPlaces.push(...filteredPlaces);
              
//               // If we have enough places, stop searching
//               if (allPlaces.length >= 5) {
//                 break;
//               }
//             }
//           } catch (error) {
//             console.error(`Error searching in region ${region}:`, error);
//           }
//         }
        
//         return allPlaces;
//       }
      
//       return [];
//     } catch (error) {
//       console.error("Error in wide area search:", error);
//       return [];
//     }
//   }

//   // Function to generate synthetic places as a last resort
//   async function generateSyntheticPlaces(source, destination) {
//     try {
//       // Geocode source and destination
//       const sourceCoords = await geocodeLocation(source);
//       const destCoords = await geocodeLocation(destination);
      
//       if (!sourceCoords || !destCoords) {
//         throw new Error("Could not get coordinates for source or destination");
//       }
      
//       // Calculate route length
//       const routeDistance = calculateDistance(sourceCoords, destCoords);
      
//       // Create points at intervals along the route
//       const points = [];
//       const numPoints = Math.min(5, Math.ceil(routeDistance / 100)); // One point per 100km, max 5 points
      
//       for (let i = 1; i <= numPoints; i++) {
//         const fraction = i / (numPoints + 1);
//         points.push({
//           lat: sourceCoords.lat + (destCoords.lat - sourceCoords.lat) * fraction,
//           lng: sourceCoords.lng + (destCoords.lng - sourceCoords.lng) * fraction
//         });
//       }
      
//       // For each point, try to find a name using reverse geocoding
//       const places = [];
//       for (const point of points) {
//         try {
//           const response = await axios.get(
//             'https://maps.googleapis.com/maps/api/geocode/json',
//             {
//               params: {
//                 latlng: `${point.lat},${point.lng}`,
//                 key: API_KEY
//               }
//             }
//           );
          
//           if (response.data.status === 'OK' && response.data.results.length > 0) {
//             // Get the first result
//             const result = response.data.results[0];
            
//             // Try to find a locality or administrative_area_level_2 component
//             let placeName = '';
//             for (const component of result.address_components) {
//               if (component.types.includes('locality') || 
//                   component.types.includes('administrative_area_level_2')) {
//                 placeName = component.long_name;
//                 break;
//               }
//             }
            
//             // If no suitable component found, use the formatted address
//             if (!placeName) {
//               placeName = result.formatted_address.split(',')[0];
//             }
            
//             // Add to places
//             places.push({
//               place_name: placeName,
//               place: placeName,
//               details: `A location along the route from ${source} to ${destination}.`,
//               geo_coordinates: `${point.lat},${point.lng}`,
//               rating: "4.0",
//               ticket_pricing: "Check on-site",
//               time: "All day"
//             });
//           }
//         } catch (error) {
//           console.error(`Error reverse geocoding point ${point.lat},${point.lng}:`, error);
//         }
//       }
      
//       return places;
//     } catch (error) {
//       console.error("Error generating synthetic places:", error);
//       return [];
//     }
//   }

//   // Function to find regions (cities, towns) along the route
//   async function findRegionsAlongRoute(sourceCoords, destCoords) {
//     try {
//       // Calculate the number of points based on distance
//       const distance = calculateDistance(sourceCoords, destCoords);
//       const numPoints = Math.min(5, Math.ceil(distance / 200)); // One point per 200km, max 5
      
//       // Generate points along the route
//       const points = [];
//       for (let i = 1; i <= numPoints; i++) {
//         const fraction = i / (numPoints + 1);
//         points.push({
//           lat: sourceCoords.lat + (destCoords.lat - sourceCoords.lat) * fraction,
//           lng: sourceCoords.lng + (destCoords.lng - sourceCoords.lng) * fraction
//         });
//       }
      
//       // Reverse geocode each point to find region names
//       const regions = [];
//       for (const point of points) {
//         try {
//           const response = await axios.get(
//             'https://maps.googleapis.com/maps/api/geocode/json',
//             {
//               params: {
//                 latlng: `${point.lat},${point.lng}`,
//                 key: API_KEY
//               }
//             }
//           );
          
//           if (response.data.status === 'OK' && response.data.results.length > 0) {
//             // Loop through address components to find city/region names
//             for (const result of response.data.results) {
//               for (const component of result.address_components) {
//                 if (component.types.includes('locality') || 
//                     component.types.includes('administrative_area_level_2')) {
//                   // Add if not already in the list
//                   if (!regions.includes(component.long_name)) {
//                     regions.push(component.long_name);
//                     break;
//                   }
//                 }
//               }
              
//               // If we found a region in this result, stop processing more results
//               if (regions.length > 0 && regions[regions.length - 1] !== '') {
//                 break;
//               }
//             }
//           }
//         } catch (error) {
//           console.error(`Error reverse geocoding point ${point.lat},${point.lng}:`, error);
//         }
//       }
      
//       // Remove any empty regions
//       return regions.filter(region => region !== '');
//     } catch (error) {
//       console.error("Error finding regions along route:", error);
//       return [];
//     }
//   }

//   // Function to geocode a location name to coordinates
//   async function geocodeLocation(locationName) {
//     try {
//       const response = await axios.get(
//         `https://maps.googleapis.com/maps/api/geocode/json`,
//         {
//           params: {
//             address: locationName,
//             key: API_KEY
//           }
//         }
//       );

//       if (response.data.status === 'OK' && response.data.results.length > 0) {
//         return response.data.results[0].geometry.location;
//       } else {
//         console.warn(`Geocoding failed for ${locationName}: ${response.data.status}`);
//         return null;
//       }
//     } catch (error) {
//       console.error(`Error geocoding ${locationName}:`, error);
//       return null;
//     }
//   }

//   // Function to check if a place is along the route
//   function isPlaceAlongRoute(source, destination, placeCoords) {
//     // Create a bounding box for the route with buffer
//     const minLat = Math.min(source.lat, destination.lat);
//     const maxLat = Math.max(source.lat, destination.lat);
//     const minLng = Math.min(source.lng, destination.lng);
//     const maxLng = Math.max(source.lng, destination.lng);
    
//     // Calculate the diagonal distance of the bounding box
//     const diagonalDistance = calculateDistance(
//       { lat: minLat, lng: minLng }, 
//       { lat: maxLat, lng: maxLng }
//     );
    
//     // Buffer size based on route distance (larger buffer for longer routes)
//     const buffer = Math.max(0.5, diagonalDistance * 0.1 / 111); // Convert km to degrees (approx)
    
//     // Check if place is within the bounding box (with buffer)
//     const isWithinBox = 
//       placeCoords.lat >= minLat - buffer && 
//       placeCoords.lat <= maxLat + buffer &&
//       placeCoords.lng >= minLng - buffer && 
//       placeCoords.lng <= maxLng + buffer;
      
//     if (!isWithinBox) {
//       return false;
//     }
    
//     // Check if place isn't too close to source or destination
//     const distanceToSource = calculateDistance(placeCoords, source);
//     const distanceToDestination = calculateDistance(placeCoords, destination);
    
//     // Only allow places that are more than 5% of route distance from either end
//     const routeDistance = calculateDistance(source, destination);
//     const minDistanceThreshold = Math.max(10, routeDistance * 0.05); // At least 10km
    
//     if (distanceToSource < minDistanceThreshold || distanceToDestination < minDistanceThreshold) {
//       return false;
//     }
    
//     // To verify it's along the route, check if the detour distance is reasonable
//     const detourDistance = distanceToSource + distanceToDestination;
    
//     // Allow a detour that's at most 30% longer than the direct route
//     return detourDistance <= routeDistance * 1.3;
//   }

//   // Calculate distance between two points using Haversine formula
//   function calculateDistance(point1, point2) {
//     const toRad = value => value * Math.PI / 180;
//     const R = 6371; // Earth's radius in km
//     const dLat = toRad(point2.lat - point1.lat);
//     const dLng = toRad(point2.lng - point1.lng);
    
//     const a = 
//       Math.sin(dLat/2) * Math.sin(dLat/2) +
//       Math.cos(toRad(point1.lat)) * Math.cos(toRad(point2.lat)) * 
//       Math.sin(dLng/2) * Math.sin(dLng/2);
    
//     const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//     return R * c; // Distance in km
//   }

//   // Don't render anything if no intermediate options or still loading with no data
//   if (!intermediateOptions.length && !isLoading) {
//     return null;
//   }

//   return (
//     <div className="my-10">
//       <div className="flex items-center mb-6">
//         <FaRoute className="text-blue-500 mr-3 text-xl" />
//         <h2 className='font-bold text-2xl text-gray-800'>
//           Places to Visit Between {trip?.userSelection?.source?.label} and {trip?.userSelection?.location?.label}
//         </h2>
//       </div>
      
//       {isLoading ? (
//         <div className="flex justify-center items-center p-10">
//           <FaSpinner className="animate-spin text-blue-500 mr-2" />
//           <span>Finding interesting places along your route...</span>
//         </div>
//       ) : error ? (
//         <div className="bg-yellow-50 p-4 rounded-lg mb-6 flex items-start">
//           <div className="text-yellow-500 mr-3 mt-1">
//             <FaInfoCircle />
//           </div>
//           <div>
//             <p className="text-yellow-700 font-medium">
//               {intermediateOptions.length > 0 
//                 ? "Found some places, but there might be more" 
//                 : "Couldn't find specific places"}
//             </p>
//             <p className="text-yellow-600 text-sm mt-1">
//               {error}
//             </p>
//           </div>
//         </div>
//       ) : (
//         <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
//           <div className="text-blue-500 mr-3 mt-1">
//             <FaMapMarkerAlt />
//           </div>
//           <p className="text-blue-700">
//             These are interesting places you can visit on your way from {trip?.userSelection?.source?.label} to {trip?.userSelection?.location?.label}. 
//             Consider adding some of these stops to break up your journey.
//           </p>
//         </div>
//       )}
      
//       {intermediateOptions.length > 0 && (
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {intermediateOptions.map((place, index) => (
//             <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
//               <PlaceCardItem place={place} />
//             </div>
//           ))}
//         </div>
//       )}
      
//       {intermediateOptions.length > 0 && (
//         <div className="mt-6 text-center">
//           <button 
//             className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center mx-auto"
//             onClick={() => {
//               setRetryCount(retryCount + 1);
//               setIsLoading(true);
//             }}
//           >
//             <FaSearch className="mr-2" />
//             Find More Places
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// export default IntermediatePlaces;

import React, { useEffect, useState } from 'react';
import { FaMapMarkerAlt, FaRoute, FaInfoCircle, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import PlaceCardItem from './PlaceCardItem';
import { chatSession } from '../../service/AIModel';

// API key for Google Maps
const API_KEY = "AIzaSyAf0ZvcA5XmS5iVs33z9lWbxQlGrTREdBo";

function IntermediatePlaces({ trip }) {
  const [intermediateOptions, setIntermediateOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Wait until trip data is fully loaded
    if (!trip || Object.keys(trip).length === 0) {
      setIsLoading(true);
      return;
    }

    // Check if we already have intermediate places
    const hasIntermediatePlaces = 
      trip?.tripData?.intermediate_places && 
      Array.isArray(trip.tripData.intermediate_places) && 
      trip.tripData.intermediate_places.length > 0;
    
    // If we already have places, use those
    if (hasIntermediatePlaces) {
      console.log("Using existing intermediate places:", trip.tripData.intermediate_places);
      setIntermediateOptions(trip.tripData.intermediate_places);
      setIsLoading(false);
      return;
    }

    // Check if source and destination are available
    if (!trip?.userSelection?.source?.label || !trip?.userSelection?.location?.label) {
      console.log("Source or destination missing in trip data:", trip);
      // Use deeper lookup for source and destination
      const source = 
        trip?.userSelection?.source?.label || 
        trip?.userSelection?.source?.value?.description || 
        trip?.userSelection?.source || 
        null;
      
      const destination = 
        trip?.userSelection?.location?.label || 
        trip?.userSelection?.location?.value?.description || 
        trip?.userSelection?.location || 
        null;

      if (!source || !destination) {
        console.error("Could not find source or destination in trip data");
        setIsLoading(false);
        setError("Source or destination is missing in trip data");
        return;
      }
    }
    
    const fetchInterestingPlaces = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Extract source and destination from trip data safely
        const source = 
          trip?.userSelection?.source?.label || 
          trip?.userSelection?.source?.value?.description || 
          (typeof trip?.userSelection?.source === 'string' ? trip.userSelection.source : null);
        
        const destination = 
          trip?.userSelection?.location?.label || 
          trip?.userSelection?.location?.value?.description || 
          (typeof trip?.userSelection?.location === 'string' ? trip.userSelection.location : null);
        
        if (!source || !destination) {
          throw new Error("Could not extract source or destination from trip data");
        }
        
        console.log(`Finding places between ${source} and ${destination}`);
        
        // Get places recommendations from OpenAI
        const aiResult = await getPlacesFromOpenAI(source, destination);
        
        // If AI returned valid places, use them
        if (aiResult && aiResult.length > 0) {
          console.log("Got places from AI:", aiResult);
          setIntermediateOptions(aiResult);
        } else {
          // Fallback to manual data
          console.log("Using fallback places");
          const fallbackPlaces = getManualPlacesAlongRoute(source, destination);
          setIntermediateOptions(fallbackPlaces);
        }
      } catch (error) {
        console.error("Error finding places:", error);
        setError(error.message);
        
        // Try to extract source and destination anyway for fallback
        try {
          const source = 
            trip?.userSelection?.source?.label || 
            trip?.userSelection?.source?.value?.description || 
            (typeof trip?.userSelection?.source === 'string' ? trip.userSelection.source : "Unknown");
          
          const destination = 
            trip?.userSelection?.location?.label || 
            trip?.userSelection?.location?.value?.description || 
            (typeof trip?.userSelection?.location === 'string' ? trip.userSelection.location : "Unknown");
          
          const fallbackPlaces = getManualPlacesAlongRoute(source, destination);
          setIntermediateOptions(fallbackPlaces);
        } catch (fallbackError) {
          console.error("Error creating fallback places:", fallbackError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterestingPlaces();
  }, [trip]);

  // Function to get place recommendations from OpenAI
  async function getPlacesFromOpenAI(source, destination) {
    try {
      // Create prompt for OpenAI
      const prompt = `Generate interesting tourist places to visit between ${source} and ${destination} in India. 

I need 3-5 popular tourist destinations, attractions, or landmarks that are geographically located between these two cities and would make good stops for travelers on a road trip.

Return ONLY a JSON object with this exact structure:
{
  "intermediate_places": [
    {
      "name": "Name of Place",
      "place_name": "Name of Place",
      "place": "Name of Place",
      "details": "Brief description of what makes this place interesting (1-2 sentences)",
      "rating": "4.5",
      "ticket_pricing": "Free" or "₹X per person" or "Varies",
      "time": "Morning", "Afternoon", "Evening", or specific hours,
      "geo_coordinates": "latitude,longitude" (if known)
    }
  ]
}

Only include actual places that are geographically between these locations.`;

      // Call OpenAI API using the existing chatSession
      const result = await chatSession.sendMessage(prompt);
      const responseText = result.response.text();
      
      console.log("OpenAI response:", responseText);
      
      // Parse the JSON from the response
      try {
        // Try to parse the entire response as JSON
        const parsedResult = JSON.parse(responseText);
        
        // If the response is an object with intermediate_places property, use that
        if (parsedResult.intermediate_places && Array.isArray(parsedResult.intermediate_places)) {
          return parsedResult.intermediate_places;
        } else if (Array.isArray(parsedResult)) {
          // If it's just an array, use that
          return parsedResult;
        } else {
          console.error("Unexpected response format from OpenAI");
          return [];
        }
      } catch (parseError) {
        console.error("Error parsing OpenAI response:", parseError);
        
        // Try to extract JSON from text response
        try {
          const jsonMatch = responseText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const extractedJson = JSON.parse(jsonMatch[0]);
            if (extractedJson.intermediate_places && Array.isArray(extractedJson.intermediate_places)) {
              return extractedJson.intermediate_places;
            } else if (Array.isArray(extractedJson)) {
              return extractedJson;
            }
          }
        } catch (extractError) {
          console.error("Error extracting JSON:", extractError);
        }
        
        return [];
      }
    } catch (error) {
      console.error("Error calling OpenAI:", error);
      return [];
    }
  }

  // Fallback function with manually curated list of popular places between major cities
  function getManualPlacesAlongRoute(source, destination) {
    // Convert source and destination to lowercase for easier comparison
    const sourceLower = typeof source === 'string' ? source.toLowerCase() : '';
    const destLower = typeof destination === 'string' ? destination.toLowerCase() : '';
    
    console.log(`Finding fallback places between ${sourceLower} and ${destLower}`);
    
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
          details: 'Bodh Gaya is a Buddhist pilgrimage site associated with Gautama Buddha\'s attainment of Enlightenment under the Bodhi Tree.',
          rating: '4.7',
          ticket_pricing: 'Free (Temple entry)',
          time: '6 AM - 9 PM'
        },
        {
          name: 'Varanasi',
          place_name: 'Varanasi',
          place: 'Varanasi',
          geo_coordinates: '25.3176,83.0130',
          details: 'One of the oldest continuously inhabited cities in the world and a major religious hub in India with famous ghats along the Ganges River.',
          rating: '4.6',
          ticket_pricing: 'Free (Most ghats)',
          time: 'Best at sunrise/sunset'
        },
        {
          name: 'Allahabad (Prayagraj)',
          place_name: 'Allahabad',
          place: 'Allahabad',
          geo_coordinates: '25.4358,81.8464',
          details: 'Sacred city situated at the confluence of three rivers - Ganga, Yamuna, and Saraswati, known for its religious significance.',
          rating: '4.4',
          ticket_pricing: 'Free (Most sites)',
          time: 'All day'
        },
        {
          name: 'Agra',
          place_name: 'Agra',
          place: 'Agra',
          geo_coordinates: '27.1767,78.0081',
          details: 'Home to the iconic Taj Mahal, Agra Fort, and Fatehpur Sikri - three UNESCO World Heritage sites.',
          rating: '4.8',
          ticket_pricing: 'Varies by monument',
          time: 'Sunrise to sunset'
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
    // Generic fallback for other routes or when route is unknown
    else {
      places = [
        {
          name: 'Interesting Landmark',
          place_name: 'Interesting Landmark',
          place: 'Interesting Landmark',
          geo_coordinates: '',
          details: `Interesting place to visit on your way from ${source} to ${destination}.`,
          rating: '4.5',
          ticket_pricing: 'Check at location',
          time: 'All day'
        },
        {
          name: 'Historic Site',
          place_name: 'Historic Site',
          place: 'Historic Site',
          geo_coordinates: '',
          details: `Historical attraction located between ${source} and ${destination}.`,
          rating: '4.3',
          ticket_pricing: 'Varies',
          time: '9 AM - 5 PM'
        },
        {
          name: 'Natural Wonder',
          place_name: 'Natural Wonder',
          place: 'Natural Wonder',
          geo_coordinates: '',
          details: `Beautiful natural attraction to break your journey between ${source} and ${destination}.`,
          rating: '4.7',
          ticket_pricing: 'Free/Minimal',
          time: 'Daylight hours'
        }
      ];
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
          Places to Visit Between {
            trip?.userSelection?.source?.label || 
            trip?.userSelection?.source?.value?.description || 
            (typeof trip?.userSelection?.source === 'string' ? trip.userSelection.source : "Source")
          } and {
            trip?.userSelection?.location?.label || 
            trip?.userSelection?.location?.value?.description || 
            (typeof trip?.userSelection?.location === 'string' ? trip.userSelection.location : "Destination")
          }
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
            <p className="text-yellow-700 font-medium">
              {intermediateOptions.length > 0 
                ? "Found some places, but there might be more" 
                : "Couldn't find specific places"}
            </p>
            <p className="text-yellow-600 text-sm mt-1">
              {error}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
          <div className="text-blue-500 mr-3 mt-1">
            <FaMapMarkerAlt />
          </div>
          <p className="text-blue-700">
            These are interesting places you can visit on your way from {
              trip?.userSelection?.source?.label || 
              trip?.userSelection?.source?.value?.description || 
              (typeof trip?.userSelection?.source === 'string' ? trip.userSelection.source : "Source")
            } to {
              trip?.userSelection?.location?.label || 
              trip?.userSelection?.location?.value?.description || 
              (typeof trip?.userSelection?.location === 'string' ? trip.userSelection.location : "Destination")
            }. 
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