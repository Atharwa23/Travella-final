import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPlaceImageUrlUsingSDK } from "@/utils/placeImageHelper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogInContext } from "@/Context/LogInContext/Login";
// Assuming PHOTO_URL is exported from GlobalApi like in your other file
import { getPlaceDetails, PHOTO_URL } from "@/Service/GlobalApi"; 
import { useCache } from "@/Context/Cache/CacheContext";

// NEW: Skeleton Component for loading state
function HotelCardSkeleton() {
  return (
    <Card className="p-1 h-full flex flex-col gap-3 bg-card/50 backdrop-blur-sm">
      <div className="img h-48 w-full rounded-lg bg-muted/70 animate-pulse" />
      <div className="text-content w-full flex flex-col h-full">
        <CardHeader className="w-full">
          <div className="h-8 w-3/4 bg-muted/70 animate-pulse rounded-md" />
          <div className="h-4 w-full bg-muted/70 animate-pulse rounded-md mt-2" />
        </CardHeader>
        <CardContent className="w-full space-y-2">
          <div className="h-4 w-1/2 bg-muted/70 animate-pulse rounded-md" />
          <div className="h-4 w-1/2 bg-muted/70 animate-pulse rounded-md" />
          <div className="h-4 w-full bg-muted/70 animate-pulse rounded-md" />
        </CardContent>
      </div>
    </Card>
  );
}

function HotelCards({ hotel }) {
  const { setSelectedHotel } = useCache();
  const { trip } = useContext(LogInContext);
  const city = trip?.tripData?.location || trip?.userSelection?.location;

  // --- Refactored State ---
  const [details, setDetails] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  
  // --- Streamlined Data Fetching ---
  useEffect(() => {
    const getPlaceInfo = async () => {
      if (!hotel?.name || !city) {
        setIsLoading(false);
        return;
      }

      let place = null;
      let photoUrl = "";

      try {
        // 1. Try to get Google Place details
        const data = { textQuery: `${hotel.name} ${city}`.trim() };
        const result = await getPlaceDetails(data);
        place = result?.data?.places?.[0]; // Assuming 'data' wrapper based on your code
        
        if (place) {
          setDetails(place); // Save all fetched details
        }

        // 2. Try to get image from Google Place details
        if (place?.photos?.[0]?.name) {
          photoUrl = PHOTO_URL.replace("{replace}", place.photos[0].name);
          setImageUrl(photoUrl);
        } else {
          // 3. Fallback to SDK helper
          photoUrl = await getPlaceImageUrlUsingSDK(hotel.name, city);
          setImageUrl(photoUrl || "/logo.png");
        }

      } catch (err) {
        console.error("Error fetching place details, falling back to SDK...", err);
        try {
          // 4. Final fallback to SDK if getPlaceDetails fails
          photoUrl = await getPlaceImageUrlUsingSDK(hotel.name, city);
          setImageUrl(photoUrl || "/logo.png");
        } catch (sdkErr) {
          console.error("SDK image fetch also failed:", sdkErr);
          setImageUrl("/logo.png");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (trip && hotel) {
      getPlaceInfo();
    }
  }, [trip, hotel, city]);


  // 6. Fixed Context/Cache function
  const handleSelectHotel = () => {
    // Combine base AI data with rich Google Place data
    const combinedHotel = {
      ...hotel, // Original data (name, price, etc.)
      ...details, // Fetched data (rating, address, maps URI, etc.)
      imageUrl: imageUrl, // The final image URL
    };
    setSelectedHotel(combinedHotel);
  };

  // 4. Render skeleton while loading
  if (isLoading) {
    return <HotelCardSkeleton />;
  }

  // --- Fixed Render Logic ---
  const displayRating = details?.rating || hotel.rating || "N/A";
  const displayAddress = details?.formattedAddress || hotel.address || "Address not found";
  const displayLat = details?.location?.latitude || hotel.latitude || 0;
  const displayLng = details?.location?.longitude || hotel.longitude || 0;

  return (
    <Link
      to={`/details-for-hotel/${displayLat}/${displayLng}`}
      onClick={handleSelectHotel}
      className="h-full" // Added h-full for link
    >
      {/* 5. Themed Card component */}
      <Card className="p-1 h-full flex flex-col gap-3 hover:scale-105 transition-all duration-300 group bg-card/90 backdrop-blur-xl shadow-md hover:shadow-primary/20">
        <div className="img h-48 w-full rounded-lg overflow-hidden bg-muted">
          <img
            src={imageUrl || "/logo.png"}
            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
            alt={hotel.name}
            onError={(e) => { e.target.src = "/logo.png"; }}
          />
        </div>
        <div className="text-content w-full flex flex-col h-full">
          <CardHeader className="w-full">
            <CardTitle className="opacity-90 w-full text-center text-xl font-bold md:text-2xl bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-600 dark:from-orange-400 dark:via-amber-300 dark:to-yellow-400 bg-clip-text text-transparent">
              {hotel.name}
            </CardTitle>
            <CardDescription className="line-clamp-2 tracking-wide w-full text-center text-sm md:text-md">
              {hotel.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <div className="hotel-details space-y-1">
              <span className="font-medium text-foreground/90 opacity-90 text-sm md:text-base tracking-wide flex items-center gap-2 justify-center">
                ⭐ {displayRating}
              </span>
              <span className="font-medium text-foreground/90 opacity-90 text-sm md:text-base tracking-wide flex items-center gap-2 justify-center">
                💵 {hotel.price}
              </span>
              <span className="font-medium text-muted-foreground opacity-90 text-sm md:text-base tracking-wide line-clamp-1 text-center">
                📍 {displayAddress}
              </span>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}

export default HotelCards;