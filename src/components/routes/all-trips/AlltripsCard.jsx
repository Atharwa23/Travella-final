import { getCityDetails, PHOTO_URL } from "@/Service/GlobalApi";
import React, { useEffect, useState } from "react";
import { getPlaceImageUrlUsingSDK } from "@/utils/placeImageHelper";

const AlltripsCard = ({ trip }) => {
  const [cityDets, setCityDets] = useState(null);
  const [city, setCity] = useState(trip?.userSelection?.location || trip?.tripData?.location || "");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const getCityInfo = async () => {
    if (!city) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await getCityDetails({ textQuery: city });
      const place = res?.places?.[0] || null;
      setCityDets(place);
      
      // Try to get image from city details first
      if (place?.photos?.[0]?.name) {
        const photoUrl = PHOTO_URL.replace("{replace}", place.photos[0].name);
        setImageUrl(photoUrl);
        setIsLoading(false);
      } else {
        // Fallback to SDK helper
        const url = await getPlaceImageUrlUsingSDK(city, city);
        setImageUrl(url || "/logo.png");
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error fetching city details:", err);
      // Try SDK helper as fallback
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
    <div className="card-card border border-foreground/20 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      {/* Image Section */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-200">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400 text-sm">Loading...</span>
          </div>
        ) : (
          <img
            src={imageUrl || "/logo.png"}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            alt={trip?.userSelection?.location || "Trip location"}
            onError={(e) => {
              e.target.src = "/logo.png";
            }}
          />
        )}
        
        {/* Optional overlay badge */}
        <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
          {trip?.userSelection?.noOfDays} {trip?.userSelection?.noOfDays > 1 ? "Days" : "Day"}
        </div>
      </div>

      {/* Details Section */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        {/* Location */}
        <h3 className="text-xl font-bold bg-gradient-to-b from-blue-400 to-blue-700 bg-clip-text text-transparent line-clamp-2">
          {trip?.userSelection?.location || "Unknown Location"}
        </h3>

        {/* Trip Details */}
        <div className="flex flex-col gap-1.5 text-sm text-foreground/80">
          <div className="flex items-center gap-2">
            <span className="font-medium">📅 Duration:</span>
            <span>{trip?.userSelection?.noOfDays} {trip?.userSelection?.noOfDays > 1 ? "Days" : "Day"}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">💰 Budget:</span>
            <span>{trip?.userSelection?.Budget || "Not specified"}</span>
          </div>

          {trip?.userSelection?.traveler && (
            <div className="flex items-center gap-2">
              <span className="font-medium">👥 Travelers:</span>
              <span>{trip.userSelection.traveler}</span>
            </div>
          )}
        </div>

        {/* Optional: City Description */}
        {cityDets?.formattedAddress && (
          <p className="text-xs text-foreground/60 mt-2 line-clamp-2">
            📍 {cityDets.formattedAddress}
          </p>
        )}
      </div>
    </div>
  );
}

export default AlltripsCard;