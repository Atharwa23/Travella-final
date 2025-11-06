import { LogInContext } from "@/Context/LogInContext/Login";
import { db } from "@/Service/Firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import AlltripsCard from "./AlltripsCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"; // Import Button for the CTA
import { Card, CardContent } from "@/components/ui/card"; // Import Card for the empty state

function Alltrips() {
  const { user } = useContext(LogInContext);
  const [allTrips, setAllTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // 1. Added loading state

  useEffect(() => {
    // 5. Moved the function inside useEffect for cleaner data fetching
    const getAllTrips = async () => {
      if (!user?.email) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true); // Set loading to true on fetch
      const Query = query(
        collection(db, "Trips"),
        where("userEmail", "==", user.email)
      );
      const querySnapshot = await getDocs(Query);
      const trips = [];
      querySnapshot.forEach((doc) => {
        trips.push(doc.data());
      });

      const reversedTrips = trips.reverse();
      setAllTrips(reversedTrips);
      setIsLoading(false); // Set loading to false after fetch
    };

    getAllTrips();
  }, [user]); // Only re-run when the user object changes

  return (
    <div className="mb-10 max-w-6xl mx-auto px-4">
      <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-center my-10 md:my-16 bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-600 dark:from-orange-400 dark:via-amber-300 dark:to-yellow-400 bg-clip-text text-transparent leading-tight">
        My Trips
      </h1>

      {/* 4. Updated grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          // --- LOADING STATE ---
          [1, 2, 3, 4].map((item, index) => (
            <div
              key={index}
              className="w-full h-52 rounded-2xl border bg-card/50 backdrop-blur-sm animate-pulse"
            ></div>
          ))
        ) : allTrips.length > 0 ? (
          // --- TRIPS FOUND STATE ---
          allTrips.map((trip, idx) => (
            <Link
              key={idx}
              to={"/my-trips/" + trip.tripId}
              className="w-full"
            >
              <AlltripsCard trip={trip} />
            </Link>
          ))
        ) : (
          // 2. --- NEW EMPTY STATE ---
          <div className="md:col-span-2">
            <Card className="border-2 border-dashed bg-card/50 backdrop-blur-sm">
              <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                <div className="text-7xl mb-4" role="img" aria-label="suitcase">
                  🧳
                </div>
                <h2 className="text-2xl font-bold mb-2">No trips found!</h2>
                <p className="text-muted-foreground mb-6 max-w-md">
                  It looks like you haven't planned any adventures yet. Get
                  started by creating your first AI-powered itinerary.
                </p>
                {/* 3. Call to Action Button */}
                <Button asChild className="px-6 py-6 text-lg font-semibold">
                  <Link to="/plan-a-trip">Plan Your First Trip</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default Alltrips;