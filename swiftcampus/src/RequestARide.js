import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DateTime } from "luxon";
import Puzzlenobackground from "../src/Puzzlenobackground.gif";
import MiniProfileModal from "./Components/User Profile/MiniProfileModal";

const BACKEND = "http://localhost:5000";

const RequestARide = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [ratings, setRatings] = useState({}); // ★ holds avg_rating per driverUsername
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const [rideAlone, setRideAlone] = useState("No");
  const [womenOnly, setWomenOnly] = useState("No");
  const [destinationFilter, setDestinationFilter] = useState("All");
  const [sortOption, setSortOption] = useState("none");

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverPhotos, setDriverPhotos] = useState([]);

  const userGender = localStorage.getItem("gender");
  const username = localStorage.getItem("username");

  // Clear any stale flag on mount
  useEffect(() => {
    localStorage.removeItem("ActiveRide");
  }, []);

  // If the server still thinks the user has an active ride, redirect immediately
  useEffect(() => {
    (async () => {
      if (!username) return;
      try {
        const res = await fetch(`${BACKEND}/ActiveRideCheck?param1=${username}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          navigate("/ActiveRide");
        }
      } catch {
        /* ignore */
      }
    })();
  }, [navigate, username]);

  // Fetch the list of available rides based on filters
  const fetchAvailable = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const url = `${BACKEND}/RideAloneOption?status=${rideAlone}&womenonly=${womenOnly}&isWoman=${userGender || ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      setOrders(data || []);
    } catch {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [rideAlone, womenOnly, userGender]);

  useEffect(() => {
    fetchAvailable();
  }, [fetchAvailable]);

  // ★ After loading orders, fetch each driver's average rating
  useEffect(() => {
    const drivers = [...new Set(orders.map((o) => o.username_drivers))];
    console.log("Fetching ratings for:", drivers);
    Promise.all(
      drivers.map((u) =>
        fetch(`${BACKEND}/driver-average-rating/${u}`)
          .then((r) => r.json())
          .then((d) => [u, Number(d.avg_rating)])
      )
    )
      .then((pairs) => {
        const obj = Object.fromEntries(pairs);
        console.log("Got ratings:", obj);
        setRatings(obj);
      })
      .catch((e) => console.error("Rating fetch error:", e));
  }, [orders]);

  const handleSelection = (id) =>
    setSelectedOrderId((prev) => (prev === id ? null : id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderId) {
      alert("Please select a ride to request.");
      return;
    }
    if (!username) {
      alert("You must be logged in to request a ride.");
      return;
    }
    try {
      const res = await fetch(`${BACKEND}/AddingUserToRide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username_riders: username, order_id: selectedOrderId }),
      });
      if (!res.ok) throw new Error("Failed to join");
      localStorage.setItem("ActiveRide", "true");
      navigate("/ActiveRide");
    } catch (err) {
      console.error(err);
      alert("Could not request ride.");
    }
  };

  const handleDriverClick = async (uname) => {
    if (!uname) return;
    try {
      const [p, c, ph, img] = await Promise.all([
        fetch(`${BACKEND}/driver/${uname}`),
        fetch(`${BACKEND}/car/${uname}`),
        fetch(`${BACKEND}/car-photos/${uname}`),
        fetch(`${BACKEND}/latest-profile/${uname}`),
      ]);
      if (!p.ok || !c.ok || !ph.ok || !img.ok) return;

      const prof = await p.json();
      const car = await c.json();
      const photos = await ph.json();
      const imgData = await img.json();

      const coercedRating = prof.avg_rating != null ? Number(prof.avg_rating) : null;

      setDriverPhotos(photos.photos || []);
      setSelectedDriver({
        ...prof,
        avg_rating:
          coercedRating !== null && !isNaN(coercedRating) ? coercedRating : null,
        car: car.error ? null : car,
        profile_pic: imgData.photo || "default.png",
      });
      setShowProfileModal(true);
    } catch (err) {
      console.error("Error fetching driver info:", err);
    }
  };

  // Prepare filtering and sorting
  const uniqueDestinations = [
    "All",
    ...new Set(orders.map((o) => o.destination).filter(Boolean)),
  ];
  const filtered = useMemo(() => {
    let arr =
      destinationFilter === "All"
        ? [...orders]
        : orders.filter((o) => o.destination === destinationFilter);

    if (sortOption === "dateNewest")
      arr.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
    else if (sortOption === "dateOldest")
      arr.sort((a, b) => new Date(a.order_date) - new Date(b.order_date));
    else if (sortOption === "seatsMost")
      arr.sort((a, b) => b.seat_number - a.seat_number);
    else if (sortOption === "seatsLeast")
      arr.sort((a, b) => a.seat_number - b.seat_number);

    return arr;
  }, [orders, destinationFilter, sortOption]);

  if (isLoading)
    return (
      <div style={{ textAlign: "center", marginTop: 50 }}>
        <img
          src={Puzzlenobackground}
          alt="Loading"
          style={{ width: 50, height: 50 }}
        />
        <p>Loading…</p>
      </div>
    );

  if (isError)
    return (
      <div style={{ textAlign: "center", marginTop: 50, color: "red" }}>
        <p>An error has occurred!</p>
      </div>
    );

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Available Rides</h2>

      {/* Filters */}
      <div style={{ marginBottom: "1rem" }}>
        {userGender === "Female" && (
          <label style={{ marginRight: 20 }}>
            Want Your Driver to be a Woman?
            <input
              type="checkbox"
              checked={womenOnly === "Yes"}
              onChange={(e) => setWomenOnly(e.target.checked ? "Yes" : "No")}
            />
          </label>
        )}
        <label>
          Want to Ride Alone?
          <input
            type="checkbox"
            checked={rideAlone === "Yes"}
            onChange={(e) => setRideAlone(e.target.checked ? "Yes" : "No")}
          />
        </label>
        <hr style={{ margin: "1rem 0" }} />
        <label style={{ marginRight: 20 }}>
          Filter by Destination:
          <select
            value={destinationFilter}
            onChange={(e) => setDestinationFilter(e.target.value)}
          >
            {uniqueDestinations.map((dest) => (
              <option key={dest} value={dest}>
                {dest}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sort By:
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="none">None</option>
            <option value="dateNewest">Date (Newest)</option>
            <option value="dateOldest">Date (Oldest)</option>
            <option value="seatsMost">Seats (High→Low)</option>
            <option value="seatsLeast">Seats (Low→High)</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <p>No available rides for these filters.</p>
      ) : (
        <table
          style={{
            margin: "0 auto",
            width: "95%",
            borderCollapse: "collapse",
            minWidth: 600,
          }}
          border="1"
        >
          <thead style={{ background: "#004d33", color: "#fff" }}>
            <tr>
              <th>Select</th>
              <th>Driver</th>
              <th>Rating</th>
              <th>Town</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Time</th>
              <th>Scheduled Date</th>
              <th>Seats</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.order_id}>
                <td style={{ textAlign: "center" }}>
                  <input
                    type="radio"
                    name="rideSelect"
                    checked={selectedOrderId === order.order_id}
                    onChange={() => handleSelection(order.order_id)}
                  />
                </td>
                <td>
                  <span
                    style={{
                      color: "blue",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                    onClick={() =>
                      navigate(`/driver-profile/${order.username_drivers}`)
                    }
                  >
                    {order.username_drivers}
                  </span>
                </td>
                <td style={{ textAlign: "center" }}>
                  {/* ★ show a number if we actually got one, otherwise “––” */}
                  {typeof ratings[order.username_drivers] === "number"
                    ? ratings[order.username_drivers].toFixed(1)
                    : "--"}
                </td>
                <td>{order.town || "—"}</td>
                <td>{order.origin}</td>
                <td>{order.destination}</td>
                <td>{order.time}</td>
                <td>
                  {order.scheduled_date
                    ? DateTime.fromISO(order.scheduled_date).toLocaleString(
                        DateTime.DATE_MED
                      )
                    : "—"}
                </td>
                <td>{order.seat_number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ marginTop: 20 }}>
        <button
          onClick={handleSubmit}
          style={{
            marginRight: 10,
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "#fff",
            border: "none",
            borderRadius: 5,
          }}
        >
          Confirm Selection
        </button>
        <button
          onClick={() => setSelectedOrderId(null)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#ffc107",
            color: "#000",
            border: "none",
            borderRadius: 5,
          }}
        >
          Cancel Selection
        </button>
      </div>

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: 30,
          backgroundColor: "#007bff",
          color: "#fff",
          padding: "10px 20px",
          border: "none",
          borderRadius: 5,
        }}
      >
        Home
      </button>

      {showProfileModal && selectedDriver && (
        <MiniProfileModal
          driver={selectedDriver}
          photos={driverPhotos}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedDriver(null);
            setDriverPhotos([]);
          }}
        />
      )}
    </div>
  );
};

export default RequestARide;
