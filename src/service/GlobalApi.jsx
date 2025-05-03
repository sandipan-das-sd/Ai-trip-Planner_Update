// import axios from "axios"

// const BASE_URL='https://places.googleapis.com/v1/places:searchText'

// const config={
//    headers:{
//        'Content-Type': 'application/json',
//        'X-Goog-Api-Key': import.meta.env.VITE_GOOGLE_PLACE_API_KEY,
//        'X-Goog-FieldMask': [
//            'places.photos',
//            'places.displayName',
//            'places.id'
//        ]
//    }
// }

// export const GetPlaceDetails=(data)=>axios.post(BASE_URL,data,config)

//export const PHOTO_REF_URL = 'https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=1000&maxWidthPx=1900&key=' + import.meta.env.VITE_GOOGLE_PLACE_API_KEY

// import axios from "axios";

// const BASE_URL = 'https://places.googleapis.com/v1/places:searchText';

// const config = {
//   headers: {
//     'Content-Type': 'application/json',
//     'X-Goog-Api-Key': import.meta.env.VITE_GOOGLE_PLACE_API_KEY,
//     'X-Goog-FieldMask': [
//       'places.photos',
//       'places.displayName',
//       'places.id',
//       'places.formattedAddress'
//     ]
//   }
// };

//Safely make API calls with validation
// export const GetPlaceDetails = (data) => {
//   // Ensure textQuery is not empty to prevent 400 errors
//   if (!data.textQuery || data.textQuery.trim() === '') {
//     console.error('Empty text query provided to GetPlaceDetails');
//     return Promise.reject(new Error('Empty text query'));
//   }

//   return axios.post(BASE_URL, data, config);
// };

// export const PHOTO_REF_URL = 'https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=1000&maxWidthPx=1900&key=' + import.meta.env.VITE_GOOGLE_PLACE_API_KEY;

import axios from "axios";

// Cache to avoid repeated API calls for the same query
const imageCache = new Map();

const BASE_URL = "https://places.googleapis.com/v1/places:searchText";

const config = {
  headers: {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": import.meta.env.VITE_GOOGLE_PLACE_API_KEY,
    "X-Goog-FieldMask": [
      "places.photos",
      "places.displayName",
      "places.id",
      "places.formattedAddress",
      "places.location",
    ],
  },
};

// Main API call function with validation
export const GetPlaceDetails = (data) => {
  // Validate input to prevent 400 errors
  if (!data.textQuery || data.textQuery.trim() === "") {
    console.error("Empty text query provided to GetPlaceDetails");
    return Promise.reject(new Error("Empty text query"));
  }

  return axios.post(BASE_URL, data, config);
};

export const PHOTO_REF_URL =
  "https://places.googleapis.com/v1/{NAME}/media?maxHeightPx=1000&maxWidthPx=1900&key=" +
  import.meta.env.VITE_GOOGLE_PLACE_API_KEY;

// Reliably get photo URL with caching and multiple attempts
export const GetPhotoUrl = async (searchName, extraContext = "") => {
  try {
    // Check cache first
    const cacheKey = `${searchName}${extraContext ? `-${extraContext}` : ""}`;
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey);
    }

    // For specific landmarks, use more precise search terms
    let enhancedSearchName = searchName;
    let enhancedContext = extraContext;

    // Improve search for common landmarks that might return incorrect images
    const lowerName = searchName.toLowerCase();

    // Add country context for famous landmarks to avoid confusion
    if (lowerName.includes("taj mahal")) {
      enhancedSearchName = "Taj Mahal";
      enhancedContext = "Agra India monument";
    } else if (
      lowerName.includes("amber fort") ||
      lowerName.includes("amer fort")
    ) {
      enhancedSearchName = "Amber Fort";
      enhancedContext = "Jaipur India";
    } else if (lowerName.includes("city palace")) {
      enhancedSearchName = "City Palace";
      enhancedContext = extraContext + " India";
    } else if (lowerName.includes("jal mahal")) {
      enhancedSearchName = "Jal Mahal";
      enhancedContext = "Jaipur water palace";
    } else if (lowerName.includes("hawa mahal")) {
      enhancedSearchName = "Hawa Mahal";
      enhancedContext = "Jaipur Palace of Winds";
    }

    // First attempt with most specific query
    const searchQuery = enhancedContext
      ? `${enhancedSearchName} ${enhancedContext}`
      : enhancedSearchName;
    const data = { textQuery: searchQuery };

    try {
      const result = await GetPlaceDetails(data);

      if (
        result.data.places?.length > 0 &&
        result.data.places[0].photos?.length > 0
      ) {
        // Always use the first photo (typically the main/best image)
        const photoName = result.data.places[0].photos[0].name;
        const photoUrl = PHOTO_REF_URL.replace("{NAME}", photoName);

        // Cache the result
        imageCache.set(cacheKey, photoUrl);
        return photoUrl;
      }
    } catch (error) {
      console.log(`First attempt failed for "${searchName}": ${error.message}`);
    }

    // Second attempt with simpler query
    if (extraContext) {
      try {
        const simpleData = { textQuery: enhancedSearchName };
        const result = await GetPlaceDetails(simpleData);

        if (
          result.data.places?.length > 0 &&
          result.data.places[0].photos?.length > 0
        ) {
          const photoName = result.data.places[0].photos[0].name;
          const photoUrl = PHOTO_REF_URL.replace("{NAME}", photoName);

          // Cache the result
          imageCache.set(cacheKey, photoUrl);
          return photoUrl;
        }
      } catch (error) {
        console.log(
          `Second attempt failed for "${searchName}": ${error.message}`
        );
      }
    }

    // Third attempt with broader search terms
    try {
      // Add more context for landmarks to improve results
      const category = searchName.toLowerCase().includes("hotel")
        ? "building"
        : searchName.toLowerCase().includes("fort")
        ? "fort in India"
        : searchName.toLowerCase().includes("palace")
        ? "palace in India"
        : "landmark";

      const broadData = {
        textQuery: `${enhancedSearchName} ${category}`,
      };
      const result = await GetPlaceDetails(broadData);

      if (
        result.data.places?.length > 0 &&
        result.data.places[0].photos?.length > 0
      ) {
        const photoName = result.data.places[0].photos[0].name;
        const photoUrl = PHOTO_REF_URL.replace("{NAME}", photoName);

        // Cache the result
        imageCache.set(cacheKey, photoUrl);
        return photoUrl;
      }
    } catch (error) {
      console.log(`Third attempt failed for "${searchName}": ${error.message}`);
    }

    // No image found after all attempts
    return null;
  } catch (error) {
    console.error(`Error in GetPhotoUrl for "${searchName}":`, error);
    return null;
  }
};
