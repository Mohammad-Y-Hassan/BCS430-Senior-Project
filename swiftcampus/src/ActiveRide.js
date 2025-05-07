import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Map,
  AdvancedMarker,
  useMapsLibrary,
} from "@vis.gl/react-google-maps";
import { DateTime } from "luxon";
import { useNavigate } from "react-router-dom";
import Puzzlenobackground from "../src/Puzzlenobackground.gif";
import MiniProfileModal from "./Components/User Profile/MiniProfileModal";
import "./star-rating.css";

const BACKEND = "http://localhost:5000";

function RideMap({ apiKey, mapId, origin, town, mapOptions }) {
  const geocodingLib = useMapsLibrary("geocoding");
  const [geo, setGeo] = useState(null);
  const [err, setErr] = useState(null);

  const address = useMemo(
    () => (origin && town ? `${origin}, ${town}` : null),
    [origin, town]
  );

  const geocode = useCallback(async () => {
    if (!geocodingLib || !address) {
      setGeo(null);
      setErr(null);
      return;
    }
    const g = new geocodingLib.Geocoder();
    try {
      const res = await g.geocode({ address });
      if (res.results?.length) {
        const loc = res.results[0].geometry.location;
        setGeo({ lat: loc.lat(), lng: loc.lng() });
      } else {
        setErr(`Could not find "${address}"`);
      }
    } catch (e) {
      setErr(`Geocode failed: ${e.code || "UNKNOWN"}`);
    }
  }, [geocodingLib, address]);

  useEffect(() => {
    geocode();
  }, [geocode]);

  return (
    <div
      style={{
        height: 300,
        width: "100%",
        marginBottom: 15,
        border: "1px solid #ccc",
        borderRadius: 8,
      }}
    >
      {err && <div style={{ padding: 10, color: "red" }}>Error: {err}</div>}
      {!err && !geo && <div style={{ padding: 10 }}>Loading map…</div>}
      {geo && (
        <Map
          defaultZoom={15}
          center={geo}
          mapId={mapId}
          options={mapOptions}
          style={{ height: "100%", width: "100%", borderRadius: 8 }}
        >
          <AdvancedMarker position={geo} />
        </Map>
      )}
    </div>
  );
}

const ActiveRide = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

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
          `${BACKEND}/ActiveRide?param1=${username}`
        );
        const data = await res.json();
        setActiveRide(data);
      } catch {
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [username]);

  // cancel ride
  const handleCancelRide = async (order_id) => {
    if (!window.confirm("Are you sure you want to cancel?")) return;
    try {
      await fetch(`${BACKEND}/CancelRide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username_riders: username, order_id }),
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
        body: JSON.stringify({ username_riders: username }),
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

  if (isLoading) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <img src={Puzzlenobackground} alt="loading" />
        <br />
        Loading…
      </div>
    );
  }
  if (isError) {
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        An error occurred!
      </div>
    );
  }

  return (
    <div className="active-card">
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <h2 className="titlefont">Your Active Ride ✅</h2>

        <ul>
          {activeride.map((ride) => (
            <li key={ride.order_id}>
              <p>
                Scheduled for:{" "}
                {ride.scheduled_date
                  ? DateTime.fromISO(ride.scheduled_date).toLocaleString(
                      DateTime.DATE_MED
                    )
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

              {ride.origin && ride.town && apikey ? (
                <RideMap
                  apiKey={apikey}
                  mapId={mapOptions.mapId}
                  origin={ride.origin}
                  town={ride.town}
                  mapOptions={mapOptions}
                />
              ) : (
                <p
                  style={{
                    fontStyle: "italic",
                    color: "#777",
                    margin: "10px 0",
                  }}
                >
                  {!apikey
                    ? "Map cannot be displayed (API key missing)."
                    : "Map cannot be displayed (missing origin or town)."}
                </p>
              )}

              <p>
                Destination: {ride.destination}
                <br />
                Other Riders:{" "}
                {[ride.Rider1, ride.Rider2, ride.Rider3, ride.Rider4, ride.Rider5, ride.Rider6]
                  .filter((r) => r && r !== username)
                  .join(", ") || "None"}
                <br />
                Seats left: {ride.seat_number}
              </p>

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
        </ul>

        {showProfileModal && (
          <MiniProfileModal
            driver={selectedDriver}
            photos={driverPhotos}
            onClose={() => setShowProfileModal(false)}
          />
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
