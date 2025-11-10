import React, { useContext, useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { LogInContext } from "@/Context/LogInContext/Login";
import HotelCards from "../Cards/HotelCards";
import { useRefContext } from "@/Context/RefContext/RefContext";
import { getPlaceDetails } from "@/Service/GlobalApi";
import { useCache } from "@/Context/Cache/CacheContext";

function Hotelcard() {

  const [id, setId] = useState("");

  const { trip } = useContext(LogInContext);
  const hotels = trip?.tripData?.hotels;
  // console.log(hotels)

  const { holetsRef } = useRefContext();


  return (
    <div ref={holetsRef} className="flex flex-col md:flex-row flex-wrap gap-5">
      {hotels?.map((hotel, idx) => {
        return (
          <div key={idx} className="md:w-[48%]">
            <HotelCards className="hotel-card" id={id} hotel={hotel} />
          </div>
        );
      })}
    </div>
  );
}

export default Hotelcard;
