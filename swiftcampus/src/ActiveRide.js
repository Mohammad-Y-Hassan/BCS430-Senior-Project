import React, { useEffect, useState, useMemo, useCallback } from "react";
import {    APIProvider,
            Map,
            MapCameraChangedEvent,
            AdvancedMarker,
            Pin,
            InfoWindow,
            useMap,
            useApiIsLoaded,
            useMapsLibrary,
            ControlPosition,
            MapControl, GoogleMap, } from '@vis.gl/react-google-maps';
import { DateTime } from "luxon";
import { useNavigate } from "react-router-dom";
import Puzzlenobackground from "../src/Puzzlenobackground.gif";
import MiniProfileModal from "./Components/User Profile/MiniProfileModal";

function RideMap({ apiKey, mapId, origin, town, mapOptions }) {
  const geocodingLib = useMapsLibrary('geocoding'); // Hook to load the geocoding library
  const [geocodeResult, setGeocodeResult] = useState(null);
  const [geocodeError, setGeocodeError] = useState(null);

  // Memoize the address string to prevent unnecessary geocoding calls
  const address = useMemo(() => {
      if (!origin || !town) return null; // Don't geocode if origin or town is missing
      return `${origin}, ${town}`;
  }, [origin, town]);

  // Define the geocoding function using useCallback
  const geocodeAddress = useCallback(async () => {
      if (!geocodingLib || !address) {
          console.log("Geocoding library or address not ready.");
          setGeocodeResult(null); // Clear previous results if address becomes invalid
          setGeocodeError(null);
          return;
      }

      const geocoder = new geocodingLib.Geocoder();
      console.log(`Geocoding address: ${address}`); // Log address being geocoded

      try {
          // Use await with geocode for cleaner async handling
          const response = await geocoder.geocode({ address });

          console.log("Geocoding response:", response); // Log the full response

          if (response.results && response.results.length > 0) {
              const location = response.results[0].geometry.location;
              setGeocodeResult({
                  lat: location.lat(),
                  lng: location.lng()
              });
              setGeocodeError(null); // Clear any previous error
              // console.log("Geocoding successful:", { lat: location.lat(), lng: location.lng() });
          } else {
              // console.warn(`Geocoding failed for address "${address}": No results found.`);
              setGeocodeError(`Could not find location for "${address}".`);
              setGeocodeResult(null);
          }
      } catch (error) {
          // console.error(`Geocoding error for address "${address}":`, error);
          // Check the error type (e.g., ZERO_RESULTS, REQUEST_DENIED) if available
          const status = error?.code || 'UNKNOWN_ERROR'; // Try to get a status code
          setGeocodeError(`Geocoding failed: ${status}. Please check address or API key.`);
          setGeocodeResult(null);
      }
  }, [geocodingLib, address]); // Dependencies: library and the address string

  // useEffect hook to call geocodeAddress when dependencies change
  useEffect(() => {
      geocodeAddress();
  }, [geocodeAddress]); // Dependency: the memoized geocodeAddress function

  // Render logic for the map
  return (
      <div style={{ height: '300px', width: '100%', marginBottom: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
          <APIProvider apiKey={apiKey}>
              {geocodeError && <div style={{ padding: '10px', color: 'red' }}>Error: {geocodeError}</div>}
              {!geocodeError && !geocodeResult && <div style={{ padding: '10px' }}>Loading map...</div>}
              {geocodeResult && (
                  <Map
                      defaultZoom={15}
                      center={geocodeResult} // Use geocoded result for center
                      mapId={mapId} // Pass mapId if using one
                      options={mapOptions}
                      style={{ height: '100%', width: '100%', borderRadius: '8px' }} // Ensure map fills the div
                  >
                      <AdvancedMarker position={geocodeResult} />
                  </Map>
              )}
          </APIProvider>
      </div>
  );
}

const ActiveRide = () => {
    const navigate = useNavigate();

    const [activeride, setActiveRide] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)
    const username_riders = localStorage.getItem("username");
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [driverPhotos, setDriverPhotos] = useState([]);

    useEffect(() => {
      const fetchData = async () => {
        console.log(username_riders)
        setIsLoading(true);
        try {
            const activeride = await fetch(`http://localhost:5000/ActiveRide?param1=${username_riders}`);
            const data = await activeride.json();
            console.log("Data:" + data)
            setActiveRide(data);
        } catch (error) {
           console.error('Error fetching users:', error);
           setIsError(true)
        } finally {setIsLoading(false)}
      };
      fetchData();
    }, []);
    const apikey = process.env.REACT_APP_API_KEY

     const mapOptions = useMemo(() => ({
        mapId:'YOUR_MAP_ID',
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl:false
      }), []);

    const handleCompleteRide = async () => {
        const username_riders = localStorage.getItem("username");
        const userToUpdate = { username_riders};
        try {
            const creatingOrder = await fetch("http://localhost:5000/CompleteRide", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userToUpdate),
            });
            const data = await creatingOrder.json();
            if (creatingOrder.ok) {
                console.log("Order Made successfully");
                localStorage.removeItem("ActiveRide")
                navigate("/");
            } else {
                console.error("Failed to create order:", data.message);
            }
        } catch (error) {
            console.error("Server error:", error);
        }
    };
    const handleCancelRide = async (order_id) => {
      const username_riders = localStorage.getItem("username");
      const userToUpdate = { username_riders, order_id};
      if (window.confirm("Are you sure you want to cancel your seat in this ride?")) {
        try {
          const creatingOrder = await fetch("http://localhost:5000/CancelRide", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(userToUpdate),
          });
          const data = await creatingOrder.json();
          if (creatingOrder.ok) {
              console.log("Order Cancelled successfully");
              localStorage.removeItem("ActiveRide")
              navigate("/");
          } else {console.error("Failed to create order:", data.message);}
      } catch (error) {console.error("Server error:", error);}
      } else {
        console.log("Order Cancellation cancelled");
        return
      }
    };

    const handleCall = () => {window.location.href = `tel:${+16317030199}`;};

    const handleDriverClick = async (username) => {
      try {
        const [profileRes, carRes, photosRes, profileImgRes] = await Promise.all([
          fetch(`http://localhost:5000/driver/${username}`),
          fetch(`http://localhost:5000/car/${username}`),
          fetch(`http://localhost:5000/car-photos/${username}`),
          fetch(`http://localhost:5000/latest-profile/${username}`)
        ]);
    
        const profileData = await profileRes.json();
        const carData = await carRes.json();
        const photosData = await photosRes.json();
        const profileImgData = await profileImgRes.json();
    
        const fullDriverData = {
          ...profileData,
          car: carData.error ? null : carData,
          profile_pic: profileImgData.photo || "default.png"
        };
    
        setDriverPhotos(photosData.photos || []);
        setSelectedDriver(fullDriverData);
        setShowProfileModal(true);
      } catch (err) {
        console.error("Error fetching driver info:", err);
      }
    };

    console.log("Active Ride:" + activeride);
    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
                    <div style={{ textAlign: "center", marginTop: "50px" }}>
                        <h2>Active Ride</h2>
                        {isError && <div>An error has occured!</div>}
                        {isLoading && <div> <img src={Puzzlenobackground} alt="loading..." /><br></br>Loading...</div>}
                        {!isLoading && (            <ul>
                        {activeride.map(ride => (
                        <li key={ride.order_id}>
                        <p> This Ride is Scheduled to Happen for : {ride.scheduled_date !== null ? 
                                                                    (<td>{ride.scheduled_date.toLocaleString(DateTime.DATETIME_HUGE).substring(0, 10)}</td>) : 
                                                                    (<>This was Made before the feature was implemented</>)}<br/>
                            Your Driver is : <span style={{ color: "black", cursor: "pointer", textDecoration: "underline" }}
                          onClick={() => handleDriverClick(ride.username_drivers)}> {ride.username_drivers}</span><br></br>
                            You will be picked up at : {ride.origin} in {ride.town !== "" && ride.town !== null ? ride.town : <>No Town Was searched when creating this order or was created before the feature was implemented</>} at {ride.time}<br></br>
                            {<APIProvider apiKey = {apikey}>
                            {/* --- Map Section --- */}
                            {/* Render the RideMap component if origin and town are present */}
                            {(ride.origin && ride.town && apikey) ? (
                                <RideMap
                                    apiKey={apikey}
                                    //mapId={MAP_ID} // Optional: Pass Map ID if you have one configured
                                    origin={ride.origin}
                                    town={ride.town}
                                    mapOptions={mapOptions}
                                />
                            ) : (
                                <p style={{ fontStyle: 'italic', color: '#777', margin: '10px 0' }}>
                                    { !apikey ? "Map cannot be displayed (API key missing)." : "Map cannot be displayed (missing origin or town)." }
                                </p>
                            )}
                            {/* --- End Map Section --- */}
                            </APIProvider>}
                            You are going to : {ride.destination}<br></br>
                            Other Riders:<br></br>
                            {(ride.Rider1 == null || ride.Rider1 == username_riders) && 
                             (ride.Rider2 == null || ride.Rider2 == username_riders) &&
                             (ride.Rider3 == null || ride.Rider3 == username_riders) &&
                             (ride.Rider4 == null || ride.Rider4 == username_riders) && 
                             (ride.Rider5 == null || ride.Rider5 == username_riders) && 
                             (ride.Rider6 == null || ride.Rider6 == username_riders) && 
                             (<p>There are currently no other passengers</p>)}
                            {ride.Rider1 != null && ride.Rider1 != username_riders && ride.Rider1}
                            {ride.Rider2 != null && ride.Rider2 != username_riders && ride.Rider2}
                            {ride.Rider3 != null && ride.Rider3 != username_riders && ride.Rider3}
                            {ride.Rider4 != null && ride.Rider4 != username_riders && ride.Rider4}
                            {ride.Rider5 != null && ride.Rider5 != username_riders && ride.Rider5}
                            {ride.Rider6 != null && ride.Rider6 != username_riders && ride.Rider6}
                            They have {ride.seat_number} seats avaliable<br></br>
                            <button onClick={() => handleCancelRide(ride.order_id)}>Cancel Ride</button>
                            <button onClick={() => handleCompleteRide()}>Complete Ride</button></p>
                        </li>
                        ))}
                        </ul>)}
                        {showProfileModal && (
                        <MiniProfileModal
                        driver={selectedDriver}
                        photos={driverPhotos}
                        onClose={() => setShowProfileModal(false)}
                        />
                        )}
                        {/* <button onClick={() => navigate("/")}>Home</button> */}
                        <button onClick={handleCall}>Emergency Call </button>
                    </div>
        </div>
        
    );
};

export default ActiveRide;