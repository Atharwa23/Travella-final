import React from "react";
import Hotelcard from "./Hotelcard";

function Hotels() {
  return (
    <div className=" my-[15vh]">
      <h2 className="opacity-90 mx-auto text-center text-3xl font-black md:text-5xl lg:text-5xl bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-600 dark:from-orange-400 dark:via-amber-300 dark:to-yellow-400 bg-clip-text text-transparent">
        🏨 Hotel Recommendations
      </h2>
      <div className="main-info mt-2 md:mt-4">
        <Hotelcard  />
      </div>
    </div>
  );
}

export default Hotels;
