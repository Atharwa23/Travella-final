import axios from "axios";

// ===========================
// Base URL for Google Places API
// ===========================
const BASE_URL = "https://places.googleapis.com/v1/places:searchText";

// ===========================
// Config for place search
// ===========================
const configPlace = {
  headers: {
    "Content-Type": "application/json",
    // API key is appended to the URL as a query param below because some Google endpoints
    // do not accept the API key in a custom header. Keep FieldMask header.
    "X-Goog-FieldMask":
      "places.id,places.name,places.displayName,places.formattedAddress,places.photos,places.googleMapsUri,places.location,places.priceLevel,places.rating",
  },
};

// ===========================
// Config for city search
// ===========================
const configCity = {
  headers: {
    "Content-Type": "application/json",
    "X-Goog-FieldMask":
      "places.name,places.displayName,places.photos,places.googleMapsUri,places.location",
  },
};

// ===========================
// Google Place Photo URL
// Replace {replace} with your place.photoName
// ===========================
export const PHOTO_URL =
  "https://places.googleapis.com/v1/{replace}/media?maxHeightPx=1000&key=" +
  import.meta.env.VITE_GOOGLE_MAP_API_KEY;

// ===========================
// Fetch details of a place
// Example: getPlaceDetails({ textQuery: "Taj Mahal Agra" })
// ===========================
export const getPlaceDetails = async (data) => {
  try {
    // Accept string input or object callers
    const raw = typeof data === 'string' ? { textQuery: data } : data;
    // Accept both { textQuery } and { query } callers
    const query = raw?.textQuery || raw?.query || raw?.q;
    if (!query) {
      const err = new Error('Missing query for place details');
      console.error('Places API request skipped:', err.message, { data });
      throw err;
    }

    const key = import.meta.env.VITE_GOOGLE_MAP_API_KEY;
    const url = key ? `${BASE_URL}?key=${key}` : BASE_URL;

    // FIXED: Use textQuery instead of query
    const body = { textQuery: query };

    const response = await axios.post(url, body, configPlace);
    return response.data;
  } catch (error) {
    console.error(
      "Places API Error:",
      error.response?.status,
      error.response?.data || error.message
    );

    if (error.response?.status === 403) {
      console.error(
        "❌ API Key issue: Make sure 'Places API (New)' is enabled in Google Cloud Console"
      );
    }
    throw error;
  }
};

// ===========================
// Fetch details of a city
// Example: getCityDetails({ textQuery: "New York" })
// ===========================
export const getCityDetails = async (data) => {
  try {
    const raw = typeof data === 'string' ? { textQuery: data } : data;
    const query = raw?.textQuery || raw?.query || raw?.q;
    if (!query) {
      const err = new Error('Missing query for city details');
      console.error('City API request skipped:', err.message, { data });
      throw err;
    }

    const key = import.meta.env.VITE_GOOGLE_MAP_API_KEY;
    const url = key ? `${BASE_URL}?key=${key}` : BASE_URL;

    // FIXED: Use textQuery instead of query
    const body = { textQuery: query };

    const response = await axios.post(url, body, configCity);
    return response.data;
  } catch (error) {
    console.error(
      "City API Error:",
      error.response?.status,
      error.response?.data || error.message
    );

    if (error.response?.status === 403) {
      console.error(
        "❌ API Key issue: Make sure 'Places API (New)' is enabled in Google Cloud Console"
      );
    }
    throw error;
  }
};

// ===========================
// Fetch route between origin and destination
// Calls your backend endpoint
// ===========================
export const getRoute = async (origin, destination) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/get-route`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ origin, destination }),
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching route:", error);
    return null;
  }
};