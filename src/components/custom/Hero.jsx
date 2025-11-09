import React, { useContext } from "react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom"; // Assuming react-router-dom
import { LogInContext } from "@/Context/LogInContext/Login";
import Marquee from "../ui/marquee";

function Hero({ heroRef }) {
  const { isAuthenticated } = useContext(LogInContext);
  const images = [
    {
      name: "Chichen Itza",
      src: "/hero/chichen.webp",
      link: "https://en.wikipedia.org/wiki/Chichen_Itza",
    },
    {
      name: "Christ the Redeemer",
      src: "/hero/christ.webp",
      link: "https://en.wikipedia.org/wiki/Christ_the_Redeemer_(statue)",
    },
    {
      name: "Colosseum",
      src: "/hero/colosseum.webp",
      link: "https://en.wikipedia.org/wiki/Colosseum",
    },
    {
      name: "Great Pyramid of Giza",
      src: "/hero/giza.webp",
      link: "https://en.wikipedia.org/wiki/Great_Pyramid_of_Giza",
    },
    {
      name: "Machu Picchu",
      src: "/hero/peru.webp",
      link: "https://en.wikipedia.org/wiki/Machu_Picchu",
    },
    {
      name: "Taj Mahal",
      src: "/hero/taj.webp",
      link: "https://en.wikipedia.org/wiki/Taj_Mahal",
    },
    {
      name: "India Gate",
      src: "/hero/india.webp",
      link: "https://en.wikipedia.org/wiki/India_Gate",
    },
    {
      name: "Great Wall of China",
      src: "/hero/wall.webp",
      link: "https://en.wikipedia.org/wiki/Great_Wall_of_China",
    },
    {
      name: "Eiffel Tower",
      src: "/hero/tower.webp",
      link: "https://en.wikipedia.org/wiki/Eiffel_Tower",
    },
    {
      name: "Statue of Liberty",
      src: "/hero/liberty.webp",
      link: "https://en.wikipedia.org/wiki/Statue_of_Liberty",
    },
    {
      name: "Sydney Opera House",
      src: "/hero/sydney.webp",
      link: "https://en.wikipedia.org/wiki/Sydney_Opera_House",
    },
    {
      name: "Mount Everest",
      src: "/hero/everest.webp",
      link: "https://en.wikipedia.org/wiki/Mount_Everest",
    },
    {
      name: "Stonehenge",
      src: "/hero/stonehenge.webp",
      link: "https://en.wikipedia.org/wiki/Stonehenge",
    },
  ];

  const first = images.slice(0, images.length / 2);
  const second = images.slice(images.length / 2);

  return (
    <div
      ref={heroRef}
      className="relative flex items-center flex-col text-center justify-center min-h-screen py-16 px-4 overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-950 dark:via-black dark:to-gray-950"
    >
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-gradient-to-tr from-orange-100/50 via-transparent to-amber-100/50 dark:from-gray-900/50 dark:via-transparent dark:to-gray-800/50"></div>

      {/* Minimal floating orbs with branding color */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-orange-200/30 dark:bg-orange-900/40 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-200/30 dark:bg-amber-800/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center justify-center gap-6 md:gap-8">
        <div className="heading space-y-3 md:space-y-4 px-4">
          <h1 className="font-black text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-800 dark:text-gray-100 leading-tight">
            Embark on Electrifying Adventures with
          </h1>
          <div className="relative inline-block w-full">
            <h1 className="font-black text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-600 dark:from-orange-400 dark:via-amber-300 dark:to-yellow-400 bg-clip-text text-transparent pb-3 leading-tight">
              Travella
            </h1>
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2/3 md:w-3/4 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 dark:from-orange-400 dark:via-amber-300 dark:to-yellow-400 rounded-full"></div>
          </div>
        </div>

        <div className="desc space-y-3 md:space-y-4 px-4 max-w-4xl">
          <h5 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold tracking-tight text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Your trusted trip planner and adventure guide.
          </h5>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Let AI craft the perfect itinerary tailored just for you. From
            hidden gems to iconic landmarks, your dream journey starts here.
          </p>
        </div>

        <div className="buttons flex flex-col gap-3 md:gap-4 md:flex-row items-center mt-2">
          <Link to="/plan-a-trip">
            <Button className="px-6 md:px-8 py-4 md:py-6 text-base md:text-lg font-semibold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 dark:from-orange-500 dark:to-amber-500 dark:hover:from-orange-600 dark:hover:to-amber-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              {isAuthenticated
                ? "Let's Make Another Trip"
                : "Plan a Trip, It's Free"}
            </Button>
          </Link>
        </div>

        {/* Clean marquee section with fixed fades */}
        <div className="marquee relative flex w-full flex-col items-center justify-center overflow-hidden rounded-xl bg-white/80 dark:bg-gray-950/80 backdrop-blur-md p-4 md:p-8 shadow-xl border border-gray-200 dark:border-gray-800 mt-6 md:mt-8">
          <h3 className="text-lg md:text-2xl font-bold mb-4 md:mb-6 text-gray-800 dark:text-gray-200">
            Explore World's Wonders
          </h3>

          <Marquee
            reverse
            pauseOnHover
            className="[--duration:60s] mb-3 md:mb-4"
          >
            {second.map((item, index) => (
              <Link
                key={index}
                to={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="img group cursor-pointer border border-gray-300 dark:border-gray-700 hover:border-orange-400 dark:hover:border-amber-500 transition-all duration-300 overflow-hidden rounded-lg w-[180px] sm:w-[200px] md:w-[250px] shadow-md hover:shadow-xl mx-2"
              >
                <div className="relative overflow-hidden h-32 sm:h-40 md:h-48 bg-gray-100 dark:bg-gray-800">
                  <img
                    src={item.src}
                    alt={item.name}
                    className="h-full w-full object-cover group-hover:scale-110 duration-500 transition-transform"
                    loading="lazy"
                    role="presentation"
                    fetchPriority="high"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3 md:pb-4">
                    <span className="text-white font-semibold text-sm md:text-base px-2">
                      {item.name}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </Marquee>

          <Marquee pauseOnHover className="[--duration:60s]">
            {first.map((item, index) => (
              <Link
                key={index}
                to={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="img group cursor-pointer border border-gray-300 dark:border-gray-700 hover:border-orange-400 dark:hover:border-amber-500 transition-all duration-300 overflow-hidden rounded-lg w-[180px] sm:w-[200px] md:w-[250px] shadow-md hover:shadow-xl mx-2"
              >
                <div className="relative overflow-hidden h-32 sm:h-40 md:h-48 bg-gray-100 dark:bg-gray-800">
                  <img
                    src={item.src}
                    alt={item.name}
                    className="h-full w-full object-cover group-hover:scale-110 duration-500 transition-transform"
                    loading="lazy"
                    role="presentation"
                    fetchPriority="high"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3 md:pb-4">
                    <span className="text-white font-semibold text-sm md:text-base px-2">
                      {item.name}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </Marquee>

          {/* FIX: Fades now match the parent's opacity for a seamless look */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white/80 dark:from-gray-950/80 from-[rgb(255_255_255/0.8)] dark:from-[rgb(3_7_18/0.8)]"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white/80 dark:from-gray-950/80 from-[rgb(255_255_255/0.8)] dark:from-[rgb(3_7_18/0.8)]"></div>
        </div>

        {/* Simple trust indicators */}
        <div className="flex flex-wrap gap-4 md:gap-6 items-center justify-center mt-4 md:mt-8 text-xs sm:text-sm px-4">
          <div className="text-gray-600 dark:text-gray-400 font-medium">
            AI-Powered Planning
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
          <div className="text-gray-600 dark:text-gray-400 font-medium">
            Personalized Itineraries
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-400"></div>
          <div className="text-gray-600 dark:text-gray-400 font-medium">
            Trusted by Travelers
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;