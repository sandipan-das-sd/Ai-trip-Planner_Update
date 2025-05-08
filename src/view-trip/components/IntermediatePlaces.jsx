import React from 'react';
import { FaMapMarkerAlt, FaRoute } from 'react-icons/fa';
import PlaceCardItem from './PlaceCardItem';

function IntermediatePlaces({ trip }) {
  // Check if intermediate places exist
  const hasIntermediatePlaces = 
    trip?.tripData?.intermediate_places && 
    Array.isArray(trip.tripData.intermediate_places) && 
    trip.tripData.intermediate_places.length > 0;

  if (!hasIntermediatePlaces) {
    return null; // Don't render anything if no intermediate places
  }

  return (
    <div className="my-10">
      <div className="flex items-center mb-6">
        <FaRoute className="text-blue-500 mr-3 text-xl" />
        <h2 className='font-bold text-2xl text-gray-800'>
          Places to Visit Between {trip?.userSelection?.source?.label} and {trip?.userSelection?.location?.label}
        </h2>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start">
        <div className="text-blue-500 mr-3 mt-1">
          <FaMapMarkerAlt />
        </div>
        <p className="text-blue-700">
          These are interesting places you can visit on your way from {trip?.userSelection?.source?.label} to {trip?.userSelection?.location?.label}. 
          Consider adding some of these stops to break up your journey.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trip.tripData.intermediate_places.map((place, index) => (
          <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
            <PlaceCardItem place={place} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default IntermediatePlaces;



