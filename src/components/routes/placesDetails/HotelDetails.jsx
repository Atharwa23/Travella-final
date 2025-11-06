import { useCache } from "@/Context/Cache/CacheContext";
import React, { useEffect, useState } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useParams } from "react-router-dom";

const HotelDetails = ({ HotelDetailsPageRef }) => {
  const {
    selectedHotel,
    checkInDate,
    checkOutDate,
    adults,
    childrenCount,
    rooms,
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

  // Log coordinates for debugging
  useEffect(() => {
  }, [lat, lng, latitude, longitude]);

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

  // Check if coordinates are valid
  const hasValidCoordinates = !isNaN(latitude) && !isNaN(longitude) && latitude !== 0 && longitude !== 0;

  return (
    <div ref={HotelDetailsPageRef} className="main">
      <div className="hotel-details mt-5">
        <div className="text text-center">
          <h2 className="text-3xl md:text-5xl mt-5 font-bold flex items-center justify-center">
            <span className="bg-gradient-to-b text-7xl from-blue-400 to-blue-700 bg-clip-text text-center text-transparent">
              {name}
            </span>
          </h2>
          📍
          <span className="bg-gradient-to-b from-primary/90 to-primary/60 bg-clip-text text-transparent text-xl">
            {address}
          </span>
        </div>

        <div className="flex items-center justify-center py-2 gap-2 mt-2">
          <h3 className="location-info opacity-90 bg-foreground/20 px-2 md:px-4 flex items-center justify-center rounded-md text-center text-md font-medium tracking-tight text-primary/80 md:text-lg">
            💵 {price}
          </h3>
          <h3 className="location-info opacity-90 bg-foreground/20 px-2 md:px-4 flex items-center justify-center rounded-md text-center text-md font-medium tracking-tight text-primary/80 md:text-lg">
            ⭐ {rating} Stars
          </h3>
        </div>

        {/* Debug info - remove this in production */}
        <div className="text-center text-sm text-gray-500 mt-2">
          Coordinates: {latitude}, {longitude}
        </div>
      </div>

      <div className="map-location mt-5 w-full bg-gradient-to-b from-primary/90 to-primary/60 font-bold bg-clip-text text-transparent text-3xl text-center">
        Map Location
      </div>
      
      <div className="hotel-map rounded-lg m-4 md:m-2 overflow-hidden shadow-md flex flex-col gap-2 md:flex-row">
        {!isLoaded ? (
          <div className="flex items-center justify-center w-full h-[400px]">
            <span className="text-gray-500 animate-pulse">Loading Map...</span>
          </div>
        ) : !hasValidCoordinates ? (
          <div className="flex items-center justify-center w-full h-[400px]">
            <span className="text-red-500">Invalid coordinates</span>
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
            <Marker
              position={{
                lat: latitude,
                lng: longitude,
              }}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: "#000000",
                fillOpacity: 1,
                strokeWeight: 1,
                strokeColor: "#ffffff",
              }}
              label={{
                text: "🏨",
                fontSize: "18px",
              }}
            />
          </GoogleMap>
        )}
      </div>
    </div>
  );
};

export default HotelDetails;