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
  const city = trip?.tripData?.location;

  const [imageUrl, setImageUrl] = useState("/logo.png");
  const [loading, setLoading] = useState(true);
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState(place.coordinates?.latitude || 0);
  const [longitude, setLongitude] = useState(place.coordinates?.longitude || 0);

  const { setSelectedPlace } = useCache();

  // Safety check: If place is undefined, show fallback
  if (!place) {
    return (
      <Card className="border-foreground/20 p-1 h-full flex items-center justify-center">
        <p className="text-muted-foreground">No place data available</p>
      </Card>
    );
  }


  useEffect(() => {

    async function fetchPlaceImage() {
      const url = await getPlaceImageUrlUsingSDK(place?.activityName, city);
      setImageUrl(url);
      setLoading(false);
    }

    fetchPlaceImage();
  }, [place, city]);

  const handleSelectPlace = () => {
    setSelectedPlace(place);
  };

  const latStr = encodeURIComponent(latitude || 0);
  const lonStr = encodeURIComponent(longitude || 0);

  return (
    <Link
      to={`/details-for-place/${latStr}/${lonStr}`}
      onClick={handleSelectPlace}
    >
      <Card className="border-foreground/20 p-1 h-full flex flex-col gap-3 hover:scale-105 duration-300">
        <div className="img h-full rounded-lg relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg">
              <p className="text-sm text-gray-500">Loading image...</p>
            </div>
          )}
          <img
            src={imageUrl}
            className="h-80 w-full object-cover rounded-lg"
            alt={place?.activityName || "Place"}
          />
        </div>
        <div className="text-content w-full flex items-center gap-3 justify-between flex-col h-full">
          <CardHeader className="w-full">
            <CardTitle className="opacity-90 w-full text-center text-xl font-black text-primary/80 md:text-3xl">
              {place?.activityName || "Unknown Place"}
            </CardTitle>
            <CardDescription className="line-clamp-2 tracking-wide opacity-90 w-full text-center text-sm text-primary/80 md:text-md">
              {place?.details || "No details available"}
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <div className="places-details">
              <span className="font-medium text-primary/80 opacity-90 text-sm md:text-base tracking-wide">
                🕒 Timings: {place?.timings || "N/A"}
              </span>
              <br />
              <span className="font-medium text-primary/80 opacity-90 text-sm md:text-base tracking-wide">
                💵 Price: {place?.pricing || "N/A"}
              </span>
              <br />
              <span className="font-medium text-primary/80 opacity-90 text-sm md:text-base tracking-wide line-clamp-1">
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
