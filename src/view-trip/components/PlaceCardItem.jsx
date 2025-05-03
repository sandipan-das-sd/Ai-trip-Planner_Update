import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GetPhotoUrl } from "@/service/GlobalApi";
import {
  FaMapMarkerAlt,
  FaTicketAlt,
  FaStar,
  FaClock,
  FaInfoCircle,
} from "react-icons/fa";

// Realistic fallback images by category and specific landmarks
const FALLBACK_IMAGES = {
  // Categories
  default:
    "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop",
  temple:
    "https://images.unsplash.com/photo-1509516425643-320d8495c4ff?w=800&auto=format&fit=crop",
  monument:
    "https://images.unsplash.com/photo-1602430080148-66d65c069dd5?w=800&auto=format&fit=crop",
  mountain:
    "https://images.unsplash.com/photo-1486082570281-d942af5c39b7?w=800&auto=format&fit=crop",
  beach:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",
  garden:
    "https://images.unsplash.com/photo-1508252592163-5d3c3c559194?w=800&auto=format&fit=crop",
  park: "https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=800&auto=format&fit=crop",
  fort: "https://images.unsplash.com/photo-1599930113854-d6d7fd522507?w=800&auto=format&fit=crop",
  palace:
    "https://images.unsplash.com/photo-1599522336242-0e1820d1380e?w=800&auto=format&fit=crop",
  museum:
    "https://images.unsplash.com/photo-1574271005251-2875e769f6a2?w=800&auto=format&fit=crop",
  lighthouse:
    "https://images.unsplash.com/photo-1566236202825-62edfc640de3?w=800&auto=format&fit=crop",
  market:
    "https://images.unsplash.com/photo-1520006403909-838d6b92c22e?w=800&auto=format&fit=crop",
  waterfall:
    "https://images.unsplash.com/photo-1467890947394-8171244e5410?w=800&auto=format&fit=crop",
  lake: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&auto=format&fit=crop",
  hill: "https://images.unsplash.com/photo-1486082570281-d942af5c39b7?w=800&auto=format&fit=crop",
  tower:
    "https://images.unsplash.com/photo-1549144511-f099e773c147?w=800&auto=format&fit=crop",
  bridge:
    "https://images.unsplash.com/photo-1473221326025-9183b464bb7e?w=800&auto=format&fit=crop",
  cave: "https://images.unsplash.com/photo-1626688455375-b9162a2d3de5?w=800&auto=format&fit=crop",

  // Specific landmarks in India
  "taj mahal":
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop",
  "amber fort":
    "https://images.unsplash.com/photo-1599930113854-d6d7fd522507?w=800&auto=format&fit=crop",
  "hawa mahal":
    "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop",
  "city palace":
    "https://images.unsplash.com/photo-1590080552494-dcda538fa459?w=800&auto=format&fit=crop",
  "jal mahal":
    "https://images.unsplash.com/photo-1617516202907-ff75846e6667?w=800&auto=format&fit=crop",
  "jaigarh fort":
    "https://images.unsplash.com/photo-1624639173753-23a2fbbf5574?w=800&auto=format&fit=crop",
  "nahargarh fort":
    "https://images.unsplash.com/photo-1592639738097-c5b7d3f732a7?w=800&auto=format&fit=crop",
  "albert hall museum":
    "https://images.unsplash.com/photo-1574271005251-2875e769f6a2?w=800&auto=format&fit=crop",
  agra: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop",
  "ranthambore national park":
    "https://images.unsplash.com/photo-1581996323777-9fde24488c9b?w=800&auto=format&fit=crop",
  "qutub minar":
    "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop",
  "red fort":
    "https://images.unsplash.com/photo-1585136917228-92c47c9d4e0e?w=800&auto=format&fit=crop",
  "india gate":
    "https://images.unsplash.com/photo-1592639296346-560c37a0f711?w=800&auto=format&fit=crop",
  "gateway of india":
    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&auto=format&fit=crop",
  "golden temple":
    "https://images.unsplash.com/photo-1589738216835-21b1f3c506a5?w=800&auto=format&fit=crop",
  "lotus temple":
    "https://images.unsplash.com/photo-1548013146-72479768bada?w=800&auto=format&fit=crop",
  "victoria memorial":
    "https://images.unsplash.com/photo-1558431382-27e303142255?w=800&auto=format&fit=crop",
  "mysore palace":
    "https://images.unsplash.com/photo-1600100591221-1d9f3a0a6ef7?w=800&auto=format&fit=crop",
  "mehrangarh fort":
    "https://images.unsplash.com/photo-1573480813647-552e9b7b5394?w=800&auto=format&fit=crop",
  "lake palace":
    "https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&auto=format&fit=crop",

  // International landmarks
  "eiffel tower":
    "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=800&auto=format&fit=crop",
  "statue of liberty":
    "https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?w=800&auto=format&fit=crop",
  colosseum:
    "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&auto=format&fit=crop",
  "great wall of china":
    "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&auto=format&fit=crop",
  "machu picchu":
    "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&auto=format&fit=crop",
  pyramids:
    "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=800&auto=format&fit=crop",
  "big ben":
    "https://images.unsplash.com/photo-1500380804539-4e1e8c1e7118?w=800&auto=format&fit=crop",
  "sydney opera house":
    "https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?w=800&auto=format&fit=crop",
  "burj khalifa":
    "https://images.unsplash.com/photo-1582672060674-bc2bd808a8f5?w=800&auto=format&fit=crop",
  "grand canyon":
    "https://images.unsplash.com/photo-1615551043360-33de8b5f410c?w=800&auto=format&fit=crop",
  "niagara falls":
    "https://images.unsplash.com/photo-1489447068241-b3490214e879?w=800&auto=format&fit=crop",
};

// Get appropriate fallback image based on place name
const getFallbackImage = (placeName) => {
  if (!placeName) return FALLBACK_IMAGES.default;

  const name = placeName.toLowerCase();

  // First check for specific landmark matches
  // Check for exact matches in our landmark dictionary
  for (const landmark in FALLBACK_IMAGES) {
    if (name === landmark) {
      return FALLBACK_IMAGES[landmark];
    }
  }

  // Check for partial matches in landmark names
  for (const landmark in FALLBACK_IMAGES) {
    // Skip category keys (they're usually single words)
    if (landmark.includes(" ") && name.includes(landmark)) {
      return FALLBACK_IMAGES[landmark];
    }
  }

  // If no specific landmark match, check for categories
  if (
    name.includes("temple") ||
    name.includes("mandir") ||
    name.includes("monastery")
  )
    return FALLBACK_IMAGES.temple;
  if (
    name.includes("monument") ||
    name.includes("memorial") ||
    name.includes("statue")
  )
    return FALLBACK_IMAGES.monument;
  if (
    name.includes("mountain") ||
    name.includes("peak") ||
    name.includes("point")
  )
    return FALLBACK_IMAGES.mountain;
  if (name.includes("beach") || name.includes("sea") || name.includes("ocean"))
    return FALLBACK_IMAGES.beach;
  if (name.includes("garden") || name.includes("botanical"))
    return FALLBACK_IMAGES.garden;
  if (name.includes("park") || name.includes("national park"))
    return FALLBACK_IMAGES.park;
  if (name.includes("fort") || name.includes("fortress"))
    return FALLBACK_IMAGES.fort;
  if (
    name.includes("palace") ||
    name.includes("mahal") ||
    name.includes("castle")
  )
    return FALLBACK_IMAGES.palace;
  if (name.includes("museum") || name.includes("gallery"))
    return FALLBACK_IMAGES.museum;
  if (name.includes("lighthouse") || name.includes("beacon"))
    return FALLBACK_IMAGES.lighthouse;
  if (
    name.includes("market") ||
    name.includes("bazaar") ||
    name.includes("mall")
  )
    return FALLBACK_IMAGES.market;
  if (name.includes("waterfall") || name.includes("falls"))
    return FALLBACK_IMAGES.waterfall;
  if (
    name.includes("lake") ||
    name.includes("pond") ||
    name.includes("reservoir")
  )
    return FALLBACK_IMAGES.lake;
  if (
    name.includes("hill") ||
    name.includes("hills") ||
    name.includes("highland")
  )
    return FALLBACK_IMAGES.hill;
  if (name.includes("tower") || name.includes("spire"))
    return FALLBACK_IMAGES.tower;
  if (name.includes("bridge") || name.includes("crossing"))
    return FALLBACK_IMAGES.bridge;
  if (
    name.includes("cave") ||
    name.includes("cavern") ||
    name.includes("grotto")
  )
    return FALLBACK_IMAGES.cave;

  return FALLBACK_IMAGES.default;
};

function PlaceCardItem({ place }) {
  const [photoUrl, setPhotoUrl] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    // Check for place data in different possible structures
    if (place && (place.place || place.place_name || place.name)) {
      fetchPlacePhoto();
    } else {
      setIsLoading(false);
      // Set a default fallback image even if no place data
      setPhotoUrl(FALLBACK_IMAGES.default);
    }

    // Set a timeout to ensure we always have an image, but only if we don't already have one
    const timeoutId = setTimeout(() => {
      if (isLoading && !photoUrl) {
        const placeName =
          place?.place_name || place?.place || place?.name || "";
        setPhotoUrl(getFallbackImage(placeName));
        setIsLoading(false);
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timeoutId);
  }, [place, photoUrl, isLoading]);

  const fetchPlacePhoto = async () => {
    try {
      // If we already have a valid image URL, don't fetch again
      if (
        photoUrl &&
        !photoUrl.includes("undefined") &&
        !photoUrl.includes("null")
      ) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      // Get the place name from the data structure
      // The API response might have different structures
      const placeName = place?.place_name || place?.place || place?.name || "";

      // Try to get cached image from localStorage first
      try {
        const cacheKey = `place_image_${placeName
          .toLowerCase()
          .replace(/\s+/g, "_")}`;
        const cachedImage = localStorage.getItem(cacheKey);
        if (
          cachedImage &&
          !cachedImage.includes("undefined") &&
          !cachedImage.includes("null")
        ) {
          setPhotoUrl(cachedImage);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        // Ignore localStorage errors
      }

      // Check if we have a specific landmark image first
      const lowerName = placeName.toLowerCase();

      // Specific handling for the places in the screenshot
      if (lowerName.includes("jaigarh fort")) {
        setPhotoUrl(
          "https://images.unsplash.com/photo-1624639173753-23a2fbbf5574?w=800&auto=format&fit=crop"
        );
        setIsLoading(false);
        return;
      } else if (lowerName.includes("nahargarh fort")) {
        setPhotoUrl(
          "https://images.unsplash.com/photo-1592639738097-c5b7d3f732a7?w=800&auto=format&fit=crop"
        );
        setIsLoading(false);
        return;
      } else if (
        lowerName.includes("albert hall") ||
        (lowerName.includes("albert") && lowerName.includes("museum"))
      ) {
        setPhotoUrl(
          "https://images.unsplash.com/photo-1574271005251-2875e769f6a2?w=800&auto=format&fit=crop"
        );
        setIsLoading(false);
        return;
      } else if (
        lowerName.includes("agra") ||
        lowerName.includes("taj mahal")
      ) {
        setPhotoUrl(
          "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop"
        );
        setIsLoading(false);
        return;
      } else if (
        lowerName.includes("ranthambore") ||
        lowerName.includes("national park")
      ) {
        setPhotoUrl(
          "https://images.unsplash.com/photo-1581996323777-9fde24488c9b?w=800&auto=format&fit=crop"
        );
        setIsLoading(false);
        return;
      }

      // Direct match for specific landmarks
      for (const landmark in FALLBACK_IMAGES) {
        if (
          lowerName === landmark ||
          (landmark.includes(" ") && lowerName.includes(landmark))
        ) {
          setPhotoUrl(FALLBACK_IMAGES[landmark]);
          setIsLoading(false);
          return; // Exit early with the specific landmark image
        }
      }

      // Get location context if available
      const locationContext = place?.geo_coordinates
        ? typeof place.geo_coordinates === "string"
          ? place.geo_coordinates
          : `${place.geo_coordinates.latitude},${place.geo_coordinates.longitude}`
        : "";

      // For better results, add landmark/attraction context to the search
      let searchContext = "landmark attraction";

      // Add region context if available
      if (place?.region || place?.country) {
        searchContext += ` in ${place.region || place.country}`;
      }

      // Use the more reliable GetPhotoUrl function with enhanced context
      const imageUrl = await GetPhotoUrl(placeName, searchContext);

      if (imageUrl) {
        setPhotoUrl(imageUrl);
      } else {
        // If no image found, use category-specific fallback
        setPhotoUrl(getFallbackImage(placeName));
      }
    } catch (error) {
      console.error("Error fetching place photo:", error);
      // Use category-specific fallback image
      const placeName = place?.place_name || place?.place || place?.name || "";
      setPhotoUrl(getFallbackImage(placeName));
    } finally {
      setIsLoading(false);
    }
  };

  // Use coordinates in map link if available for better accuracy
  const getMapQuery = () => {
    // If we have geo_coordinates, process them properly
    if (place?.geo_coordinates) {
      // Check if it's already a string in the format "lat,lng"
      if (typeof place.geo_coordinates === "string") {
        // Validate the format - should be two numbers separated by a comma
        const coordsMatch = place.geo_coordinates.match(
          /^(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)$/
        );
        if (coordsMatch) {
          return encodeURIComponent(place.geo_coordinates);
        }
      }
      // Check if it's an object with latitude and longitude properties
      else if (
        typeof place.geo_coordinates === "object" &&
        place.geo_coordinates.latitude !== undefined &&
        place.geo_coordinates.longitude !== undefined
      ) {
        return encodeURIComponent(
          `${place.geo_coordinates.latitude},${place.geo_coordinates.longitude}`
        );
      }
    }

    // For specific landmarks, use known accurate coordinates
    const placeName = (
      place?.place_name ||
      place?.place ||
      place?.name ||
      ""
    ).toLowerCase();

    // Add specific coordinates for famous landmarks
    if (placeName.includes("taj mahal")) {
      return encodeURIComponent("27.1751,78.0421");
    } else if (
      placeName.includes("amber fort") ||
      placeName.includes("amer fort")
    ) {
      return encodeURIComponent("26.9855,75.8513");
    } else if (placeName.includes("hawa mahal")) {
      return encodeURIComponent("26.9239,75.8267");
    } else if (
      placeName.includes("city palace") &&
      (placeName.includes("jaipur") || placeName.includes("rajasthan"))
    ) {
      return encodeURIComponent("26.9258,75.8237");
    } else if (placeName.includes("jal mahal")) {
      return encodeURIComponent("26.9537,75.8463");
    } else if (placeName.includes("qutub minar")) {
      return encodeURIComponent("28.5245,77.1855");
    } else if (placeName.includes("red fort")) {
      return encodeURIComponent("28.6562,77.2410");
    } else if (placeName.includes("india gate")) {
      return encodeURIComponent("28.6129,77.2295");
    }

    // Fallback to place name if no coordinates available
    return encodeURIComponent(
      place?.place_name || place?.place || place?.name || ""
    );
  };

  const mapQuery = getMapQuery();

  // Get rating stars (if available)
  const renderRatingStars = () => {
    // Check for rating in different possible structures
    const ratingValue = place?.rating;
    if (!ratingValue) return null;

    // Handle different rating formats (e.g., "4.5 stars" or 4.5)
    let rating;
    if (typeof ratingValue === "string") {
      // Extract numeric part if it's a string like "4.5 stars"
      const match = ratingValue.match(/(\d+(\.\d+)?)/);
      rating = match ? parseFloat(match[1]) : parseFloat(ratingValue);
    } else {
      rating = parseFloat(ratingValue);
    }

    if (isNaN(rating)) return null;

    return (
      <div className="flex items-center mt-1">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={`${
              i < rating ? "text-yellow-400" : "text-gray-300"
            } text-xs mr-1`}
          />
        ))}
        <span className="text-xs ml-1 text-gray-600">{place.rating}</span>
      </div>
    );
  };

  // Handle image error
  const handleImageError = (event) => {
    // If we already have a valid image URL that's not the one that just failed, don't replace it
    if (
      photoUrl &&
      !photoUrl.includes("undefined") &&
      !photoUrl.includes("null") &&
      photoUrl !== event?.target?.src
    ) {
      return;
    }

    // Get the place name from any available property
    const placeName = place?.place_name || place?.place || place?.name || "";

    // Check for specific landmarks first
    const lowerName = placeName.toLowerCase();
    let fallbackUrl = null;

    // Check for specific landmarks with hardcoded reliable image URLs
    if (lowerName.includes("taj mahal") || lowerName.includes("agra")) {
      fallbackUrl =
        "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&auto=format&fit=crop";
    } else if (
      lowerName.includes("amber fort") ||
      lowerName.includes("amer fort")
    ) {
      fallbackUrl =
        "https://images.unsplash.com/photo-1599930113854-d6d7fd522507?w=800&auto=format&fit=crop";
    } else if (lowerName.includes("hawa mahal")) {
      fallbackUrl =
        "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&auto=format&fit=crop";
    } else if (lowerName.includes("city palace")) {
      fallbackUrl =
        "https://images.unsplash.com/photo-1590080552494-dcda538fa459?w=800&auto=format&fit=crop";
    } else if (lowerName.includes("jal mahal")) {
      fallbackUrl =
        "https://images.unsplash.com/photo-1617516202907-ff75846e6667?w=800&auto=format&fit=crop";
    }
    // Add specific fallbacks for the problematic cards in the screenshot
    else if (lowerName.includes("jaigarh fort")) {
      fallbackUrl =
        "https://images.unsplash.com/photo-1624639173753-23a2fbbf5574?w=800&auto=format&fit=crop";
    } else if (lowerName.includes("nahargarh fort")) {
      fallbackUrl =
        "https://images.unsplash.com/photo-1592639738097-c5b7d3f732a7?w=800&auto=format&fit=crop";
    } else if (
      lowerName.includes("albert hall") ||
      (lowerName.includes("albert") && lowerName.includes("museum"))
    ) {
      fallbackUrl =
        "https://images.unsplash.com/photo-1574271005251-2875e769f6a2?w=800&auto=format&fit=crop";
    } else if (
      lowerName.includes("ranthambore") ||
      lowerName.includes("national park")
    ) {
      fallbackUrl =
        "https://images.unsplash.com/photo-1581996323777-9fde24488c9b?w=800&auto=format&fit=crop";
    }
    // Generic fort fallback
    else if (lowerName.includes("fort")) {
      fallbackUrl =
        "https://images.unsplash.com/photo-1599930113854-d6d7fd522507?w=800&auto=format&fit=crop";
    }
    // Generic museum fallback
    else if (lowerName.includes("museum") || lowerName.includes("hall")) {
      fallbackUrl =
        "https://images.unsplash.com/photo-1574271005251-2875e769f6a2?w=800&auto=format&fit=crop";
    }
    // Generic national park fallback
    else if (
      lowerName.includes("park") ||
      lowerName.includes("wildlife") ||
      lowerName.includes("sanctuary")
    ) {
      fallbackUrl =
        "https://images.unsplash.com/photo-1581996323777-9fde24488c9b?w=800&auto=format&fit=crop";
    } else {
      // Use the regular fallback system
      fallbackUrl = getFallbackImage(placeName);
    }

    // If we still don't have a valid URL, use a guaranteed default
    if (!fallbackUrl) {
      fallbackUrl = FALLBACK_IMAGES.default;
    }

    // Only update if the fallback is different from current URL to prevent infinite loop
    // and only if the current URL is invalid or undefined
    if (
      !photoUrl ||
      photoUrl.includes("undefined") ||
      photoUrl.includes("null") ||
      photoUrl !== fallbackUrl
    ) {
      setPhotoUrl(fallbackUrl);

      // Store this fallback in localStorage for future use
      try {
        localStorage.setItem(
          `place_image_${placeName.toLowerCase().replace(/\s+/g, "_")}`,
          fallbackUrl
        );
      } catch (err) {
        // Ignore storage errors
      }
    }
  };

  return (
    <Link
      to={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
      target="_blank"
    >
      <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:translate-y-[-5px] border border-gray-100">
        {/* Image section */}
        <div className="relative">
          {isLoading ? (
            <div className="h-[180px] w-full bg-gray-200 animate-pulse"></div>
          ) : (
            <>
              <img
                key={`${place?.place || place?.name || "place"}-${Date.now()}`}
                src={photoUrl || FALLBACK_IMAGES.default}
                alt={place?.place || "Place image"}
                className="h-[180px] w-full object-cover"
                onError={(e) => handleImageError(e)}
                onLoad={(e) => {
                  // Check if the image loaded successfully and has dimensions
                  if (e.target.naturalWidth > 0 && e.target.naturalHeight > 0) {
                    setIsLoading(false);
                    // Store the successful image URL in localStorage to use as a cache
                    const placeName =
                      place?.place_name || place?.place || place?.name || "";
                    if (placeName && photoUrl) {
                      try {
                        localStorage.setItem(
                          `place_image_${placeName
                            .toLowerCase()
                            .replace(/\s+/g, "_")}`,
                          photoUrl
                        );
                      } catch (err) {
                        // Ignore storage errors
                      }
                    }
                  } else {
                    // If image loaded but has no dimensions, trigger error handler
                    handleImageError(e);
                  }
                }}
                loading="eager"
                crossOrigin="anonymous"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

              {/* Favorite button */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsFavorite(!isFavorite);
                }}
                className="absolute top-3 right-3 bg-white/70 hover:bg-white p-2 rounded-full backdrop-blur-sm transition-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 ${
                    isFavorite ? "text-red-500 fill-red-500" : "text-gray-500"
                  }`}
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  fill="none"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              </button>

              {/* Location badge */}
              {place?.geo_coordinates && (
                <div className="absolute top-3 left-3 bg-blue-500/80 text-white text-xs py-1 px-2 rounded-lg backdrop-blur-sm flex items-center">
                  <FaMapMarkerAlt className="mr-1" />
                  <span>Map</span>
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className="font-bold text-lg text-white drop-shadow-md">
                  {place?.place_name ||
                    place?.place ||
                    place?.name ||
                    "Attraction"}
                </h2>
                {(place?.time || place?.best_time_to_visit) && (
                  <div className="flex items-center text-white text-xs mt-1">
                    <FaClock className="mr-1" />
                    <div className="bg-orange-500/80 py-1 px-2 rounded-full backdrop-blur-sm inline-block">
                      {place?.time || place?.best_time_to_visit}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Content section */}
        <div className="p-4">
          <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px]">
            {place?.details ||
              place?.place_details ||
              place?.description ||
              "No details available"}
          </p>

          <div className="border-t border-gray-100 mt-3 pt-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center text-sm text-gray-500">
                <div className="bg-orange-100 p-1.5 rounded-lg mr-2">
                  <FaTicketAlt className="text-orange-500 text-xs" />
                </div>
                <span>
                  {place?.ticket_pricing ||
                    place?.ticket_price ||
                    place?.price ||
                    "Free Entry"}
                </span>
              </div>

              <div className="flex items-center bg-blue-50 hover:bg-blue-100 transition-colors px-2 py-1 rounded-lg">
                <FaMapMarkerAlt className="mr-1 text-blue-500" />
                <span className="text-blue-600 text-xs font-medium">
                  View on Map
                </span>
              </div>
            </div>

            {renderRatingStars()}

            {/* Additional info button */}
            <div className="mt-3 text-center">
              <button className="text-xs text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center w-full">
                <FaInfoCircle className="mr-1" />
                <span>More Details</span>
              </button>
            </div>
          </div>
        </div>

        {/* Visit tag */}
        {(() => {
          // Extract rating value similar to renderRatingStars
          const ratingValue = place?.rating;
          if (!ratingValue) return null;

          let rating;
          if (typeof ratingValue === "string") {
            const match = ratingValue.match(/(\d+(\.\d+)?)/);
            rating = match ? parseFloat(match[1]) : parseFloat(ratingValue);
          } else {
            rating = parseFloat(ratingValue);
          }

          return !isNaN(rating) && rating >= 4.5 ? (
            <div className="absolute -right-1 -top-1 bg-gradient-to-br from-green-400 to-green-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg transform rotate-0 shadow-md">
              MUST VISIT
            </div>
          ) : null;
        })()}
      </div>
    </Link>
  );
}

export default PlaceCardItem;
