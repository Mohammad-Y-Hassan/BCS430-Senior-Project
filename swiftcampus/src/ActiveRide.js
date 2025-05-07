import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Map,
  MapCameraChangedEvent,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useApiIsLoaded,
  useMapsLibrary,
  ControlPosition,
  MapControl, GoogleMap,} from "@vis.gl/react-google-maps";
import { DateTime } from "luxon";
import { useNavigate } from "react-router-dom";
import Puzzlenobackground from "../src/Puzzlenobackground.gif";
import MiniProfileModal from "./Components/User Profile/MiniProfileModal";
import "./star-rating.css";

const BACKEND = "http://localhost:5000";
function Directions(origin) {
    const map = useMap()
    const routesLibrary = useMapsLibrary("routes")
    const [directionsService, setDirectionsService] = useState()
    const [directionsRenderer, setDirectionsRenderer] = useState()
    const [routes, setRoutes] = useState([])
    const [routeIndex, setRouteIndex] = useState(0)
    const selected = routes[routeIndex]
    const leg = selected?.legs[0]
  
    // Initialize directions service and renderer
    useEffect(() => {
      if (!routesLibrary || !map) return
      setDirectionsService(new routesLibrary.DirectionsService())
      setDirectionsRenderer(
        new routesLibrary.DirectionsRenderer({
          draggable: true, // Only necessary for draggable markers
          map
        })
      )
    }, [routesLibrary, map])
  
    // Add the following useEffect to make markers draggable
    useEffect(() => {
      if (!directionsRenderer) return
  
      // Add the listener to update routes when directions change
      const listener = directionsRenderer.addListener(
        "directions_changed",
        () => {
          const result = directionsRenderer.getDirections()
          if (result) {
            setRoutes(result.routes)
          }
        }
      )
  
      return () =>       {
        if (window.google && window.google.maps && window.google.maps.event) {
        window.google.maps.event.removeListener(listener);
      } else {
        console.warn("Google Maps event listener could not be removed.");
      }
    }
    }, [directionsRenderer])
  
    // Use directions service
    useEffect(() => {
      if (!directionsService || !directionsRenderer || !routesLibrary) return
  
      directionsService
        .route({
          origin: JSON.stringify(origin.origin + ", " + origin.town),
          destination: `${JSON.stringify(origin.destination + ", Farmingdale State College")}`,
          travelMode: routesLibrary.TravelMode.DRIVING,
          provideRouteAlternatives: true
        })
        .then(response => {
          directionsRenderer.setDirections(response)
          setRoutes(response.routes)
        })
        console.log("Directions Origin: " + `${JSON.stringify(origin)}`)
      return () => directionsRenderer.setMap(null)
    }, [directionsService, directionsRenderer, routesLibrary])
  
    // Update direction route
    useEffect(() => {
      if (!directionsRenderer) return
      directionsRenderer.setRouteIndex(routeIndex)
    }, [routeIndex, directionsRenderer])
  
    if (!leg) return null
  
    // return (
    //   <div style = {{color : "Black"}}>
    //     <h2>{selected.summary}</h2>
    //     <p>
    //       {leg.start_address.split(",")[0]} to {leg.end_address.split(",")[0]}
    //     </p>
    //     <p>Distance: {leg.distance?.text}</p>
    //     <p>Duration: {leg.duration?.text}</p>
  
    //     <h2>Other Routes</h2>
    //     <ul>
    //       {routes.map((route, index) => (
    //         <li key={route.summary}>
    //           <button onClick={() => setRouteIndex(index)}>
    //             {route.summary}
    //           </button>
    //         </li>
    //       ))}
    //     </ul>
    //   </div>
    // )
  }
  
  


  function RideMap({mapId, origin, town, mapOptions }) {
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
            // console.log("Geocoding library or address not ready.");
            setGeocodeResult(null); // Clear previous results if address becomes invalid
            setGeocodeError(null);
            return;
        }
  
        const geocoder = new geocodingLib.Geocoder();
        // console.log(`Geocoding address: ${address}`); // Log address being geocoded
  
        try {
            // Use await with geocode for cleaner async handling
            const response = await geocoder.geocode({ address });
  
            // console.log("Geocoding response:", response); // Log the full response
  
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
        </div>
    );
  }

const ActiveRide = () => {
  const navigate = useNavigate();
  const username_riders = localStorage.getItem("username");

  const [activeride, setActiveRide] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // ★ Rating state
  const [ratingRideId, setRatingRideId] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);

  // ★ Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverPhotos, setDriverPhotos] = useState([]);

  const apikey = process.env.REACT_APP_API_KEY;
  const mapOptions = useMemo(
    () => ({
      mapId: "YOUR_MAP_ID",
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
    }),
    []
  );

  // fetch active ride
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${BACKEND}/ActiveRide?param1=${username_riders}`
        );
        const data = await res.json();
        setActiveRide(data);
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [username_riders]);


  // cancel ride
  const handleCancelRide = async (order_id) => {
    if (!window.confirm("Are you sure you want to cancel?")) return;
    try {
      await fetch(`${BACKEND}/CancelRide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username_riders, order_id }),
      });
    } catch (e) {
      console.error(e);
    } finally {
      // **1) Clear your “active ride” flag**
      localStorage.removeItem("ActiveRide");
      // **2) Navigate back to Request A Ride**
      navigate("/RequestARide", { replace: true });
    }
  };

  // start rating
  const handleStartRating = (order_id) => {
    setRatingRideId(order_id);
    setRatingValue(0);
  };

  // submit rating & complete
  const submitRating = async (ride) => {
    try {
      await fetch(`${BACKEND}/driver-rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: ride.order_id,
          driver_username: ride.username_drivers,
          rating: ratingValue,
        }),
      });
      await fetch(`${BACKEND}/CompleteRide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username_riders}),
      });
    } catch (e) {
      console.error(e);
    } finally {
      // **1) Clear your “active ride” flag**
      localStorage.removeItem("ActiveRide");
      // **2) Navigate back to Home (/)**
      navigate("/", { replace: true });
    }
  };

  // driver modal
  const handleDriverClick = async (uname) => {
    try {
      const [p, c, ph, img] = await Promise.all([
        fetch(`${BACKEND}/driver/${uname}`),
        fetch(`${BACKEND}/car/${uname}`),
        fetch(`${BACKEND}/car-photos/${uname}`),
        fetch(`${BACKEND}/latest-profile/${uname}`),
      ]);
      const prof = await p.json();
      const car = await c.json();
      const photos = await ph.json();
      const imgData = await img.json();
      setDriverPhotos(photos.photos || []);
      setSelectedDriver({
        ...prof,
        car: car.error ? null : car,
        profile_pic: imgData.photo || "default.png",
      });
      setShowProfileModal(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCall = () => {
    window.location.href = "tel:+16317030199";
  };

    return (
        <div class="active-card">
        <div style={{ textAlign: "center", marginTop: "50px" }}>
                    <div style={{ textAlign: "center", marginTop: "50px" }}>
                        <h2 class="titlefont">Your Active Ride ✅</h2>
                        {isError && <div>An error has occured!</div>}
                        {isLoading && <div> <img src={Puzzlenobackground} alt="loading..." /><br></br>Loading...</div>}
                        {!isLoading && (            <ul>
                        {activeride.map(ride => (
                            
                        <li key={ride.order_id}>
                        <p> This Ride is Scheduled to Happen for : {ride.scheduled_date !== null ? 
                                                                    (<>{ride.scheduled_date.toLocaleString(DateTime.DATETIME_HUGE).substring(0, 10)}</>) : 
                                                                    (<>This was Made before the feature was implemented</>)}<br/>
                            Your Driver is : <span style={{ fontSize: "1.8rem", color: "crimson", cursor: "pointer", textDecoration: "underline" }} 
                          onClick={() => handleDriverClick(ride.username_drivers)}> {ride.username_drivers}</span><br></br> <br />
                            You will be picked up at : {ride.origin} in {ride.town !== "" && ride.town !== null ? ride.town : <>No Town Was searched when creating this order or was created before the feature was implemented</>} at {ride.time}<br></br>
                            <br />
                            <hr></hr>
                            <br />
                            {/* --- Map Section --- */}
                            {/* Render the RideMap component if origin and town are present */}
                            {(ride.origin && ride.town && apikey) ? (
                                <RideMap
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
                            <br />
                            <hr></hr>
                            <br />
                            <h3>Possible Ride Directions and Times</h3>
                            You are going to : {ride.destination}<br></br>
                            { (ride.origin && ride.town && apikey) ? (
                            <div style = {{height : "50vh", position: "relative"}}>
                            <Map
                              defaultCenter={{lat: 40.7543944326731, lng: -73.42814316946303}}
                              defaultZoom={15}
                              gestureHandling={'greedy'}
                              fullscreenControl={false}>
                            <MapControl position={ControlPosition.RIGHT_TOP}>
                            <Directions origin = {ride.origin} destination = {ride.destination} town = {ride.town}/>
                            </MapControl>
                            </Map>
                            </div> ) :
                            (
                                <p style={{ fontStyle: 'italic', color: '#777', margin: '10px 0' }}>
                                    { !apikey ? "Map cannot be displayed (API key missing)." : "Map cannot be displayed (missing origin or town)." }
                                </p>
                            )
                            }
                            <hr></hr>
                            Other Riders:<br></br>
                            {(ride.Rider1 == null || ride.Rider1 == username_riders) && 
                             (ride.Rider2 == null || ride.Rider2 == username_riders) &&
                             (ride.Rider3 == null || ride.Rider3 == username_riders) &&
                             (ride.Rider4 == null || ride.Rider4 == username_riders) && 
                             (ride.Rider5 == null || ride.Rider5 == username_riders) && 
                             (ride.Rider6 == null || ride.Rider6 == username_riders) && 
                             (<p>There are currently no other passengers</p>)}
                            {ride.Rider1 != null && ride.Rider1 != username_riders && ride.Rider1} <br />
                            {ride.Rider2 != null && ride.Rider2 != username_riders && ride.Rider2} <br />
                            {ride.Rider3 != null && ride.Rider3 != username_riders && ride.Rider3} <br />
                            {ride.Rider4 != null && ride.Rider4 != username_riders && ride.Rider4} <br />
                            {ride.Rider5 != null && ride.Rider5 != username_riders && ride.Rider5} <br />
                            {ride.Rider6 != null && ride.Rider6 != username_riders && ride.Rider6} <br />
                            They have {ride.seat_number} seats avaliable<br></br>
                            <br /></p>
                            {ratingRideId !== ride.order_id ? (
                            <>
                              <button onClick={() => handleCancelRide(ride.order_id)}>
                                Cancel Ride
                              </button>
                              <button
                                onClick={() => handleStartRating(ride.order_id)}
                                style={{ marginLeft: 8 }}
                              >
                                Complete Ride
                              </button>
                            </>
                            ) : (
                              <div style={{ marginTop: 15 }}>
                                <h3>Rate your driver</h3>
                                <div className="star-rating">
                                  {[5, 4, 3, 2, 1].map((n) => (
                                    <React.Fragment key={n}>
                                      <input
                                        type="radio"
                                        id={`star${n}-${ride.order_id}`}
                                        name={`rating-${ride.order_id}`}
                                        value={n}
                                        checked={ratingValue === n}
                                        onChange={() => setRatingValue(n)}
                                      />
                                      <label htmlFor={`star${n}-${ride.order_id}`}>★</label>
                                    </React.Fragment>
                                  ))}
                                </div>
                                <button
                                  onClick={() => submitRating(ride)}
                                  disabled={ratingValue === 0}
                                  style={{ marginTop: 10 }}
                                >
                                  Submit Rating
                                </button>
                              </div>
                            )}
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
        </div>
    );
  }

export default ActiveRide;
