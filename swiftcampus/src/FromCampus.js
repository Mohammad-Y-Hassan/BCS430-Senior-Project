import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const FromCampus = () => {
  const [message, setMessage] = useState("");
  const [seat_number, setSeat_Number] = useState("1");
  const [time, setTime] = useState("08:00");
  const [origin, setOrigin] = useState("Amityville");
  const [destination, setDestination] = useState("Campus Center");

  const [isSuccess, setIsSuccess] = useState(null);
  const navigate = useNavigate();

  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();

  const handleOrder = async (e) => {
    e.preventDefault();

    const Order_Date = `${mm}/${dd}/${yyyy}`;
    const username_drivers = localStorage.getItem("driverUsername"); // ✅ Correct key
    const userOrder = {
      Order_Date,
      username_drivers,
      seat_number,
      time,
      origin,
      destination,
    };

    try {
      const creatingorder = await fetch("http://localhost:5000/orderridetocampus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userOrder),
      });

      const data = await creatingorder.json();
      setMessage(data.message);
      setIsSuccess(creatingorder.ok);

      if (creatingorder.ok) {
        console.log("Order made successfully.");
        setTimeout(() => navigate("/driver-home"), 1500); // ✅ Redirect to driver home
      }
    } catch (error) {
      setIsSuccess(false);
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      {/* Top Navigation */}
      <div style={{ marginBottom: "20px" }}>
        <Link to="/driver-home" style={{ marginRight: "15px", fontWeight: "bold", color: "purple", textDecoration: "underline" }}>
          Home
        </Link>
        |
        <Link to="/driver-profile" style={{ marginLeft: "15px", fontWeight: "bold", color: "purple", textDecoration: "underline" }}>
          Profile
        </Link>
      </div>

      <h2 class="headerfont">Ride From Campus</h2>
      <form onSubmit={handleOrder}>
        <label class="fromcamptxt">Available Seats: </label>
        <select class="rideselect" value={seat_number} onChange={(e) => setSeat_Number(e.target.value)} required>
          {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <br />
        <label class="fromcamptxt">Pickup Time: </label>
        <select class="rideselect" value={time} onChange={(e) => setTime(e.target.value)} required>
          {["8:00AM", "9:00AM", "10:00AM", "11:00AM", "12:00PM", "1:00PM", "2:00PM", "3:00PM", "4:00PM", "5:00PM", "6:00PM", "7:00PM", "8:00PM"].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <br />
        <label class="fromcamptxt">Pickup Destination: </label>
        <select class="rideselect" value={origin} onChange={(e) => setOrigin(e.target.value)} required>
          <option value="Amityville">Amityville</option>
          <option value="Bethpage">Bethpage</option>
          <option value="Garden City">Garden City</option>
          <option value="Port Jefferson">Port Jefferson</option>
          <option value="Glen Cove">Glen Cove</option>
          <option value="Elmont">Elmont</option>
          <option value="Freeport">Freeport</option>
          <option value="Islip">Islip</option>
          <option value="Huntington">Huntington</option>
          <option value="Montauk">Montauk</option>

        </select>
        <br />
        <label class="fromcamptxt">Destination: </label>
        <select class="rideselect" value={destination} onChange={(e) => setDestination(e.target.value)} required>
          <option value="Campus Center">Campus Center</option>
          <option value="Nold">Nold</option>
          <option value="Orchard Hall (Student Housing)">Orchard Hall (Student Housing)</option>
          <option value="Campus Police">Campus Police</option>
        </select>
        <br />
        <button class="submitbtn" type="submit">Make Order: </button>
      </form>

      {message && <p style={{ color: isSuccess ? "green" : "red" }}>{message}</p>}
    </div>
  );
};

export default FromCampus;
