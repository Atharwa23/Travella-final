import { getCityDetails, PHOTO_URL } from "@/Service/GlobalApi";
import React, { useEffect, useState } from "react";
import { getPlaceImageUrlUsingSDK } from "@/utils/placeImageHelper";
import { Card, CardContent } from "@/components/ui/card"; // Import the Card component

const AlltripsCard = ({ trip }) => {
  const [cityDets, setCityDets] = useState(null);
  const [city, setCity] = useState(
    trip?.userSelection?.location || trip?.tripData?.location || ""
  );
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // YOUR DATA FETCHING LOGIC IS UNCHANGED
  const getCityInfo = async () => {
    if (!city) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await getCityDetails({ textQuery: city });
      const place = res?.places?.[0] || null;
      setCityDets(place);
      if (place?.photos?.[0]?.name) {
        const photoUrl = PHOTO_URL.replace("{replace}", place.photos[0].name);
        setImageUrl(photoUrl);
        setIsLoading(false);
      } else {
        const url = await getPlaceImageUrlUsingSDK(city, city);
        setImageUrl(url || "/logo.png");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error fetching city details:", err);
      try {
        const url = await getPlaceImageUrlUsingSDK(city, city);
        setImageUrl(url || "/logo.png");
      } catch (sdkErr) {
        console.error("Error fetching image URL:", sdkErr);
        setImageUrl("/logo.png");
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (trip && city) {
      getCityInfo();
    } else {
      setIsLoading(false);
    }
  }, [trip, city]);

  return (
    // 1. Replaced main div with our themed Card component
    // 4. Added "group" for the hover effect
    <Card className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col group bg-card/90 backdrop-blur-xl">
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        {isLoading ? (
          // 2. Replaced "Loading..." text with a themed, animated skeleton
          <div className="w-full h-full bg-muted/70 animate-pulse" />
        ) : (
          <img
            src={imageUrl || "/logo.png"}
            // 4. Added group-hover effect
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            alt={trip?.userSelection?.location || "Trip location"}
            onError={(e) => {
              e.target.src = "/logo.png";
            }}
          />
        )}

        {/* Badge - This was already styled well */}
        <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
          {trip?.userSelection?.noOfDays}{" "}
          {trip?.userSelection?.noOfDays > 1 ? "Days" : "Day"}
        </div>
      </div>

      {/* 1. Replaced div with CardContent */}
      <CardContent className="p-4 flex-1 flex flex-col gap-2">
        {/* Location */}
        {/* 2. Replaced blue gradient with our primary (amber) gradient */}
        <h3 className="text-xl font-bold bg-gradient-to-b from-primary/90 to-primary/60 bg-clip-text text-transparent line-clamp-2">
          {trip?.userSelection?.location || "Unknown Location"}
        </h3>

        {/* Trip Details */}
        <div className="flex flex-col gap-1.5 text-sm text-foreground/80">
          <div className="flex items-center gap-2">
            <span className="font-medium">📅 Duration:</span>
            <span>
              {trip?.userSelection?.noOfDays}{" "}
              {trip?.userSelection?.noOfDays > 1 ? "Days" : "Day"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">💰 Budget:</span>
            <span>{trip?.userSelection?.Budget || "Not specified"}</span>
          </div>

          {/* 3. BUG FIX: Changed "traveler" to "People" */}
          {trip?.userSelection?.People && (
            <div className="flex items-center gap-2">
              <span className="font-medium">👥 Travelers:</span>
              <span>{trip.userSelection.People}</span>
            </div>
          )}
        </div>

        {/* Optional: City Description */}
        {cityDets?.formattedAddress && (
          <p className="text-xs text-foreground/60 mt-2 line-clamp-2">
            📍 {cityDets.formattedAddress}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default AlltripsCard;