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
import ReactGoogleAutocomplete from "react-google-autocomplete";

/* -----------------------
   Helpers (kept outside component)
   ----------------------- */

// Safely parse JSON from a string that may include commentary or fences.
// Returns parsed object/array or null.
async function parseJSONSafe(text) {
  if (!text && text !== "") return null;
  const str = String(text);

  // quick direct parse
  try {
    return JSON.parse(str);
  } catch (e) {}

  // find first balanced object/array and parse
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

  // fallback regex attempts
  const objMatch = str.match(/(\{[\s\S]*\})/);
  if (objMatch) {
    try { return JSON.parse(objMatch[1]); } catch (e) {}
  }
  const arrMatch = str.match(/(\[[\s\S]*\])/);
  if (arrMatch) {
    try { return JSON.parse(arrMatch[1]); } catch (e) {}
  }

  return null;
}

// Normalize different top-level shapes the AI might return into the shape SaveTrip expects
function normalizeRawTripShape(tripRaw) {
  if (!tripRaw || typeof tripRaw !== "object") return tripRaw;

  const copy = { ...tripRaw };

  // Move top-level day1/day2 keys into copy.itinerary if present
  const hasDayKeys = Object.keys(copy).some(k => /^day\d+$/i.test(k));
  if (hasDayKeys && !copy.itinerary) {
    copy.itinerary = {};
    Object.keys(tripRaw).forEach((k) => {
      if (/^day\d+$/i.test(k)) {
        copy.itinerary[k] = tripRaw[k];
        delete copy[k];
      }
    });
  }

  // If model put itinerary under other keys, map them
  copy.itinerary = copy.itinerary || copy.itineraries || copy.plan || copy.days || null;

  // normalize hotels
  copy.hotels = copy.hotels || copy.hotelOptions || copy.hotelList || copy.accommodations || copy.stays || [];

  return copy;
}

/* -----------------------
   Component
   ----------------------- */

function CreateTrip({ createTripPageRef }) {
  const [place, setPlace] = useState("");
  const [formData, setFormData] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { user, loginWithPopup, isAuthenticated } = useContext(LogInContext);

  const handleInputChange = (name, value) => {
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const SignIn = async () => {
    loginWithPopup();
  };

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

  useEffect(() => {
    if (user && isAuthenticated) {
      localStorage.setItem("User", JSON.stringify(user));
      SaveUser();
    }
  }, [user]);

  const SaveTrip = async (TripData) => {
    const User = JSON.parse(localStorage.getItem("User"));
    const id = Date.now().toString();
    setIsLoading(true);

    const tripToSave = Array.isArray(TripData) ? TripData[0] : TripData;
    // console.log("Triptosave: ", tripToSave);

    // Normalize itinerary:
    // - If it's already an array, use it
    // - If it's an object with day1/day_1 keys, convert to array
    // - If the day keys are at root of tripToSave, use those
    const normalizeItinerary = (raw) => {
      if (!raw) return [];
      if (Array.isArray(raw)) return raw;

      if (typeof raw === "object") {
        // Accept keys that start with 'day' followed by digits: day1, day2, etc.
        const entries = Object.entries(raw).filter(([k]) => /^day\d+$/i.test(k) || k.toLowerCase().startsWith("day"));

        if (entries.length === 0) {
          // Maybe the full object is a single day's slots (no day keys)
          // Convert keys like morning/afternoon into activities
          const value = raw;
          const timeKeys = Object.keys(value).filter(k => k.toLowerCase() !== "theme");
          const activities = timeKeys.map(k => {
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
              raw: v
            };
          }).sort((a, b) => a.time.localeCompare(b.time));

          return [{
            day: 1,
            theme: value?.theme || "",
            activities
          }];
        }

        return entries
          .sort((a, b) => {
            const da = parseInt(a[0].replace(/\D+/g, ""), 10) || 0;
            const db = parseInt(b[0].replace(/\D+/g, ""), 10) || 0;
            return da - db;
          })
          .map(([key, value]) => {
            let activities = [];

            // If the day already has activities array, use it directly
            if (Array.isArray(value?.activities) && value.activities.length) {
              activities = value.activities;
            } else if (value && typeof value === "object") {
              // Convert time slots (morning/afternoon/evening/etc.) into activities
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
                  raw: v
                }))
                .sort((a, b) => {
                  // order morning -> afternoon -> evening -> night; fallback alphabetical
                  const order = ["morning", "afternoon", "evening", "night"];
                  const ia = order.indexOf(a.time.toLowerCase());
                  const ib = order.indexOf(b.time.toLowerCase());
                  if (ia === -1 && ib === -1) return a.time.localeCompare(b.time);
                  if (ia === -1) return 1;
                  if (ib === -1) return -1;
                  return ia - ib;
                });
            }

            return {
              day: parseInt(key.replace(/\D+/g, ""), 10) || 0,
              theme: (value && value.theme) || "",
              activities
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
      // if day1/day2 are at root, pass root (normalizeItinerary will handle)
      (Object.keys(tripToSave).some((k) => /^day\d+$/i.test(k)) ? tripToSave : null) ||
      tripToSave;

    // console.log("Raw : ", rawItinerary);
    const normalizedItinerary = normalizeItinerary(rawItinerary);
    // console.log("Normalized: ", normalizedItinerary);

    // Normalize hotels: accept hotelOptions or hotels and unify shape
    const parseCoordinates = (coord) => {
      if (!coord) return { latitude: null, longitude: null };
      if (typeof coord === "object") {
        const lat = Number(coord.latitude ?? coord.lat ?? null);
        const lng = Number(coord.longitude ?? coord.lng ?? coord.lon ?? null);
        return { latitude: Number.isFinite(lat) ? lat : null, longitude: Number.isFinite(lng) ? lng : null };
      }
      if (typeof coord === "string") {
        const regex = /([+-]?\d+\.?\d*)\s*(?:°)?\s*([NS])?\s*[,;\s]+([+-]?\d+\.?\d*)\s*(?:°)?\s*([EW])?/i;
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
          if (!Number.isNaN(a) && !Number.isNaN(b)) return { latitude: a, longitude: b };
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
          const name = h?.hotelName || h?.name || h?.hotel_name || h?.hotel || "";
          const description = h?.description || h?.details || "";
          const address = h?.address || h?.formattedAddress || "";
          const price = h?.price || h?.priceRange || h?.pricing || h?.Budget || "";
          const photos = h?.imageUrl || h?.image_url || h?.photos || null;
          const coords = parseCoordinates(h?.coordinates || h?.locationMap || h?.location || h?.latlng || h?.loc);
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

      // Extract raw text safely (some SDKs return a function)
      let rawText;
      if (result?.response && typeof result.response.text === "function") {
        // response.text() might be sync or async depending on SDK
        const maybe = result.response.text();
        rawText = maybe instanceof Promise ? await maybe : maybe;
      } else if (result?.text) {
        rawText = result.text;
      } else {
        rawText = result;
      }

      // Try safe parsing
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

      // Map alternate keys into expected shape without changing normalized shape
      const prepared = normalizeRawTripShape(parsed);

      // Pass prepared to SaveTrip
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

  return (
    <div ref={createTripPageRef} className="mt-10 text-center">
      <div className="text">
        <h2 className="text-3xl md:text-5xl font-bold mb-5 flex items-center justify-center">
          <span className="hidden md:block">🚀</span>{" "}
          <span className="bg-gradient-to-b from-primary/90 to-primary/60 bg-clip-text text-transparent">
            Share Your Travel Preferences{" "}
          </span>{" "}
          <span className="hidden md:block">🚀</span>
        </h2>
        <p className="opacity-90 mx-auto text-center text-md md:text-xl font-medium tracking-tight text-primary/80">
          Embark on your dream adventure with just a few simple details. <br />
          <span className="bg-gradient-to-b text-2xl from-blue-400 to-blue-700 bg-clip-text text-center text-transparent">
            JourneyJolt
          </span>{" "}
          <br /> will curate a personalized itinerary, crafted to match your
          unique preferences!
        </p>
      </div>

      <div className="form mt-14 flex flex-col gap-16 md:gap-20 ">
        <div className="place">
          <h2 className="font-semibold text-lg md:text-xl mb-3 ">
            <span className="bg-gradient-to-b from-primary/90 to-primary/60 bg-clip-text text-transparent">
              Where do you want to Explore?
            </span>{" "}
            🏖️
          </h2>

          <Autocomplete
            apiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-center"
            onPlaceSelected={(place) => {
              setPlace(place);
              // console.log(place);
              // console.log("selected:", place.name);
              handleInputChange("location", place.formatted_address);
            }}
          />
        </div>

        <div className="day">
          <h2 className="font-semibold text-lg md:text-xl mb-3 ">
            <span className="bg-gradient-to-b from-primary/90 to-primary/60 bg-clip-text text-transparent">
              How long is your Trip?
            </span>{" "}
            🕜
          </h2>
          <Input
            className="text-center"
            placeholder="Ex: 2"
            type="number"
            min="1"
            max="5"
            name="noOfDays"
            required
            onChange={(day) => handleInputChange("noOfDays", day.target.value)}
          />
        </div>

        <div className="budget">
          <h2 className="font-semibold text-lg md:text-xl mb-3 ">
            <span className="bg-gradient-to-b from-primary/90 to-primary/60 bg-clip-text text-transparent">
              {" "}
              What is your Budget?
            </span>{" "}
            💳
          </h2>
          <Input
            className="text-center"
            placeholder="₹ 5000"
            type="number"
            min="1000"
            max="100000"
            required
            onChange={(budget) => handleInputChange("Budget", budget.target.value)}
          />
        </div>

        <div className="people">
          <h2 className="font-semibold  text-lg md:text-xl mb-3 ">
            <span className="bg-gradient-to-b from-primary/90 to-primary/60 bg-clip-text text-transparent">
              Who are you traveling with?{" "}
            </span>{" "}
            🚗
          </h2>
          <div className="options grid grid-cols-1 gap-5 md:grid-cols-3">
            {SelectNoOfPersons.map((item) => {
              return (
                <div
                  onClick={(e) => handleInputChange("People", item.no)}
                  key={item.id}
                  className={`option cursor-pointer transition-all hover:scale-110 p-4 h-32 flex items-center justify-center flex-col border rounded-lg hover:shadow-foreground/10 hover:shadow-md
                    ${formData?.People == item.no && "border border-foreground/80"}
                  `}
                >
                  <h3 className="font-bold text-[15px] md:font-[18px]">
                    {item.icon} <span className={`
                      ${formData?.People == item.no ? 
                      "bg-gradient-to-b from-blue-400 to-blue-700 bg-clip-text text-center text-transparent" :
                      ""}
                      `}>{item.title}</span>
                  </h3>
                  <p className="bg-gradient-to-b from-primary/90 to-primary/60 bg-clip-text text-transparent">{item.desc}</p>
                  <p className="bg-gradient-to-b from-primary/90 to-primary/60 bg-clip-text text-transparent">{item.no}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="create-trip-btn w-full flex items-center justify-center h-32">
        <Button disabled={isLoading} onClick={generateTrip}>
          {isLoading ? (
            <AiOutlineLoading3Quarters className="h-6 w-6 animate-spin" />
          ) : (
            "Let's Go 🌏"
          )}
        </Button>
      </div>

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
  );
}

export default CreateTrip;