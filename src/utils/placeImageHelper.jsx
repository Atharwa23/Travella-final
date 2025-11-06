const DEFAULT_FALLBACK = "/logo.png";

/**
 * Get place image via Google Places JS SDK (no CORS here)
 * @param {string} placeName
 * @param {string} cityName
 * @returns Promise<string> imageUrl
 */
export function getPlaceImageUrlUsingSDK(placeName = "", cityName = "") {
  return new Promise((resolve) => {
    if (!placeName) return resolve(DEFAULT_FALLBACK);

    const finalQuery = cityName ? `${placeName} ${cityName}` : placeName;

    const dummyDiv = document.createElement("div");
    const service = new google.maps.places.PlacesService(dummyDiv);

    service.textSearch({ query: finalQuery }, (results, status) => {
      if (status !== google.maps.places.PlacesServiceStatus.OK || !results?.length) {
        console.warn("No results for:", finalQuery);
        resolve(DEFAULT_FALLBACK);
        return;
      }

      const photos = results[0]?.photos;
      if (!photos?.length) {
        console.warn("No photos found for:", finalQuery);
        resolve(DEFAULT_FALLBACK);
        return;
      }

      resolve(photos[0].getUrl({ maxWidth: 800 }));
    });
  });
}