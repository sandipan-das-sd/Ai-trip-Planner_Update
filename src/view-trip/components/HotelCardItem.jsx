// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { GetPhotoUrl } from '@/service/GlobalApi';

// function HotelCardItem({ hotel }) {
//   const [photoUrl, setPhotoUrl] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [loadAttempt, setLoadAttempt] = useState(0);

//   // Format price to convert USD to INR
//   const formatPrice = (price) => {
//     if (!price) return "Price not available";

//     // If price already has ₹ symbol, return as is
//     if (price.includes('₹')) return price;

//     // Convert USD to INR (using approximate exchange rate of 1 USD = 83 INR)
//     const usdToInr = 83;

//     // Handle price ranges like "$100-$150"
//     if (price.includes('$')) {
//       return price.replace(/\$(\d+)/g, (match, amount) => {
//         const inrAmount = Math.round(parseInt(amount) * usdToInr);
//         return `₹${inrAmount.toLocaleString('en-IN')}`;
//       });
//     }

//     // Add ₹ symbol if missing entirely
//     return `₹${price}`;
//   };

//   useEffect(() => {
//     if (hotel && hotel.name) {
//       fetchImage();
//     } else {
//       setIsLoading(false);
//     }
//   }, [hotel, loadAttempt]);

//   const fetchImage = async () => {
//     try {
//       setIsLoading(true);

//       // Use enhanced function to get image from Google Places API with "hotel" context
//       const imageUrl = await GetPhotoUrl(hotel.name, "hotel");

//       if (imageUrl) {
//         setPhotoUrl(imageUrl);
//       } else if (hotel.image_url) {
//         // Fallback to the provided image URL if available
//         setPhotoUrl(hotel.image_url);
//       } else {
//         // Last resort: use placeholder
//         setPhotoUrl('/placeholder.jpg');
//       }
//     } catch (error) {
//       console.error("Error fetching hotel image:", error);

//       if (hotel.image_url) {
//         setPhotoUrl(hotel.image_url);
//       } else {
//         setPhotoUrl('/placeholder.jpg');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleImageError = () => {
//     // Try again with a different approach if image fails to load
//     if (loadAttempt < 2) {
//       setLoadAttempt(prev => prev + 1);
//     } else {
//       // After several attempts, use placeholder
//       setPhotoUrl('/placeholder.jpg');
//     }
//   };

//   const hotelQuery = encodeURIComponent(`${hotel?.name} ${hotel?.address || ''}`.trim());

//   // Extract main price (the lower price in a range)
//   const getMainPrice = (price) => {
//     if (!price) return "";

//     const formattedPrice = formatPrice(price);
//     // Extract the first number in the price range
//     const match = formattedPrice.match(/₹([\d,]+)/);
//     if (match && match[1]) {
//       return `₹${match[1]}`;
//     }
//     return formattedPrice;
//   };

//   return (
//     <Link to={`https://www.google.com/maps/search/?api=1&query=${hotelQuery}`} target='_blank'>
//       <div className='hover:scale-110 transition-all cursor-pointer mt-5 mb-8'>
//         {isLoading ? (
//           <div className='rounded-xl h-[180px] w-full bg-gray-200 animate-pulse'></div>
//         ) : (
//           <img
//             src={photoUrl}
//             className='rounded-xl h-[180px] w-full object-cover'
//             alt={hotel?.name || "Hotel"}
//             onError={handleImageError}
//           />
//         )}
//         <div className='my-2'>
//           <h2 className='font-medium'>{hotel?.name}</h2>
//           <h2 className='text-xs text-gray-500'>📍{hotel?.address}</h2>
//           <div>
//             <h2 className='text-sm'>💰{getMainPrice(hotel?.price)} <span className='text-xs text-gray-500'>onwards</span></h2>
//             <h2 className='text-xs text-gray-500'>{formatPrice(hotel?.price)}</h2>
//           </div>
//           <h2 className='text-sm'>⭐{hotel?.rating}</h2>
//         </div>
//       </div>
//     </Link>
//   );
// }

// export default HotelCardItem;

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GetPhotoUrl } from "@/service/GlobalApi";
import {
  FaMapMarkerAlt,
  FaStar,
  FaHeart,
  FaRegHeart,
  FaRupeeSign,
} from "react-icons/fa";

// Hotel fallback images by category
const HOTEL_FALLBACKS = {
  luxury:
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=600&auto=format&fit=crop",
  midrange:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop",
  budget:
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600&auto=format&fit=crop",
  default:
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&auto=format&fit=crop",
};

function HotelCardItem({ hotel }) {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  // Format price to convert USD to INR
  const formatPrice = (price) => {
    if (!price) return "Price not available";

    // If price already has ₹ symbol, return as is
    if (price.includes("₹")) return price;

    // Convert USD to INR (using approximate exchange rate of 1 USD = 83 INR)
    const usdToInr = 83;

    // Handle price ranges like "$100-$150"
    if (price.includes("$")) {
      return price.replace(/\$(\d+)/g, (match, amount) => {
        const inrAmount = Math.round(parseInt(amount) * usdToInr);
        return `₹${inrAmount.toLocaleString("en-IN")}`;
      });
    }

    // Add ₹ symbol if missing entirely
    return `₹${price}`;
  };

  // Get hotel category from price and name
  const getHotelCategory = () => {
    if (!hotel) return "default";

    const priceText = hotel.price?.toLowerCase() || "";
    const nameText = hotel.name?.toLowerCase() || "";

    if (
      priceText.includes("luxury") ||
      nameText.includes("luxury") ||
      nameText.includes("palace") ||
      priceText.includes("15000") ||
      priceText.includes("20000")
    ) {
      return "luxury";
    }

    if (
      priceText.includes("budget") ||
      nameText.includes("budget") ||
      nameText.includes("value") ||
      priceText.includes("2000") ||
      priceText.includes("3000")
    ) {
      return "budget";
    }

    return "midrange";
  };

  useEffect(() => {
    if (hotel && hotel.name) {
      fetchImage();
    } else {
      setIsLoading(false);
    }
  }, [hotel, loadAttempt]);

  const fetchImage = async () => {
    try {
      setIsLoading(true);

      // Use enhanced function to get image from Google Places API with "hotel" context
      const imageUrl = await GetPhotoUrl(hotel.name, "hotel");

      if (imageUrl) {
        setPhotoUrl(imageUrl);
      } else if (hotel.image_url) {
        // Fallback to the provided image URL if available
        setPhotoUrl(hotel.image_url);
      } else {
        // Use category-specific fallback
        setPhotoUrl(HOTEL_FALLBACKS[getHotelCategory()]);
      }
    } catch (error) {
      console.error("Error fetching hotel image:", error);

      if (hotel.image_url) {
        setPhotoUrl(hotel.image_url);
      } else {
        setPhotoUrl(HOTEL_FALLBACKS[getHotelCategory()]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = () => {
    // Try again with a different approach if image fails to load
    if (loadAttempt < 1) {
      setLoadAttempt((prev) => prev + 1);
    } else {
      // After attempts, use hotel category fallback
      setPhotoUrl(HOTEL_FALLBACKS[getHotelCategory()]);
    }
  };

  const hotelQuery = encodeURIComponent(
    `${hotel?.name} ${hotel?.address || ""}`.trim()
  );

  // Extract main price (the lower price in a range)
  const getMainPrice = (price) => {
    if (!price) return "";

    const formattedPrice = formatPrice(price);
    // Extract the first number in the price range
    const match = formattedPrice.match(/₹([\d,]+)/);
    if (match && match[1]) {
      return `₹${match[1]}`;
    }
    return formattedPrice;
  };

  // Render star rating
  const renderStars = () => {
    if (!hotel?.rating) return null;

    let rating = parseFloat(hotel.rating);
    if (isNaN(rating)) {
      // Try to extract numeric rating from string like "4.5 stars"
      const match = hotel.rating.match(/^(\d+(\.\d+)?)/);
      if (match) {
        rating = parseFloat(match[1]);
      } else {
        return null;
      }
    }

    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={
              i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
            }
            size={14}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating}</span>
      </div>
    );
  };

  return (
    <div className="relative group">
      <Link
        to={`https://www.google.com/maps/search/?api=1&query=${hotelQuery}`}
        target="_blank"
      >
        <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 h-full flex flex-col">
          {/* Image container */}
          <div className="relative">
            {isLoading ? (
              <div className="h-[180px] w-full bg-gray-200 animate-pulse"></div>
            ) : (
              <>
                <img
                  src={photoUrl}
                  className="h-[180px] w-full object-cover"
                  alt={hotel?.name || "Hotel"}
                  onError={handleImageError}
                />

                {/* Price badge */}
                <div className="absolute top-0 right-0 bg-white m-3 px-3 py-1 rounded-full shadow-md font-bold text-orange-600">
                  {getMainPrice(hotel?.price)}
                </div>

                {/* Category badge */}
                <div
                  className={`absolute top-0 left-0 m-3 px-3 py-1 rounded-full shadow-md font-medium text-sm ${
                    getHotelCategory() === "luxury"
                      ? "bg-purple-100 text-purple-700"
                      : getHotelCategory() === "midrange"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {getHotelCategory() === "luxury"
                    ? "Luxury"
                    : getHotelCategory() === "midrange"
                    ? "Moderate"
                    : "Budget"}
                </div>

                {/* Favorite button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsFavorite(!isFavorite);
                  }}
                  className="absolute bottom-3 right-3 bg-white/70 hover:bg-white p-2 rounded-full transition-colors"
                >
                  {isFavorite ? (
                    <FaHeart className="text-red-500" size={16} />
                  ) : (
                    <FaRegHeart className="text-gray-600" size={16} />
                  )}
                </button>
              </>
            )}
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col flex-grow">
            <h2 className="font-medium text-lg mb-1 line-clamp-1">
              {hotel?.name}
            </h2>

            {hotel?.address && (
              <div className="flex items-start mb-2">
                <FaMapMarkerAlt
                  className="text-gray-400 mt-1 mr-1 flex-shrink-0"
                  size={12}
                />
                <p className="text-xs text-gray-500 line-clamp-2">
                  {hotel.address}
                </p>
              </div>
            )}

            {/* Stars */}
            <div className="mb-2">{renderStars()}</div>

            {/* Price details */}
            <div className="mt-auto pt-3 border-t border-gray-100">
              <p className="text-sm font-medium flex items-center">
                <FaRupeeSign className="text-green-600 mr-1" size={12} />
                <span className="text-green-600">
                  {getMainPrice(hotel?.price)}
                </span>
                <span className="text-xs text-gray-500 ml-1">onwards</span>
              </p>
              <p className="text-xs text-gray-500">
                {formatPrice(hotel?.price)}
              </p>
            </div>
          </div>

          {/* View on map button - visible on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center">
              <FaMapMarkerAlt className="mr-2" />
              View on Map
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default HotelCardItem;
