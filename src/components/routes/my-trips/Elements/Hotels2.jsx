import React from "react";
import Hotelcard2 from "./Hotelcard2";

function Hotels2() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <h2 className="text-center text-2xl md:text-3xl font-black bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-600 dark:from-orange-400 dark:via-amber-300 dark:to-yellow-400 bg-clip-text text-transparent">
        🏨 Hotel Recommendations
      </h2>
      <div className="main-info mt-2 md:mt-4">
        <Hotelcard2 />
      </div>
    </div>
  );
}

export default Hotels2;
