import { Input } from "@/components/ui/input";
import React, { useContext, useEffect, useState } from "react";
import Autocomplete from "react-google-autocomplete";
import {
  PROMPT,
  SelectBudgetOptions,
  SelectNoOfPersons,
} from "../../constants/Options";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { chatSession } from "@/Service/AiModel";
import { LogInContext } from "@/Context/LogInContext/Login";
import { db } from "@/Service/Firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
// NEW: Imports for the wizard animation
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

/* -----------------------
   Helpers (YOURS - UNCHANGED)
   ----------------------- */
async function parseJSONSafe(text) {
  if (!text && text !== "") return null;
  const str = String(text);
  try {
    return JSON.parse(str);
  } catch (e) {}
  const firstBrace = Math.min(
    ...["{", "["].map((ch) => {
      const idx = str.indexOf(ch);
      return idx === -1 ? Infinity : idx;
    })
  );
  if (firstBrace === Infinity) return null;
  const open = str[firstBrace];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  for (let i = firstBrace; i < str.length; i++) {
    const ch = str[i];
    if (ch === open) depth++;
    else if (ch === close) depth--;
    if (depth === 0) {
      const candidate = str.slice(firstBrace, i + 1);
      try {
        return JSON.parse(candidate);
      } catch (e) {
        break;
      }
    }
  }
  const objMatch = str.match(/(\{[\s\S]*\})/);
  if (objMatch) {
    try {
      return JSON.parse(objMatch[1]);
    } catch (e) {}
  }
  const arrMatch = str.match(/(\[[\s\S]*\])/);
  if (arrMatch) {
    try {
      return JSON.parse(arrMatch[1]);
    } catch (e) {}
  }
  return null;
}
function normalizeRawTripShape(tripRaw) {
  if (!tripRaw || typeof tripRaw !== "object") return tripRaw;
  const copy = { ...tripRaw };
  const hasDayKeys = Object.keys(copy).some((k) => /^day\d+$/i.test(k));
  if (hasDayKeys && !copy.itinerary) {
    copy.itinerary = {};
    Object.keys(tripRaw).forEach((k) => {
      if (/^day\d+$/i.test(k)) {
        copy.itinerary[k] = tripRaw[k];
        delete copy[k];
      }
    });
  }
  copy.itinerary =
    copy.itinerary ||
    copy.itineraries ||
    copy.plan ||
    copy.days ||
    null;
  copy.hotels =
    copy.hotels ||
    copy.hotelOptions ||
    copy.hotelList ||
    copy.accommodations ||
    copy.stays ||
    [];
  return copy;
}

// NEW: Animation variants for Framer Motion
const wizardVariants = {
  hidden: (direction) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.95,
  }),
  visible: {
    x: "0%",
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 40, damping: 10 },
  },
  exit: (direction) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
    scale: 0.95,
    transition: { type: "spring", stiffness: 40, damping: 10 },
  }),
};

// NEW: Popular destinations data (ASSUMES IMAGES ARE IN /public/destinations/)
const popularDestinations = [
  { name: "Rome", image: "/destinations/rome.jpg" },
  { name: "Tokyo", image: "/destinations/tokyo.jpg" },
  { name: "Paris", image: "/destinations/paris.jpg" },
  { name: "New York", image: "/destinations/new-york.jpg" },
  { name: "Dubai", image: "/destinations/dubai.jpg" },
  { name: "London", image: "/destinations/london.jpg" },
];


/* -----------------------
   Component
   ----------------------- */
function CreateTrip({ createTripPageRef }) {
  const [place, setPlace] = useState("");
  // BUG FIX: Changed from [] to {} to match your handleInputChange
  const [formData, setFormData] = useState({}); 
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { user, loginWithPopup, isAuthenticated } = useContext(LogInContext);
  
  // NEW: State for wizard
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // YOURS - UNCHANGED
  const handleInputChange = (name, value) => {
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  // YOURS - UNCHANGED
  const SignIn = async () => {
    loginWithPopup();
  };

  // YOURS - UNCHANGED
  const SaveUser = async () => {
    const User = JSON.parse(localStorage.getItem("User"));
    const id = User?.email;
    await setDoc(doc(db, "Users", id), {
      userName: User?.name,
      userEmail: User?.email,
      userPicture: User?.picture,
      userNickname: User?.nickname,
    });
  };

  // YOURS - UNCHANGED
  useEffect(() => {
    if (user && isAuthenticated) {
      localStorage.setItem("User", JSON.stringify(user));
      SaveUser();
    }
  }, [user]);

  // YOURS - UNCHANGED
  const SaveTrip = async (TripData) => {
    const User = JSON.parse(localStorage.getItem("User"));
    const id = Date.now().toString();
    setIsLoading(true);
    const tripToSave = Array.isArray(TripData) ? TripData[0] : TripData;
    const normalizeItinerary = (raw) => {
      if (!raw) return [];
      if (Array.isArray(raw)) return raw;
      if (typeof raw === "object") {
        const entries = Object.entries(raw).filter(
          ([k]) => /^day\d+$/i.test(k) || k.toLowerCase().startsWith("day")
        );
        if (entries.length === 0) {
          const value = raw;
          const timeKeys = Object.keys(value).filter(
            (k) => k.toLowerCase() !== "theme"
          );
          const activities = timeKeys
            .map((k) => {
              const v = value[k] || {};
              return {
                time: k,
                activity: v?.activity || "",
                details: v?.details || "",
                imageURL: v?.imageURL || v?.imageUrl || v?.image || "",
                location: v?.location || "",
                pricing: v?.pricing || v?.price || "",
                timings: v?.timings || "",
                coordinates: v?.coordinates || null,
                raw: v,
              };
            })
            .sort((a, b) => a.time.localeCompare(b.time));
          return [
            {
              day: 1,
              theme: value?.theme || "",
              activities,
            },
          ];
        }
        return entries
          .sort((a, b) => {
            const da = parseInt(a[0].replace(/\D+/g, ""), 10) || 0;
            const db = parseInt(b[0].replace(/\D+/g, ""), 10) || 0;
            return da - db;
          })
          .map(([key, value]) => {
            let activities = [];
            if (Array.isArray(value?.activities) && value.activities.length) {
              activities = value.activities;
            } else if (value && typeof value === "object") {
              activities = Object.entries(value)
                .filter(([k]) => k.toLowerCase() !== "theme")
                .map(([k, v]) => ({
                  time: k,
                  activity: v?.activity || "",
                  details: v?.details || "",
                  imageURL: v?.imageURL || v?.imageUrl || v?.image || "",
                  location: v?.location || "",
                  pricing: v?.pricing || v?.price || "",
                  timings: v?.timings || "",
                  coordinates: v?.coordinates || null,
                  raw: v,
                }))
                .sort((a, b) => {
                  const order = ["morning", "afternoon", "evening", "night"];
                  const ia = order.indexOf(a.time.toLowerCase());
                  const ib = order.indexOf(b.time.toLowerCase());
                  if (ia === -1 && ib === -1)
                    return a.time.localeCompare(b.time);
                  if (ia === -1) return 1;
                  if (ib === -1) return -1;
                  return ia - ib;
                });
            }
            return {
              day: parseInt(key.replace(/\D+/g, ""), 10) || 0,
              theme: (value && value.theme) || "",
              activities,
            };
          });
      }
      return [];
    };
    const rawItinerary =
      tripToSave.itinerary ||
      tripToSave.tripData?.itinerary ||
      tripToSave.itineraries ||
      tripToSave.plan ||
      (Object.keys(tripToSave).some((k) => /^day\d+$/i.test(k))
        ? tripToSave
        : null) ||
      tripToSave;
    const normalizedItinerary = normalizeItinerary(rawItinerary);
    const parseCoordinates = (coord) => {
      if (!coord) return { latitude: null, longitude: null };
      if (typeof coord === "object") {
        const lat = Number(coord.latitude ?? coord.lat ?? null);
        const lng = Number(coord.longitude ?? coord.lng ?? coord.lon ?? null);
        return {
          latitude: Number.isFinite(lat) ? lat : null,
          longitude: Number.isFinite(lng) ? lng : null,
        };
      }
      if (typeof coord === "string") {
        const regex =
          /([+-]?\d+\.?\d*)\s*(?:°)?\s*([NS])?\s*[,;\s]+([+-]?\d+\.?\d*)\s*(?:°)?\s*([EW])?/i;
        const m = coord.match(regex);
        if (m) {
          let lat = parseFloat(m[1]);
          let latDir = m[2];
          let lng = parseFloat(m[3]);
          let lngDir = m[4];
          if (latDir && latDir.toUpperCase() === "S") lat = -Math.abs(lat);
          if (lngDir && lngDir.toUpperCase() === "W") lng = -Math.abs(lng);
          return { latitude: lat, longitude: lng };
        }
        const parts = coord.split(",");
        if (parts.length >= 2) {
          const a = parseFloat(parts[0].replace(/[^0-9+\-.]/g, ""));
          const b = parseFloat(parts[1].replace(/[^0-9+\-.]/g, ""));
          if (!Number.isNaN(a) && !Number.isNaN(b))
            return { latitude: a, longitude: b };
        }
      }
      return { latitude: null, longitude: null };
    };
    const rawHotels =
      tripToSave.hotelOptions ||
      tripToSave.hotels ||
      tripToSave.tripData?.hotelOptions ||
      tripToSave.tripData?.hotels ||
      tripToSave.hotelList ||
      tripToSave.accommodations ||
      tripToSave.stays ||
      [];
    const normalizedHotels = Array.isArray(rawHotels)
      ? rawHotels.map((h) => {
          const name =
            h?.hotelName || h?.name || h?.hotel_name || h?.hotel || "";
          const description = h?.description || h?.details || "";
          const address = h?.address || h?.formattedAddress || "";
          const price =
            h?.price || h?.priceRange || h?.pricing || h?.Budget || "";
          const photos = h?.imageUrl || h?.image_url || h?.photos || null;
          const coords = parseCoordinates(
            h?.coordinates ||
              h?.locationMap ||
              h?.location ||
              h?.latlng ||
              h?.loc
          );
          return {
            name,
            description,
            address,
            price,
            latitude: coords.latitude,
            longitude: coords.longitude,
            photos,
            raw: h,
          };
        })
      : [];
    const normalizedTripData = {
      ...tripToSave,
      itinerary: normalizedItinerary,
      hotels: normalizedHotels,
    };
    await setDoc(doc(db, "Trips", id), {
      tripId: id,
      userSelection: formData,
      tripData: normalizedTripData,
      userName: User?.name,
      userEmail: User?.email,
    });
    setIsLoading(false);
    localStorage.setItem("Trip", JSON.stringify(normalizedTripData));
    localStorage.setItem("UserSelection", JSON.stringify(formData));
    navigate("/my-trips/" + id);
  };

  // YOURS - UNCHANGED
  const generateTrip = async () => {
    if (!isAuthenticated) {
      toast("Sign In to continue", {
        icon: "⚠️",
      });
      return setIsDialogOpen(true);
    }
    if (
      !formData?.noOfDays ||
      !formData?.location ||
      !formData?.People ||
      !formData?.Budget
    ) {
      return toast.error("Please fill out every field or select every option.");
    }
    if (formData?.noOfDays > 5) {
      return toast.error("Please enter Trip Days less then 5");
    }
    if (formData?.noOfDays < 1) {
      return toast.error("Invalid number of Days");
    }
    const FINAL_PROMPT = PROMPT.replace(/{location}/g, formData?.location)
      .replace(/{noOfDays}/g, formData?.noOfDays)
      .replace(/{People}/g, formData?.People)
      .replace(/{Budget}/g, formData?.Budget);

    try {
      const toastId = toast.loading("Generating Trip", {
        icon: "✈️",
      });
      setIsLoading(true);
      const result = await chatSession.sendMessage(FINAL_PROMPT);
      console.log(result)
      let rawText;
      if (result?.response && typeof result.response.text === "function") {
        const maybe = result.response.text();
        rawText = maybe instanceof Promise ? await maybe : maybe;
      } else if (result?.text) {
        rawText = result.text;
      } else {
        rawText = result;
      }
      let parsed = await parseJSONSafe(rawText);
      if (!parsed) {
        try {
          parsed = JSON.parse(String(rawText));
        } catch (e) {
          parsed = null;
        }
      }
      if (!parsed) {
        setIsLoading(false);
        toast.dismiss(toastId);
        toast.error("Received invalid response from the AI. Please try again.");
        console.error("Invalid AI response:", rawText);
        return;
      }
      const prepared = normalizeRawTripShape(parsed);
      await SaveTrip(prepared);
      toast.dismiss(toastId);
      toast.success("Trip Generated Successfully");
    } catch (error) {
      setIsLoading(false);
      toast.dismiss();
      toast.error("Failed to generate trip. Please try again.");
      console.error(error);
    }
  };
  
  // NEW: Wizard navigation functions
  const nextStep = () => {
    if (step === 1 && !formData.location) {
      return toast.error("Please select a destination to continue.");
    }
    setDirection(1);
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  // NEW: This is the new multi-step wizard UI
  return (
    <div
      ref={createTripPageRef}
      className="min-h-screen pb-20 relative bg-gradient-to-br from-orange-50 via-amber-50/50 to-yellow-50 dark:from-gray-950 dark:via-black dark:to-gray-950"
    >
      {/* Animated background blobs */}
      <div className="absolute top-20 -left-20 w-[500px] h-[500px] bg-gradient-to-br from-orange-300/40 to-amber-300/40 dark:from-orange-900/20 dark:to-amber-900/20 rounded-full blur-3xl animate-blob"></div>
      <div
        className="absolute bottom-20 -right-20 w-[600px] h-[600px] bg-gradient-to-br from-amber-300/40 to-yellow-300/40 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-full blur-3xl animate-blob"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-br from-yellow-300/30 to-orange-300/30 dark:from-yellow-900/15 dark:to-orange-900/15 rounded-full blur-3xl animate-blob"
        style={{ animationDelay: "4s" }}
      ></div>

      <div className="relative z-10 px-4 pt-16 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 space-y-6">
          <div className="inline-block">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-600 dark:from-orange-400 dark:via-amber-300 dark:to-yellow-400 bg-clip-text text-transparent leading-tight">
              Plan Your Adventure
            </h2>
            <div className="h-1.5 w-2/3 mx-auto bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 dark:from-orange-400 dark:via-amber-300 dark:to-yellow-400 rounded-full"></div>
          </div>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Tell us about your dream destination, and we'll craft a personalized
            itinerary just for you
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 max-w-md mx-auto mb-12">
          <div className="flex-1 flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                step === 1
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/50"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              }`}
            >
              1
            </div>
            <p
              className={`mt-2 font-semibold text-sm ${
                step === 1
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-gray-500 dark:text-gray-500"
              }`}
            >
              Destination
            </p>
          </div>
          <div
            className={`flex-1 h-1 rounded-full transition-all duration-300 ${
              step > 1
                ? "bg-gradient-to-r from-orange-500 to-amber-500"
                : "bg-gray-200 dark:bg-gray-800"
            }`}
          ></div>
          <div className="flex-1 flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                step === 2
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/50"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              }`}
            >
              2
            </div>
            <p
              className={`mt-2 font-semibold text-sm ${
                step === 2
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-gray-500 dark:text-gray-500"
              }`}
            >
              Details
            </p>
          </div>
        </div>

        {/* Form Cards */}
        <div className="relative max-w-4xl mx-auto overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {/* --- STEP 1: DESTINATION --- */}
            {step === 1 && (
              <motion.div
                key={1}
                custom={direction}
                variants={wizardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {/* Destination Input Card */}
                <div className="group relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-amber-500/20 dark:from-orange-500/10 dark:to-amber-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                  <div className="relative bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border-2 border-gray-100 dark:border-gray-700 group-hover:border-orange-300 dark:group-hover:border-amber-400 transition-all duration-300 transform group-hover:scale-[1.01]">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-2xl shadow-lg">
                        📍
                      </div>
                      <h2 className="font-black text-2xl md:text-3xl text-gray-800 dark:text-gray-100">
                        Destination
                      </h2>
                    </div>
                    <Autocomplete
                      apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}
                      className="w-full h-14 px-5 text-lg font-medium rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-orange-500/20 dark:focus:ring-amber-500/20 focus:border-orange-500 dark:focus:border-amber-500 transition-all text-center"
                      placeholder="Where do you want to go?"
                      onPlaceSelected={(place) => {
                        setPlace(place);
                        handleInputChange("location", place.formatted_address);
                      }}
                    />
                    {formData.location && (
                      <p className="text-center mt-4 text-lg font-semibold text-green-600 dark:text-green-400">
                        Selected: {formData.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Popular Destinations Section */}
                <div className="mt-12">
                  <h3 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-200">
                    Need Inspiration?
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {popularDestinations.map((dest) => (
                      <div
                        key={dest.name}
                        onClick={() => {
                          handleInputChange("location", dest.name);
                          toast.success(`Selected ${dest.name}`);
                        }}
                        className="group relative cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                      >
                        <img
                          src={dest.image}
                          alt={dest.name}
                          className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <h4 className="absolute bottom-4 left-4 text-white text-xl font-bold">
                          {dest.name}
                        </h4>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Button */}
                <div className="flex justify-end mt-12">
                  <Button
                    onClick={nextStep}
                    className="group px-8 py-6 text-lg font-bold rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 dark:from-orange-500 dark:to-amber-500 dark:hover:from-orange-600 dark:hover:to-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  >
                    Next Step
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* --- STEP 2: DETAILS --- */}
            {step === 2 && (
              <motion.div
                key={2}
                custom={direction}
                variants={wizardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div className="space-y-8">
                  {/* --- GRID for Duration & Budget --- */}
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* DURATION (INPUT FIELD) */}
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 dark:from-amber-500/10 dark:to-yellow-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                      <div className="relative bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border-2 border-gray-100 dark:border-gray-700 group-hover:border-amber-300 dark:group-hover:border-amber-400 transition-all duration-300 h-full">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-2xl shadow-lg">
                            📅
                          </div>
                          <h2 className="font-black text-2xl md:text-3xl text-gray-800 dark:text-gray-100">
                            How many days?
                          </h2>
                        </div>
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          name="noOfDays"
                          required
                          value={formData.noOfDays || ""}
                          placeholder="Number of days (e.g., 3)"
                          className="w-full h-14 px-5 text-lg font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-amber-500/20 dark:focus:ring-yellow-500/20 focus:border-amber-500 dark:focus:border-yellow-500 transition-all text-center"
                          onChange={(e) =>
                            handleInputChange("noOfDays", e.target.value)
                          }
                        />
                      </div>
                    </div>

                    {/* BUDGET (INPUT FIELD) */}
                    <div className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 dark:from-yellow-500/10 dark:to-orange-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                      <div className="relative bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border-2 border-gray-100 dark:border-gray-700 group-hover:border-yellow-300 dark:group-hover:border-orange-400 transition-all duration-300 h-full">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg">
                            💰
                          </div>
                          <h2 className="font-black text-2xl md:text-3xl text-gray-800 dark:text-gray-100">
                            What's your budget?
                          </h2>
                        </div>
                        <Input
                          type="number"
                          min="1000"
                          max="100000"
                          name="Budget"
                          required
                          value={formData.Budget || ""}
                          placeholder="Budget in ₹ (e.g., 5000)"
                          className="w-full h-14 px-5 text-lg font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-yellow-500/20 dark:focus:ring-orange-500/20 focus:border-yellow-500 dark:focus:border-orange-500 transition-all text-center"
                          onChange={(e) =>
                            handleInputChange("Budget", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                  {/* --- END of 2-col grid --- */}

                  {/* COMPANIONS (Card UI) */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 dark:from-orange-500/10 dark:to-yellow-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                    <div className="relative bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border-2 border-gray-100 dark:border-gray-700 group-hover:border-amber-300 dark:group-hover:border-amber-400 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center text-2xl shadow-lg">
                          👥
                        </div>
                        <h2 className="font-black text-2xl md:text-3xl text-gray-800 dark:text-gray-100">
                          Travel Companions
                        </h2>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {SelectNoOfPersons.map((item) => {
                          const isSelected = formData?.People == item.no;
                          return (
                            <div
                              key={item.id}
                              onClick={() =>
                                handleInputChange("People", item.no)
                              }
                              className={`relative cursor-pointer rounded-xl p-6 transition-all duration-300 transform hover:scale-105 group/card ${
                                isSelected
                                  ? "bg-gradient-to-br from-orange-500 to-amber-500 shadow-2xl shadow-orange-500/30 dark:shadow-orange-500/20 scale-105"
                                  : "bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-amber-700 shadow-lg"
                              }`}
                            >
                              <div className="text-center space-y-3">
                                <div
                                  className={`text-3xl transform group-hover/card:scale-110 transition-transform duration-300 ${
                                    isSelected ? "animate-bounce" : ""
                                  }`}
                                >
                                  {item.icon}
                                </div>
                                <h3
                                  className={`font-bold text-lg ${
                                    isSelected
                                      ? "text-white"
                                      : "text-gray-800 dark:text-gray-100"
                                  }`}
                                >
                                  {item.title}
                                </h3>
                                <p
                                  className={`text-sm font-medium ${
                                    isSelected
                                      ? "text-white/90"
                                      : "text-gray-600 dark:text-gray-400"
                                  }`}
                                >
                                  {item.desc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation & CTA Buttons */}
                <div className="flex justify-between items-center mt-12">
                  <Button
                    onClick={prevStep}
                    variant="outline"
                    className="group px-8 py-6 text-lg font-bold rounded-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-2 border-gray-300 dark:border-gray-700 hover:border-orange-400 dark:hover:border-amber-400 hover:bg-white dark:hover:bg-gray-900 transition-all duration-300 transform hover:scale-105"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back
                  </Button>
                  <Button
                    disabled={isLoading}
                    onClick={generateTrip}
                    className="group relative px-12 py-7 text-xl font-black rounded-2xl bg-gradient-to-r from-orange-600 via-amber-500 to-yellow-600 hover:from-orange-700 hover:via-amber-600 hover:to-yellow-700 dark:from-orange-500 dark:via-amber-400 dark:to-yellow-500 dark:hover:from-orange-600 dark:hover:via-amber-500 dark:hover:to-yellow-600 text-white shadow-2xl shadow-orange-500/40 dark:shadow-orange-500/30 hover:shadow-3xl hover:shadow-orange-500/60 dark:hover:shadow-orange-500/40 transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <AiOutlineLoading3Quarters className="h-7 w-7 animate-spin" />
                        <span>Creating Magic...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span>Generate Itinerary</span>
                        <span className="text-2xl group-hover:translate-x-2 transition-transform duration-300">
                          →
                        </span>
                      </div>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dialog (Using your original styles) */}
        <Dialog
          className="m-4"
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center bg-gradient-to-b from-primary/90 to-primary/60 bg-clip-text text-transparent">
                {user ? "Thank you for LogIn" : "Sign In to Continue"}
              </DialogTitle>
              <DialogDescription>
                <span className="flex gap-2">
                  <span className="text-center w-full opacity-90 mx-auto tracking-tight text-primary/80">
                    {user
                      ? "Logged In Securely to JourneyJolt with Google Authentication"
                      : "Sign In to JourneyJolt with Google Authentication Securely"}
                  </span>
                </span>
                {user ? (
                  ""
                ) : (
                  <Button
                    onClick={SignIn}
                    className="w-full mt-5 flex gap-2 items-center justify-center"
                  >
                    Sign In with <FcGoogle className="h-5 w-5" />
                  </Button>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose className="w-full">
                <Button variant="outline" className="w-full">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default CreateTrip;