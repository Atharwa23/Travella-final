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

function PlaceCards({ place }) {
  const { trip } = useContext(LogInContext);
  const city = trip?.tripData?.location || trip?.userSelection?.location;

  const [imageUrl, setImageUrl] = useState(""); // Start empty
  const [loading, setLoading] = useState(true);

  const { setSelectedPlace } = useCache();

  // Safety check: If place is undefined, show fallback
  if (!place || !place.activityName) {
    return (
      <Card className="p-1 h-full flex items-center justify-center bg-card/50 backdrop-blur-sm">
        <p className="text-muted-foreground">No place data available</p>
      </Card>
    );
  }

  useEffect(() => {
    let isMounted = true; // Handle component unmounting
    async function fetchPlaceImage() {
      setLoading(true);
      try {
        const url = await getPlaceImageUrlUsingSDK(place?.activityName, city);
        if (isMounted) {
          setImageUrl(url || "/logo.png"); // Set placeholder if SDK returns null
        }
      } catch (error) {
        console.error("Failed to fetch place image:", error);
        if (isMounted) {
          setImageUrl("/logo.png");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (place?.activityName && city) {
      fetchPlaceImage();
    } else {
      setLoading(false);
      setImageUrl("/logo.png");
    }
    
    return () => { isMounted = false; };
  }, [place, city]);

  const handleSelectPlace = () => {
    setSelectedPlace({
      ...place,
      imageUrl: imageUrl
    });
  };
  
  const latitude = place.coordinates?.latitude || 0;
  const longitude = place.coordinates?.longitude || 0;
  const latStr = encodeURIComponent(latitude);
  const lonStr = encodeURIComponent(longitude);

  return (
    <Link
      to={`/details-for-place/${latStr}/${lonStr}`}
      onClick={handleSelectPlace}
      className="h-full" // Added h-full for the link
    >
      {/* 1. Themed Card component */}
      <Card className="p-1 h-full flex flex-col gap-3 hover:scale-105 transition-all duration-300 group bg-card/90 backdrop-blur-xl shadow-md hover:shadow-primary/20">
        {/* 5. Fixed image height to h-48 for consistency */}
        <div className="img h-48 w-full rounded-lg relative overflow-hidden bg-muted">
          {loading ? (
            // 4. Improved Loading Skeleton
            <div className="w-full h-full bg-muted/70 animate-pulse" />
          ) : (
            <img
              src={imageUrl}
              className="h-full w-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500"
              alt={place?.activityName || "Place"}
              // 6. Added Image Fallback
              onError={(e) => {
                e.target.src = "/logo.png";
              }}
            />
          )}
        </div>
        <div className="text-content w-full flex flex-col h-full">
          <CardHeader className="w-full">
            {/* 2. Amber Gradient Title */}
            <CardTitle className="opacity-90 w-full text-center text-xl font-bold md:text-2xl bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-600 dark:from-orange-400 dark:via-amber-300 dark:to-yellow-400 bg-clip-text text-transparent">
              {place?.activityName || "Unknown Place"}
            </CardTitle>
            {/* 3. Theme-Aware Text */}
            <CardDescription className="line-clamp-2 tracking-wide w-full text-center text-sm md:text-md">
              {place?.details || "No details available"}
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            {/* 3. Theme-Aware Text */}
            <div className="places-details space-y-1 text-center">
              <span className="font-medium text-foreground/90 opacity-90 text-sm md:text-base tracking-wide">
                🕒 Timings: {place?.timings || "N/A"}
              </span>
              <br />
              <span className="font-medium text-foreground/90 opacity-90 text-sm md:text-base tracking-wide">
                💵 Price: {place?.pricing || "N/A"}
              </span>
              <br />
              {/* 3. Muted Text for location */}
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