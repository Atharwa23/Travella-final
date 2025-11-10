import { db } from '@/Service/Firebase';
import { doc, getDoc } from 'firebase/firestore';
import React, { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom'
import Hotels from '../Elements/Hotels';
import Hotels2 from '../Elements/Hotelcard2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Hotel, Heart, Calendar, ArrowLeft } from 'lucide-react';
import Places2 from '../Elements/Places2';
import { LogInContext } from '@/Context/LogInContext/Login';
import Places from '../Elements/Places';

function Mytrips() {
  const { tripId } = useParams();
  const { setTrip} = useContext(LogInContext);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [it, setit] = useState(true)
  const [it2, setit2] = useState(true)

  const normalizeTrip = (rawData) => {
    try {
      let trip = rawData;
      // console.log("Trip: ",trip)
      if (Array.isArray(rawData?.tripData)) {
        trip = {
          ...rawData,
          ...rawData.tripData[0],
          tripData: rawData.tripData[0],
          tripData2: rawData.tripdata2[0]
        };
      }

        const rawItinerary = trip?.tripData?.itinerary || trip?.itinerary || {};
        const rawItinerary2 = trip?.tripData2?.itinerary || trip?.itinerary || {};
        const normalizedItinerary = Array.isArray(rawItinerary)
  ? rawItinerary.map((item, index) => ({
      day: item.day || index + 1,
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

        const normalizedItinerary2 = Array.isArray(rawItinerary2)
  ? rawItinerary2.map((item, index) => ({
      day: item.day || index + 1,
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

        const rawHotels = trip?.tripData?.hotels || trip?.tripData?.hotelOptions || trip?.hotelOptions || [];
        const rawHotels2 = trip?.tripData2?.hotels || trip?.tripData2?.hotelOptions || trip?.hotelOptions || [];

        const normalizedHotels = Array.isArray(rawHotels)
          ? rawHotels.map((h) => {
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

        const normalizedHotels2 = Array.isArray(rawHotels2)
          ? rawHotels2.map((h) => {
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
          tripData2: {
            ...trip,
            itinerary: normalizedItinerary2,
            hotels: normalizedHotels2,
          },
        };

        // console.log(normalizedTrip);
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
        const normalizedData = normalizeTrip(data);
        setTrip(normalizedData);
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

  const handlePrefer = (e) => {
    if(e == 1) {
      setit2(false)
      setit(true)
    } else if(e == 2){
      setit(false)
      setit2(true)
    }
  }

  const handleBack = (e) => {
    if(e == 1) {
      setit2(true)
      setit(true)
    } else if(e == 2){
      setit(true)
      setit2(true)
    }
  }
  
  useEffect(() => {
    getTripData();
  }, [tripId]);
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Hotels Section - Full Width */}
        <Card className="border-2 border-blue-200 dark:border-blue-900 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Hotel className="w-6 h-6" />
              Accommodations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Hotels />
          </CardContent>
        </Card>

        {/* Both Itineraries Side by Side */}
        {it && it2 &&  
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* Itinerary 1 */}
            <Card className="border-2 border-emerald-200 dark:border-emerald-900 shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Itinerary 1
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-6 flex-1 overflow-auto">
                <div className="space-y-4">
                  <Places />
                </div>
              </CardContent>

              <div className="px-6 pb-6 mt-auto">
                <Button 
                  onClick={() => handlePrefer(1)}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Prefer this response
                </Button>
              </div>
            </Card>

            {/* Itinerary 2 */}
            <Card className="border-2 border-purple-200 dark:border-purple-900 shadow-lg hover:shadow-xl transition-shadow h-full flex flex-col">
              <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Itinerary 2
                </CardTitle>
              </CardHeader>
              
              <CardContent className="pt-6 flex-1 overflow-auto">
                <div className="space-y-4">
                  <Places2 />
                </div>
              </CardContent>

              <div className="px-6 pb-6 mt-auto">
                <Button 
                  onClick={() => handlePrefer(2)}
                  className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Prefer this response
                </Button>
              </div>
            </Card>
          </div>
        }

        {/* Single Itinerary 1 View */}
        {it && !it2 && 
          <Card className="border-2 border-emerald-200 dark:border-emerald-900 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Itinerary 1
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Places />
              </div>
            </CardContent>

            <div className="px-6 pb-6">
              <Button
                onClick={() => handleBack(1)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Comparison
              </Button>
            </div>
          </Card>
        }

        {/* Single Itinerary 2 View */}
        {it2 && !it &&
          <Card className="border-2 border-purple-200 dark:border-purple-900 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Itinerary 2
              </CardTitle>
            </CardHeader>
            
            <CardContent className="pt-6">
              <div className="space-y-4">
                <Places2 />
              </div>
            </CardContent>

            <div className="px-6 pb-6">
              <Button 
                onClick={() => handleBack(2)}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Comparison
              </Button>
            </div>
          </Card>
        }
      </div>
    </div>
  )
}

export default Mytrips