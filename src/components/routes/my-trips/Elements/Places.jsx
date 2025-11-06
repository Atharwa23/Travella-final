import React, { useContext } from "react";
import Placescard from "./Placescard";
import { LogInContext } from "@/Context/LogInContext/Login";

function Places() {
  const { trip } = useContext(LogInContext);

  return (
    <div className="my-[15vh]">
      <h2 className="opacity-90 mx-auto text-center text-3xl font-black text-primary/80 md:text-5xl">
        Places to Visit
      </h2>
      <p className="opacity-90 mx-auto text-center text-sm md:text-lg text-primary/70 mt-2 mb-8">
        Your personalized day-by-day itinerary
      </p>
      
      <div className="main-info mt-2 md:mt-4">
        {trip ? (
          <Placescard />
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Loading trip data...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Places;