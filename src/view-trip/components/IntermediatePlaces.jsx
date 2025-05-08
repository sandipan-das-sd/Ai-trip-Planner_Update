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

// API key from environment variable
const API_KEY = "AIzaSyAf0ZvcA5XmS5iVs33z9lWbxQlGrTREdBo";

function IntermediatePlaces({ trip }) {
  const [validIntermediatePlaces, setValidIntermediatePlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if intermediate places exist
    const hasIntermediatePlaces = 
      trip?.tripData?.intermediate_places && 
      Array.isArray(trip.tripData.intermediate_places) && 
      trip.tripData.intermediate_places.length > 0;
    
    if (!hasIntermediatePlaces) {
      setValidIntermediatePlaces([]);
      setIsLoading(false);
      return;
    }

    async function validateIntermediatePlaces() {
      setIsLoading(true);
      setError(null);
      
      try {
        // Get source and destination
        const source = trip?.userSelection?.source?.label;
        const destination = trip?.userSelection?.location?.label;
        
        if (!source || !destination) {
          throw new Error("Source or destination is missing");
        }

        // Get coordinates for source
        const sourceCoords = await getCoordinatesFromAddress(source);
        if (!sourceCoords) {
          throw new Error(`Could not get coordinates for source: ${source}`);
        }

        // Get coordinates for destination
        const destCoords = await getCoordinatesFromAddress(destination);
        if (!destCoords) {
          throw new Error(`Could not get coordinates for destination: ${destination}`);
        }

        console.log(`Source coordinates: ${sourceCoords.lat},${sourceCoords.lng}`);
        console.log(`Destination coordinates: ${destCoords.lat},${destCoords.lng}`);

        // Calculate route distance for relative buffer sizing
        const routeDistance = calculateDistance(sourceCoords, destCoords);
        console.log(`Route distance: ${routeDistance.toFixed(2)} km`);

        // Process intermediate places
        const validatedPlaces = await Promise.all(
          trip.tripData.intermediate_places.map(async (place) => {
            try {
              const placeName = place?.place_name || place?.place || place?.name || "";
              if (!placeName) return null;

              console.log(`Validating place: ${placeName}`);

              // Get coordinates for the place
              const placeCoords = await getCoordinatesFromAddress(placeName);
              if (!placeCoords) {
                console.log(`Could not get coordinates for: ${placeName}`);
                return null;
              }

              console.log(`${placeName} coordinates: ${placeCoords.lat},${placeCoords.lng}`);

              // Check if place is between source and destination
              const isBetween = isPlaceBetween(sourceCoords, destCoords, placeCoords, routeDistance);
              
              if (isBetween) {
                console.log(`${placeName} is valid on the route`);
                // Add coordinates to the place object if it doesn't have them
                if (!place.geo_coordinates) {
                  place.geo_coordinates = `${placeCoords.lat},${placeCoords.lng}`;
                }
                return place;
              } else {
                console.log(`${placeName} is NOT on the route`);
                return null;
              }
            } catch (error) {
              console.error(`Error processing place: ${place?.place_name || place?.place || place?.name}`, error);
              return null;
            }
          })
        );

        // Filter out null values (places that couldn't be processed or aren't between)
        const filteredPlaces = validatedPlaces.filter(place => place !== null);
        setValidIntermediatePlaces(filteredPlaces);
        console.log(`Found ${filteredPlaces.length} valid places on the route`);
      } catch (error) {
        console.error("Error validating intermediate places:", error);
        setError(error.message);
        setValidIntermediatePlaces([]);
      } finally {
        setIsLoading(false);
      }
    }

    validateIntermediatePlaces();
  }, [trip]);

  // Function to get coordinates from an address using Google Geocoding API
  async function getCoordinatesFromAddress(address) {
    if (!address) return null;

    // Check if we already have coordinates for this place in the trip data
    if (trip.tripData.intermediate_places) {
      const existingPlace = trip.tripData.intermediate_places.find(p => {
        const placeName = p?.place_name || p?.place || p?.name || "";
        return placeName.toLowerCase() === address.toLowerCase() && p.geo_coordinates;
      });

      if (existingPlace && existingPlace.geo_coordinates) {
        // Handle different formats of geo_coordinates
        if (typeof existingPlace.geo_coordinates === 'string') {
          const [lat, lng] = existingPlace.geo_coordinates.split(',').map(parseFloat);
          return { lat, lng };
        } else if (existingPlace.geo_coordinates.latitude && existingPlace.geo_coordinates.longitude) {
          return { 
            lat: parseFloat(existingPlace.geo_coordinates.latitude), 
            lng: parseFloat(existingPlace.geo_coordinates.longitude) 
          };
        }
      }
    }

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address: address,
            key: API_KEY
          }
        }
      );

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng
        };
      } else {
        console.warn(`Geocoding failed for ${address}: ${response.data.status}`);
        return null;
      }
    } catch (error) {
      console.error(`Error geocoding address ${address}:`, error);
      return null;
    }
  }

  // Calculate great-circle distance between two points using Haversine formula
  function calculateDistance(pointA, pointB) {
    const toRad = value => value * Math.PI / 180;
    const R = 6371; // Earth's radius in km
    const dLat = toRad(pointB.lat - pointA.lat);
    const dLng = toRad(pointB.lng - pointA.lng);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(pointA.lat)) * Math.cos(toRad(pointB.lat)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  }

  // Function to check if a place is geographically between source and destination
  function isPlaceBetween(sourceCoords, destCoords, placeCoords, routeDistance) {
    // Create a bounding box for the route with buffer
    const minLat = Math.min(sourceCoords.lat, destCoords.lat);
    const maxLat = Math.max(sourceCoords.lat, destCoords.lat);
    const minLng = Math.min(sourceCoords.lng, destCoords.lng);
    const maxLng = Math.max(sourceCoords.lng, destCoords.lng);
    
    // Add a buffer zone (dynamically scaled based on route distance)
    // For short routes, use at least 0.5 degrees buffer
    // For longer routes, use 15% of the route distance
    const buffer = Math.max(0.5, routeDistance * 0.15 / 111); // Convert km to degrees (1 degree ≈ 111 km)
    
    // Check if place is within the bounding box (with buffer)
    const isWithinBox = 
      placeCoords.lat >= minLat - buffer && 
      placeCoords.lat <= maxLat + buffer &&
      placeCoords.lng >= minLng - buffer && 
      placeCoords.lng <= maxLng + buffer;
      
    if (!isWithinBox) {
      return false;
    }
    
    // Calculate distance from source to place
    const sourceToPlaceDistance = calculateDistance(sourceCoords, placeCoords);
    
    // Calculate distance from place to destination
    const placeToDestDistance = calculateDistance(placeCoords, destCoords);
    
    // Check if the place is roughly on the path by comparing the sum of 
    // source-to-place and place-to-destination distances with the direct route distance
    // Allow for some detour (e.g., 30% longer than the direct route)
    const detourFactor = 1.3;
    const isOnRoute = (sourceToPlaceDistance + placeToDestDistance) <= (routeDistance * detourFactor);
    
    return isOnRoute;
  }

  // Don't render anything if no intermediate places or still loading with no data
  if ((!validIntermediatePlaces.length && !isLoading) || !trip) {
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
          <span>Validating places on your route...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 p-4 rounded-lg mb-6 flex items-start">
          <div className="text-red-500 mr-3 mt-1">
            <FaInfoCircle />
          </div>
          <p className="text-red-700">
            {error}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
            <div className="text-blue-500 mr-3 mt-1">
              <FaMapMarkerAlt />
            </div>
            <p className="text-blue-700">
              These are interesting places you can visit on your way from {trip?.userSelection?.source?.label} to {trip?.userSelection?.location?.label}. 
              Each location has been verified to be along your route.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {validIntermediatePlaces.map((place, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <PlaceCardItem place={place} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default IntermediatePlaces;
