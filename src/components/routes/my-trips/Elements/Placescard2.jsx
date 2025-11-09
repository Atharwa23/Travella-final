import React, { useContext } from "react";
import { LogInContext } from "@/Context/LogInContext/Login";
import PlaceCards from "../Cards/PlaceCards"; // Update path based on your folder structure
import HotelCards from "../Cards/HotelCards";

function Placescard2() {
  const { trip } = useContext(LogInContext);
  let itinerary;
  if (Array.isArray(trip?.tripData)) {
    itinerary = trip?.tripData2[0]?.itinerary;
  } else {
    itinerary = trip?.tripData2?.itinerary;
  }
  if (!itinerary) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Loading itinerary...</p>
      </div>
    );
  }

  // If itinerary exists but is not an array, log it and show a clear message
  if (!Array.isArray(itinerary)) {
    console.error("[Placescard] Invalid itinerary format:", itinerary);
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">Itinerary found but in unexpected format. Check console for details.</p>
      </div>
    );
  }

  // If itinerary is an empty array, show a friendly message
  if (Array.isArray(itinerary) && itinerary.length === 0) {
    // Fallback: if there are hotels, surface them here so the user sees useful content
    const hotels = Array.isArray(trip?.tripData?.hotels) ? trip.tripData.hotels : [];

    if (hotels.length > 0) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground mb-6">No itinerary entries found for this trip — showing hotels instead.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {hotels.map((hotel, i) => (
              <div key={i} className="md:w-full">
                <HotelCards hotel={hotel} />
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No itinerary entries found for this trip.</p>
      </div>
    );
  }

  return (
    <div className="places-container space-y-8">
      {itinerary.map((day, dayIndex) => {
        // Safety check for each day
        if (!day) return null;
        // console.log(day)
        return (
          <div key={dayIndex} className="day-section">
            <h3 className="text-2xl font-bold mb-10 text-primary/80">
              Day {day.day || dayIndex + 1}
              {day.theme && `: ${day.theme}`}
            </h3>

            {/* Check if activities/places exist and is an array */}
            {day.activities && Array.isArray(day.activities) && day.activities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {day.activities.map((place, placeIndex) => {
                  if (!place) return null;
                  return <PlaceCards key={placeIndex} place={place} />;
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No activities planned for this day
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default Placescard2;