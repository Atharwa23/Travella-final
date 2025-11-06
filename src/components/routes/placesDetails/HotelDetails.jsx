import { useCache } from "@/Context/Cache/CacheContext";
import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useParams } from "react-router-dom";
import { AiOutlineLoading3Quarters } from "react-icons/ai"; // Added for loading
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HotelDetails = ({ HotelDetailsPageRef }) => {
  const {
    selectedHotel,
    // (These are available if you need them for a "Book Now" button, etc.)
    // checkInDate,
    // checkOutDate,
    // adults,
    // childrenCount,
    // rooms,
  } = useCache();
  
  const {
    name,
    address,
    rating,
    price,
    city,
  } = selectedHotel || {};
  
  const { lat, lng } = useParams();
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);

  const [map, setMap] = useState(null);

  // Center map when it loads or coordinates change
  useEffect(() => {
    if (map && !isNaN(latitude) && !isNaN(longitude)) {
      const center = { lat: latitude, lng: longitude };
      map.panTo(center);
      map.setZoom(15);
    }
  }, [map, latitude, longitude]);

  const containerStyle = {
    width: "100%",
    height: "400px",
    borderRadius: "0.75rem", // Match our theme's --radius
  };

  const mapCenter = {
    lat: !isNaN(latitude) ? latitude : 0,
    lng: !isNaN(longitude) ? longitude : 0,
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    libraries: ["places", "marker"],
  });

  const onLoad = React.useCallback((map) => {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(() => {
    setMap(null);
  }, []);

  const hasValidCoordinates = !isNaN(latitude) && !isNaN(longitude) && latitude !== 0 && longitude !== 0;

  // Handle case where no hotel is selected (e.g., page refresh)
  if (!selectedHotel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-7xl mb-4" role="img" aria-label="warning">
          ⚠️
        </div>
        <h2 className="text-2xl font-bold mb-2">No Hotel Selected</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          It looks like there's no hotel data. This can happen if you refresh the page.
        </p>
        <Button asChild className="px-6 py-6 text-lg font-semibold">
          <Link to="/my-trips">Back to All Trips</Link>
        </Button>
      </div>
    );
  }

  return (
    <div ref={HotelDetailsPageRef} className="max-w-6xl mx-auto px-4 py-10 min-h-screen">
      <div className="hotel-details mt-5">
        <div className="text text-center">
          {/* 1. Themed Header */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-center mt-5 bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-600 dark:from-orange-400 dark:via-amber-300 dark:to-yellow-400 bg-clip-text text-transparent leading-tight">
            {name || "Hotel Details"}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground text-center mt-4">
            📍 {address || "Address not available"}
          </p>
        </div>

        {/* 2. Themed Badges */}
        <div className="flex items-center justify-center py-2 gap-4 mt-4">
          <div className="rounded-full bg-muted px-5 py-2 text-md font-medium text-muted-foreground">
            💵 {price || "N/A"}
          </div>
          <div className="rounded-full bg-muted px-5 py-2 text-md font-medium text-muted-foreground">
            ⭐ {rating || "N/A"} Stars
          </div>
        </div>
      </div>

      {/* 5. Themed Map Title */}
      <div className="map-location mt-16 mb-8 w-full bg-gradient-to-b from-primary/90 to-primary/60 font-bold bg-clip-text text-transparent text-3xl text-center">
        Map Location
      </div>
      
      {/* 5. Themed Map Container */}
      <div className="hotel-map rounded-2xl m-2 overflow-hidden shadow-xl border bg-card/50 backdrop-blur-sm flex flex-col gap-2 md:flex-row">
        {!isLoaded ? (
          // 3. Styled Loading State
          <div className="flex flex-col items-center justify-center w-full h-[400px] bg-muted/50">
            <AiOutlineLoading3Quarters className="h-10 w-10 animate-spin text-primary" />
            <span className="text-muted-foreground mt-4">Loading Map...</span>
          </div>
        ) : !hasValidCoordinates ? (
          // 3. Styled Error State
          <div className="flex flex-col items-center justify-center w-full h-[400px] bg-muted/50">
             <span className="text-2xl" role="img" aria-label="map-error">🗺️</span>
             <span className="text-muted-foreground mt-2">
               Map coordinates not available for this location.
             </span>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={15}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              mapTypeControl: true,
              streetViewControl: true,
              fullscreenControl: true,
            }}
          >
            {/* 4. Simplified Marker */}
            <Marker
              position={mapCenter}
              label={{
                text: "🏨",
                fontSize: "24px",
              }}
            />
          </GoogleMap>
        )}
      </div>
    </div>
  );
};

export default HotelDetails;