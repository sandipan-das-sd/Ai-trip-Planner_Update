import React from "react";
import PlaceCardItem from "./PlaceCardItem";
import { FaMapMarkerAlt } from "react-icons/fa";

function PlacesToVisit({ trip }) {
  // Check if itinerary exists
  const hasItinerary =
    trip?.tripData?.itinerary && typeof trip.tripData.itinerary === "object";

  // Process the itinerary data if it exists
  const formattedItinerary = [];

  if (hasItinerary) {
    // Get all days and sort them numerically (day1, day2, etc.)
    const days = Object.keys(trip.tripData.itinerary);
    const sortedDays = days.sort((a, b) => {
      const dayNumA = parseInt(a.replace("day", ""));
      const dayNumB = parseInt(b.replace("day", ""));
      return dayNumA - dayNumB;
    });

    // Format each day's data
    sortedDays.forEach((dayKey, index) => {
      const dayData = trip.tripData.itinerary[dayKey];

      // Convert day0 to day1, and ensure all days are numbered starting from 1
      let displayDayNum;
      const originalDayNum = parseInt(dayKey.replace("day", ""));

      // If we have a day0, adjust all days to start from 1
      if (sortedDays.includes("day0")) {
        displayDayNum = originalDayNum + 1;
      } else {
        // Otherwise, use the original day number
        displayDayNum = originalDayNum;
      }

      formattedItinerary.push({
        day: `Day ${displayDayNum}`,
        plan: dayData.plan || [],
        originalDayNum: originalDayNum, // Keep track of original day number for reference
      });
    });
  }

  return (
    <div>
      <h2 className="font-bold text-2xl mb-6">Places to Visit</h2>

      {!hasItinerary || formattedItinerary.length === 0 ? (
        <div className="mt-5 p-6 bg-gray-50 rounded-lg text-center border border-gray-200">
          <p className="text-gray-500">
            No itinerary available for this trip yet.
          </p>
        </div>
      ) : (
        <div>
          {formattedItinerary.map((item, index) => (
            <div
              key={index}
              className="mt-8 bg-white rounded-lg shadow-sm p-4 border border-gray-100"
            >
              {/* Day header with attractive styling */}
              <div className="flex items-center mb-4 pb-2 border-b border-gray-100">
                <div className="bg-orange-500 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center mr-3">
                  {/* Use the display day number instead of index+1 */}
                  {item.day.replace("Day ", "")}
                </div>
                <h2 className="font-bold text-xl text-gray-800">{item.day}</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {Array.isArray(item.plan) && item.plan.length > 0 ? (
                  item.plan.map((place, placeIndex) => (
                    <div key={placeIndex} className="my-3">
                      {/* Time header with better styling */}
                      <div className="flex items-center mb-2">
                        <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-md text-sm font-medium">
                          {place.time}
                        </div>
                        {place.geo_coordinates && (
                          <div className="ml-2 flex items-center text-blue-500 text-xs">
                            <FaMapMarkerAlt className="mr-1" />
                            <span>Map available</span>
                          </div>
                        )}
                      </div>

                      <PlaceCardItem place={place} />
                    </div>
                  ))
                ) : (
                  <div className="my-2 col-span-2 p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-gray-500">
                      No places to visit available for this day.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlacesToVisit;
