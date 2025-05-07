import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Map,
  MapCameraChangedEvent,
  AdvancedMarker,
  Pin,
  InfoWindow,
  useMap,
  useApiIsLoaded,
  useMapsLibrary,
  ControlPosition,
  MapControl,
  GoogleMap,
} from "@vis.gl/react-google-maps";
import { DateTime } from "luxon";
import { useNavigate } from "react-router-dom";
import Puzzlenobackground from "../src/Puzzlenobackground.gif";
import MiniProfileModal from "./Components/User Profile/MiniProfileModal";
import "./star-rating.css";

const BACKEND = "http://localhost:5000";

function Directions(origin) {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionsService, setDirectionsService] = useState();
  const [directionsRenderer, setDirectionsRenderer] = useState();
  const [routes, setRoutes] = useState([]);
  const [routeIndex, setRouteIndex] = useState(0);
  const selected = routes[routeIndex];
  const leg = selected?.legs[0];

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(
      new routesLibrary.DirectionsRenderer({ draggable: true, map })
    );
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsRenderer) return;
    const listener = directionsRenderer.addListener("directions_changed", () => {
      const result = directionsRenderer.getDirections();
      if (result) setRoutes(result.routes);
    });
    return () => {
      if (window.google && window.google.maps && window.google.maps.event) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, [directionsRenderer]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer || !routesLibrary) return;
    directionsService
      .route({
        origin: JSON.stringify(origin.origin + ", " + origin.town),
        destination: JSON.stringify(origin.destination + ", Farmingdale State College"),
        travelMode: routesLibrary.TravelMode.DRIVING,
        provideRouteAlternatives: true,
      })
      .then((response) => {
        directionsRenderer.setDirections(response);
        setRoutes(response.routes);
      });
    return () => directionsRenderer.setMap(null);
  }, [directionsService, directionsRenderer, routesLibrary]);

  useEffect(() => {
    if (!directionsRenderer) return;
    directionsRenderer.setRouteIndex(routeIndex);
  }, [routeIndex, directionsRenderer]);

  if (!leg) return null;

  return (
    <div style={{ color: "Black" }}>
      <h2>{selected.summary}</h2>
      <p>
        {leg.start_address.split(",")[0]} to {leg.end_address.split(",")[0]}
      </p>
      <p>Distance: {leg.distance?.text}</p>
      <p>Duration: {leg.duration?.text}</p>
      <h2>Other Routes</h2>
      <ul>
        {routes.map((route, i) => (
          <li key={route.summary}>
            <button onClick={() => setRouteIndex(i)}>{route.summary}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RideMap({ mapId, origin, town, mapOptions }) {
  const geocodingLib = useMapsLibrary("geocoding");
  const [geocodeResult, setGeocodeResult] = useState(null);
  const [geocodeError, setGeocodeError] = useState(null);

  const address = useMemo(() => (origin && town ? `${origin}, ${town}` : null), [origin, town]);

  const geocodeAddress = useCallback(async () => {
    if (!geocodingLib || !address) {
      setGeocodeResult(null);
      setGeocodeError(null);
      return;
    }
    const geocoder = new geocodingLib.Geocoder();
    try {
      const res = await geocoder.geocode({ address });
      if (res.results?.length) {
        const loc = res.results[0].geometry.location;
        setGeocodeResult({ lat: loc.lat(), lng: loc.lng() });
        setGeocodeError(null);
      } else {
        setGeocodeError(`Could not find location for "${address}".`);
      }
    } catch (e) {
      setGeocodeError(`Geocoding failed: ${e.code || "UNKNOWN"}`);
    }
  }, [geocodingLib, address]);

  useEffect(() => {
    geocodeAddress();
  }, [geocodeAddress]);

  return (
    <div style={{ height: 300, width: "100%", marginBottom: 15, border: "1px solid #ccc", borderRadius: 8 }}>
      {geocodeError && <div style={{ padding: 10, color: "red" }}>Error: {geocodeError}</div>}
      {!geocodeError && !geocodeResult && <div style={{ padding: 10 }}>Loading map…</div>}
      {geocodeResult && (
        <Map
          defaultZoom={15}
          center={geocodeResult}
          mapId={mapId}
          options={mapOptions}
          style={{ height: "100%", width: "100%", borderRadius: 8 }}
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

  // ★ Rating
  const [ratingRideId, setRatingRideId] = useState(null);
  const [ratingValue, setRatingValue] = useState(0);

  // ★ Profile modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverPhotos, setDriverPhotos] = useState([]);

  const apikey = process.env.REACT_APP_API_KEY;
  const mapOptions = useMemo(() => ({
    mapId: "YOUR_MAP_ID",
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
  }), []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${BACKEND}/ActiveRide?param1=${username_riders}`);
        const data = await res.json();
        setActiveRide(data);
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [username_riders]);

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
      localStorage.removeItem("ActiveRide");
      navigate("/RequestARide", { replace: true });
    }
  };

  const handleCompleteRide = async () => {
    const userToUpdate = { username_riders };
    try {
      const creatingOrder = await fetch(`${BACKEND}/CompleteRide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userToUpdate),
      });
      if (creatingOrder.ok) {
        localStorage.removeItem("ActiveRide");
        navigate("/");
      }
    } catch (error) {
      console.error("Server error:", error);
    }
  };

  const handleStartRating = (order_id) => {
    setRatingRideId(order_id);
    setRatingValue(0);
  };

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
    } catch (e) {
      console.error("Rating error:", e);
    } finally {
      handleCompleteRide();
    }
  };

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

  if (isLoading || isError) {
    return (
      <div class="active-card">
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h2 class="titlefont">Your Active Ride ✅</h2>
          {isError && <div>An error has occurred!</div>}
          {isLoading && (
            <div>
              <img src={Puzzlenobackground} alt="loading..." />
              <br />
              Loading...
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div class="active-card">
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h2 class="titlefont">Your Active Ride ✅</h2>
        <ul>
          {activeride.map((ride) => (
            <li key={ride.order_id}>
              <p>
                Scheduled for:{" "}
                {ride.scheduled_date
                  ? DateTime.fromISO(ride.scheduled_date).toLocaleString(DateTime.DATE_MED).substring(0, 10)
                  : "—"}
                <br />
                Driver:{" "}
                <span
                  style={{
                    fontSize: "1.8rem",
                    color: "crimson",
                    textDecoration: "underline",
                    cursor: "pointer",
                  }}
                  onClick={() => handleDriverClick(ride.username_drivers)}
                >
                  {ride.username_drivers}
                </span>
                <br />
                Pickup: {ride.origin} in {ride.town || "—"} @ {ride.time}
              </p>

              {(ride.origin && ride.town && apikey) ? (
                <RideMap mapId={mapOptions.mapId} origin={ride.origin} town={ride.town} mapOptions={mapOptions} />
              ) : (
                <p style={{ fontStyle: "italic", color: "#777", margin: "10px 0" }}>
                  {!apikey
                    ? "Map cannot be displayed (API key missing)."
                    : "Map cannot be displayed (missing origin or town)."}
                </p>
              )}

              <br />
              <hr />
              <br />
              <h3>Possible Ride Directions and Times</h3>
              You are going to: {ride.destination}
              <br />
              {(ride.origin && ride.town && apikey) && (
                <div style={{ height: "50vh", position: "relative" }}>
                  <Map
                    defaultCenter={{ lat: 40.7543944326731, lng: -73.42814316946303 }}
                    defaultZoom={15}
                    gestureHandling={"greedy"}
                    fullscreenControl={false}
                  >
                    <MapControl position={ControlPosition.RIGHT_TOP}>
                      <Directions origin={ride.origin} town={ride.town} destination={ride.destination} />
                    </MapControl>
                  </Map>
                </div>
              )}

              <hr />
              Other Riders:
              <br />
              {[ride.Rider1, ride.Rider2, ride.Rider3, ride.Rider4, ride.Rider5, ride.Rider6]
                .filter((r) => r && r !== username_riders)
                .map((r) => <div key={r}>{r}</div>) || <div>None</div>}
              <br />
              They have {ride.seat_number} seats available
              <br />
              <br />

              {ratingRideId !== ride.order_id ? (
                <>
                  <button onClick={() => handleCancelRide(ride.order_id)}>
                    Cancel Ride
                  </button>
                  <button onClick={() => handleStartRating(ride.order_id)} style={{ marginLeft: 8 }}>
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
        </ul>

        {showProfileModal && (
          <MiniProfileModal driver={selectedDriver} photos={driverPhotos} onClose={() => setShowProfileModal(false)} />
        )}

        <button
          onClick={handleCall}
          style={{
            marginTop: 20,
            backgroundColor: "#dc3545",
            color: "#fff",
            padding: "8px 16px",
            border: "none",
            borderRadius: 4,
          }}
        >
          Emergency Call
        </button>
      </div>
    </div>
  );
};

export default ActiveRide;
