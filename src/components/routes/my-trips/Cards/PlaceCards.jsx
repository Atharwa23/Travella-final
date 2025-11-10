import React, { useContext, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";
import { LogInContext } from "@/Context/LogInContext/Login";
import { useCache } from "@/Context/Cache/CacheContext";
import { getPlaceImageUrlUsingSDK } from "@/utils/placeImageHelper";

// --- ASSUMPTIONS ---
// You MUST import these from your API util file, just like in HotelCards
// import { getPlaceDetails, PHOTO_URL } from "@/utils/googleApi"; 
// ---

function PlaceCards({ place }) {
  
  const { placeCache, setPlaceCache, setSelectedPlace } = useCache();
  const { trip } = useContext(LogInContext);
  const city = trip?.tripData?.location || trip?.userSelection?.location;

  const [details, setDetails] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getPlaceInfo = async () => {
      if (!place?.activityName || !city) {
        setIsLoading(false);
        return;
      }

      const cacheKey = `${place.activityName}__${city}`;
      const cachedData = placeCache.get(cacheKey);

      if (cachedData) {
        setDetails(cachedData.details);
        setImageUrl(cachedData.imageUrl);
        setIsLoading(false);
        return;
      }

      let placeDetails = null;
      let photoUrl = "";

      try {
        // --- 1. FIX: Added the actual API call ---
        const data = { textQuery: `${place.activityName} ${city}`.trim() };
        // const result = await getPlaceDetails(data); // <-- UNCOMMENT THIS
        // placeDetails = result?.data?.places?.[0]; // <-- UNCOMMENT THIS
        
        if (placeDetails) {
          setDetails(placeDetails);
        }

        // --- 2. FIX: Restored the logic from HotelCards ---
        if (placeDetails?.photos?.[0]?.name) {
          // This is the PREFERRED path.
          // photoUrl = PHOTO_URL.replace("{replace}", placeDetails.photos[0].name); // <-- UNCOMMENT THIS
          setImageUrl(photoUrl);
        } else {
          // This is the FALLBACK path.
          photoUrl = await getPlaceImageUrlUsingSDK(place.activityName, city);
          console.log("Fallback SDK URL:", photoUrl); // Good for debugging
          setImageUrl(photoUrl || "/logo.png");
        }
      } catch (err) {
        console.error(
          "Error fetching place details, falling back to SDK...",
          err
        );
        try {
          // Final fallback
          photoUrl = await getPlaceImageUrlUsingSDK(place.activityName, city);
          setImageUrl(photoUrl || "/logo.png");
        } catch (sdkErr) {
          console.error("SDK image fetch also failed:", sdkErr);
          setImageUrl("/logo.png");
        }
      } finally {
        const newDataToCache = {
          details: placeDetails,
          // 3. FIX: Ensure the final photoUrl is cached
          imageUrl: photoUrl || "/logo.png",
        };

        const newCache = new Map(placeCache);
        newCache.set(cacheKey, newDataToCache);
        setPlaceCache(newCache);
        setIsLoading(false);
      }
    };

    if (trip && place) {
      getPlaceInfo();
    }
  }, [trip, place, city, placeCache, setPlaceCache]);

  const handleSelectPlace = () => {
    const combinedPlace = {
      ...place,
      ...details,
      imageUrl: imageUrl,
    };
    setSelectedPlace(combinedPlace);
  };

  if (!place || !place.activityName) {
    return (
      <Card className="p-1 h-full flex items-center justify-center bg-card/50 backdrop-blur-sm">
        <p className="text-muted-foreground">No place data available</p>
      </Card>
    );
  }

  const displayLat =
    details?.location?.latitude || place.coordinates?.latitude || 0;
  const displayLng =
    details?.location?.longitude || place.coordinates?.longitude || 0;

  const latStr = encodeURIComponent(displayLat);
  const lonStr = encodeURIComponent(displayLng);

  return (
    <Link
      to={`/details-for-place/${latStr}/${lonStr}`}
      onClick={handleSelectPlace}
      className="h-full"
    >
      <Card className="p-1 h-full flex flex-col gap-3 hover:scale-105 transition-all duration-300 group bg-card/90 backdrop-blur-xl shadow-md hover:shadow-primary/20">
        <div className="img h-48 w-full rounded-lg relative overflow-hidden bg-muted">
          {isLoading ? (
            <div className="w-full h-full bg-muted/70 animate-pulse" />
          ) : (
            <img
              src={imageUrl}
              className="h-full w-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500"
              alt={place?.activityName || "Place"}
              onError={(e) => {
                console.log("This is me", imageUrl)
                e.target.src = "/logo.png";
              }}
            />
          )}
        </div>
        <div className="text-content w-full flex flex-col h-full">
          <CardHeader className="w-full">
            <CardTitle className="opacity-90 w-full text-center text-xl font-bold md:text-2xl bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-600 dark:from-orange-400 dark:via-amber-300 dark:to-yellow-400 bg-clip-text text-transparent">
              {place?.activityName || "Unknown Place"}
            </CardTitle>
            <CardDescription className="line-clamp-2 tracking-wide w-full text-center text-sm md:text-md">
              {place?.details || "No details available"}
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <div className="places-details space-y-1 text-center">
              <span className="font-medium text-foreground/90 opacity-90 text-sm md:text-base tracking-wide">
                🕒 Timings: {place?.timings || "N/A"}
              </span>
              <br />
              <span className="font-medium text-foreground/90 opacity-90 text-sm md:text-base tracking-wide">
                💵 Price: {place?.pricing || "N/A"}
              </span>
              <br />
              <span className="font-medium text-muted-foreground opacity-90 text-sm md:text-base tracking-wide line-clamp-1">
                📍 Location: {place?.location || "N/A"}
              </span>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}

export default PlaceCards;