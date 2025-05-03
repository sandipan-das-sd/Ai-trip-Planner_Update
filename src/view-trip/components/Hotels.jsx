// import React from 'react'
// import { Link } from 'react-router-dom'
// import HotelCardItem from './HotelCardItem'

// function Hotels({ trip }) {
//     return (
//         <div>
//             <h2 className='font-bold text-xl mt-5'>Hotel Recommendation</h2>
//             <div className='grid grid-cols-2 md:grid-cols-3 xl-grid-cols-4 gap-5'>
//                 {trip?.tripData?.hotel_options?.map((hotel, index) => (
//                     <HotelCardItem hotel={hotel} />
//                 ))}
//             </div>
//         </div>
//     )
// }

// export default Hotels

// import React from 'react'
// import { Link } from 'react-router-dom'
// import HotelCardItem from './HotelCardItem'

// function Hotels({ trip }) {
//     return (
//         <div>
//             <h2 className='font-bold text-xl mt-5'>Hotel Recommendation</h2>
//             <div className='grid grid-cols-2 md:grid-cols-3 xl-grid-cols-4 gap-5'>
//                 {trip?.tripData?.hotel_options?.map((hotel, index) => (
//                     <HotelCardItem key={`hotel-${index}`} hotel={hotel} />
//                 ))}
//             </div>
//         </div>
//     )
// }

// export default Hotels

import React, { useState, useEffect } from "react";
import HotelCardItem from "./HotelCardItem";
import HotelFilters from "./HotelFilters";
import { FaBed, FaRegBuilding } from "react-icons/fa";

function Hotels({ trip }) {
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [filters, setFilters] = useState({
    priceRange: [0, 50000],
  });

  // Extract price as a number from hotel price string
  const extractPrice = (priceString) => {
    if (!priceString) return 0;

    // Convert to lowercase for consistent processing
    const priceLower = priceString.toLowerCase();

    // Handle price categories directly
    if (priceLower.includes("luxury")) return 20000;
    if (priceLower.includes("moderate")) return 10000;
    if (priceLower.includes("budget")) return 3000;

    // Handle INR prices
    if (priceLower.includes("₹")) {
      const matches = priceLower.match(/₹\s*(\d+[,\d]*)/);
      if (matches && matches[1]) {
        // Remove commas and convert to number
        return parseInt(matches[1].replace(/,/g, ""));
      }
    }

    // Handle USD prices and convert to INR (approximate conversion)
    if (priceLower.includes("$")) {
      const matches = priceLower.match(/\$\s*(\d+)/);
      if (matches && matches[1]) {
        // Convert USD to INR (approximate rate: 1 USD = 83 INR)
        return parseInt(matches[1]) * 83;
      }
    }

    // Try to extract any numeric values from the price string
    const matches = priceLower.match(/(\d+)/g);
    if (matches && matches.length > 0) {
      // If there are multiple numbers (like a range), take the lower one
      return parseInt(matches[0]);
    }

    return 0;
  };

  // Apply filters to hotels
  useEffect(() => {
    if (!trip?.tripData?.hotel_options) {
      setFilteredHotels([]);
      return;
    }

    const filtered = trip.tripData.hotel_options.filter((hotel) => {
      const price = extractPrice(hotel.price);
      return price >= filters.priceRange[0] && price <= filters.priceRange[1];
    });

    setFilteredHotels(filtered);
  }, [trip, filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  };

  return (
    <div className="my-10">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <FaBed className="text-orange-500 mr-3 text-xl" />
          <h2 className="font-bold text-2xl text-gray-800">
            Hotel Recommendations
          </h2>
        </div>

        {trip?.tripData?.hotel_options &&
          trip.tripData.hotel_options.length > 0 && (
            <HotelFilters onFilterChange={handleFilterChange} />
          )}
      </div>

      {!trip?.tripData?.hotel_options ||
      trip.tripData.hotel_options.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
          <FaRegBuilding className="text-gray-400 text-4xl mx-auto mb-3" />
          <p className="text-gray-500 text-lg">
            No hotel recommendations available for this trip.
          </p>
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
          <FaRegBuilding className="text-gray-400 text-4xl mx-auto mb-3" />
          <p className="text-gray-500 text-lg">
            No hotels match your current filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredHotels.map((hotel, index) => (
            <HotelCardItem key={`hotel-${index}`} hotel={hotel} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Hotels;
