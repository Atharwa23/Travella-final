// A simple in-memory cache to store fetched image URLs
const imageCache = new Map();
const DEFAULT_FALLBACK = "/logo.png";

/**
 * Get place image via Google Places JS SDK (no CORS here)
 * Now with caching and using findPlaceFromQuery.
 *
 * @param {string} placeName
 * @param {string} cityName
 * @returns Promise<string> imageUrl
 */
export function getPlaceImageUrlUsingSDK(placeName = "", cityName = "") {
  return new Promise((resolve) => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      console.error("Google Maps JS SDK is not loaded.");
      return resolve(DEFAULT_FALLBACK);
    }

    if (!placeName) {
      return resolve(DEFAULT_FALLBACK);
    }

    const finalQuery = cityName ? `${placeName} ${cityName}` : placeName;

    // 2. Check our cache first
    if (imageCache.has(finalQuery)) {
      // console.log("Found in cache:", finalQuery);
      return resolve(imageCache.get(finalQuery));
    }

    // 3. Use findPlaceFromQuery (more efficient than textSearch)
    const request = {
      query: finalQuery,
      fields: ["name", "photos"], // Only request the fields we need
    };

    // Create the service
    const dummyDiv = document.createElement("div");
    const service = new google.maps.places.PlacesService(dummyDiv);

    service.findPlaceFromQuery(request, (results, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !results?.length) {
        console.warn(
          `[SDK] findPlaceFromQuery: No results for: "${finalQuery}", Status: ${status}`
        );
        // Cache the failure to avoid re-fetching
        imageCache.set(finalQuery, DEFAULT_FALLBACK);
        resolve(DEFAULT_FALLBACK);
        return;
      }

      const photos = results[0]?.photos;
      if (!photos?.length) {
        console.warn(`[SDK] findPlaceFromQuery: No photos found for: "${finalQuery}"`);
        // Cache the failure
        imageCache.set(finalQuery, DEFAULT_FALLBACK);
        resolve(DEFAULT_FALLBACK);
        return;
      }

      // 4. Get the URL and save to cache
      const imageUrl = photos[0].getUrl({ maxWidth: 800 });
      imageCache.set(finalQuery, imageUrl);
      resolve(imageUrl);
    });
  });
}