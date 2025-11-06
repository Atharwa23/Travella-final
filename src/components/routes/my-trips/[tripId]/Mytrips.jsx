import { db } from '@/Service/Firebase';
import { doc, getDoc } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom'
import Hotels from '../Elements/Hotels';
import { LogInContext } from '@/Context/LogInContext/Login';
import Places from '../Elements/Places';

function Mytrips() {
  const { tripId } = useParams();
  const { setTrip} = useContext(LogInContext);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Transform trip data from stored format to UI format
  const normalizeTrip = (rawData) => {
    try {

      // If tripData is an array (from the AI response), use its first item
      let trip = rawData;
      if (Array.isArray(rawData?.tripData)) {
        trip = {
          ...rawData,
          ...rawData.tripData[0],  // Spread the first item's properties to root
          tripData: rawData.tripData[0]  // Also keep it in tripData for compatibility
        };
      }

        const rawItinerary = trip?.tripData?.itinerary || trip?.itinerary || {};
        const normalizedItinerary = Array.isArray(rawItinerary)
  ? rawItinerary.map((item, index) => ({
      day: item.day || index + 1, // fallback if 'day' not provided
      notes: item.notes || '',
      activities: Array.isArray(item.activities)
        ? item.activities.map(activity => ({
            activityName: activity.activity || '',
            details: activity.details || '',
            location: activity.location || '',
            timings: activity.timings || '',
            pricing: activity.pricing || '',
            imageUrl: activity.imageUrl || '',
            notes: activity.notes || '',
            coordinates: activity.coordinates || null
          }))
        : []
    }))
  : [];

        const parseCoordinates = (coord) => {
          if (!coord) return { latitude: null, longitude: null };
          if (typeof coord === 'object') {
            const lat = Number(coord.latitude ?? coord.lat ?? coord.latitute ?? coord.latitude ?? null);
            const lng = Number(coord.longitude ?? coord.lng ?? coord.lon ?? coord.long ?? null);
            return {
              latitude: Number.isFinite(lat) ? lat : null,
              longitude: Number.isFinite(lng) ? lng : null,
            };
          }
          else return { latitude: null, longitude: null };
        };

        // Normalize hotels: some trips use 'hotelOptions' with hotelName and coordinates string
        const rawHotels = trip?.tripData?.hotels || trip?.tripData?.hotelOptions || trip?.hotelOptions || [];

        const normalizedHotels = Array.isArray(rawHotels)
          ? rawHotels.map((h) => {
              // First try direct properties, then check raw data
              // console.log("h", h)
              const name = h?.name || h?.hotelName || h?.hotel_name || h?.hotel || h?.raw?.hotel_name || '';
              const description = h?.description || h?.details || '';
              const address = h?.address || h?.formattedAddress || '';
              const price = h?.price || h?.priceRange || h?.pricing || h?.Budget || '';
              const photos = h?.imageUrl || h?.image_url || h?.photos || h?.raw?.image_url || null;
              const latitude = h?.latitude;
              const longitude = h?.longitude;
              return {
                name,
                description,
                address,
                price,
                latitude,
                longitude,
                photos,
                raw: h,
              };
            })
          : [];

        const normalizedTrip = {
          ...trip,
          tripData: {
            ...trip,
            itinerary: normalizedItinerary,
            hotels: normalizedHotels,
          },
        };

        // console.log("Normalized Trip:", normalizedTrip);

        return normalizedTrip;

      
    } catch (err) {
      console.error('[Mytrips] Error normalizing trip data:', err);
      return rawData;
    }
  };

  const getTripData = async () => {
    if (!tripId) {
      console.warn('[Mytrips] No tripId in URL');
      setFetchError('No tripId provided in URL');
      return;
    }

    setIsLoading(true);
    setFetchError(null);
    
    try {
      const docRef = doc(db, 'Trips', tripId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // console.log('[Mytrips] fetched trip doc:', data);
        const normalizedData = normalizeTrip(data);
        setTrip(normalizedData);
        // console.log("Normalized Trip Data:", normalizedData);
      } else {
        console.warn(`[Mytrips] Trip doc not found for id: ${tripId}`);
        toast.error('No such trip');
        setFetchError('Trip not found');
        setTrip(null);
      }
    } catch (err) {
      console.error('[Mytrips] Error fetching trip doc:', err);
      toast.error('Failed to load trip data');
      setFetchError(String(err?.message || err));
      setTrip(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getTripData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);
  

  return (
<div className='py-2'>

  {/* Box 1: Hotels */}
  <div className='p-4 pl-8 bg-white rounded-lg shadow-md dark:bg-gray-800 border dark:border-gray-700'>
    <Hotels/>
  </div>

  <div className='my-4'></div>

  {/* Box 2: Places */}
  <div className='p-4 bg-white rounded-lg shadow-md dark:bg-gray-800 border dark:border-gray-700'>
    <Places/>
  </div>
  
</div>

  )
}

export default Mytrips