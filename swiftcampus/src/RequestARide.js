import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Puzzlenobackground from "../src/Puzzlenobackground.gif";

const RequestARide = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [destinationFilter, setDestinationFilter] = useState("All");
  const [rideAlone, setRideAlone] = useState("No");
  const [WomenOnly, setWomenOnly] = useState("No");
  const [sortOption, setSortOption] = useState("none");
  const [isChecked, setIsChecked] = useState(false);
  const [isChecked2, setIsChecked2] = useState(false);
  const userGender = localStorage.getItem("gender");




    useEffect(() => {
    const checkifactive = async () => {
      const username = localStorage.getItem("username");
      try {
        const url = `http://localhost:5000/ActiveRideCheck?param1=${username}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        console.log("RAR Data: " + data)
        if (data == "")
        {return}
        else {navigate("/ActiveRide")}
      } catch (err) {
        console.error("Error fetching:", err);
      }
    };
    checkifactive();
  });

  useEffect(() => {
    const activeride = localStorage.getItem("ActiveRide");
    if (activeride) navigate("/ActiveRide");
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);
      console.log("RideAlone: " + rideAlone)
      try {
        const url = `http://localhost:5000/RideAloneOption?status=${rideAlone}&womenonly=${WomenOnly}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        console.error("Error fetching:", err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [rideAlone, WomenOnly]);

  const handleSelection = (orderId) => {
    setSelectedOrderId((prev) => (prev === orderId ? null : orderId));
  };


  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
    setRideAlone(event.target.checked ? "Yes" : "No");}

  const handleCheckboxChange2 = (event) => {
    setIsChecked2(event.target.checked);
    setWomenOnly(event.target.checked ? "Yes" : "No");}

  const handleSubmit = async () => {
    if (!selectedOrderId) return alert("Please select a ride to request.");
    const username_riders = localStorage.getItem("username");
    const userToAdd = { username_riders, order_id: selectedOrderId };

    try {
      const res = await fetch("http://localhost:5000/AddingUserToRide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userToAdd),
      });

      if (res.ok) {
        localStorage.setItem("ActiveRide", true);
        navigate("/ActiveRide");
      } else {
        const data = await res.json();
        console.error("Failed to join ride:", data.message);
      }
    } catch (error) {
      console.error("Server error:", error);
    }
  };

  const handleCancel = () => setSelectedOrderId(null);

  const uniqueDestinations = ["All", ...new Set(orders.map((o) => o.destination))];

  let filteredOrders = destinationFilter === "All"
    ? [...orders]
    : orders.filter((order) => order.destination === destinationFilter);

  if (sortOption === "dateNewest") {
    filteredOrders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
  } else if (sortOption === "dateOldest") {
    filteredOrders.sort((a, b) => new Date(a.order_date) - new Date(b.order_date));
  } else if (sortOption === "seatsMost") {
    filteredOrders.sort((a, b) => b.seat_number - a.seat_number);
  } else if (sortOption === "seatsLeast") {
    filteredOrders.sort((a, b) => a.seat_number - b.seat_number);
  }

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2 className="headerfont">Available Rides</h2>

      {isError && <div style={{ color: "red" }}>An error has occurred!</div>}

      {isLoading ? (
        <div>
          <img src={Puzzlenobackground} alt="loading..." />
          <p>Loading...</p>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div style={{ marginBottom: "1rem" }}>
          {(userGender == "Female" &&   
          <label>
              Want Your Driver to be a Woman?
            <input
            type="checkbox"
            checked={isChecked2}
            onChange={handleCheckboxChange2}
            />
            </label>)}
            <label>
              Want to Ride Alone?
            <input
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
            />
            </label><hr/>
            &nbsp;&nbsp;
            <label>
              Filter by Destination:{" "}
              <select value={destinationFilter} onChange={(e) => setDestinationFilter(e.target.value)}>
                {uniqueDestinations.map((dest, idx) => (
                  <option key={idx} value={dest}>{dest}</option>
                ))}
              </select>
            </label>
            &nbsp;&nbsp;
            <label>
              Sort By:{" "}
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                <option value="none">None</option>
                <option value="dateNewest">Date (Newest to Oldest)</option>
                <option value="dateOldest">Date (Oldest to Newest)</option>
                <option value="seatsMost">Seat Count (High to Low)</option>
                <option value="seatsLeast">Seat Count (Low to High)</option>
              </select>
            </label>
          </div>

          {filteredOrders.length === 0 ? (
            <p>No available rides for this filter.</p>
          ) : (
            <form onSubmit={(e) => e.preventDefault()}>
              <table style={{ margin: "0 auto", width: "95%", borderCollapse: "collapse" }} border="1">
                <thead>
                  <tr class="tableheader">
                    <th>Select</th>
                    <th>Driver</th>
                    <th>Origin</th>
                    <th>Destination</th>
                    <th>Time</th>
                    <th>Seats</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.order_id}>
                      <td>
                        <input
                          type="radio"
                          name="rideSelect"
                          checked={selectedOrderId === order.order_id}
                          onChange={() => handleSelection(order.order_id)}
                        />
                      </td>
                      <td>{order.username_drivers}</td>
                      <td>{order.origin}</td>
                      <td>{order.destination}</td>
                      <td>{order.time}</td>
                      <td>{order.seat_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={handleSubmit}
                  style={{
                    marginRight: "10px",
                    padding: "10px 20px",
                    backgroundColor: "#28a745",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Confirm Selection
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#ffc107",
                    color: "#000",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Cancel Selection
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default RequestARide;
