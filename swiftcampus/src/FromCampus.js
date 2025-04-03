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

      <h2>Ride From Campus</h2>
      <form onSubmit={handleOrder}>
        <label>seat_number</label>
        <select value={seat_number} onChange={(e) => setSeat_Number(e.target.value)} required>
          {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
        <br />
        <label>time</label>
        <select value={time} onChange={(e) => setTime(e.target.value)} required>
          {["8:00AM", "9:00AM", "10:00AM", "11:00AM", "12:00PM", "1:00PM"].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <br />
        <label>origin</label>
        <select value={origin} onChange={(e) => setOrigin(e.target.value)} required>
          <option value="Amityville">Amityville</option>
        </select>
        <br />
        <label>destination</label>
        <select value={destination} onChange={(e) => setDestination(e.target.value)} required>
          <option value="Campus Center">Campus Center</option>
          <option value="Nold">Nold</option>
        </select>
        <br />
        <button type="submit">Make Order</button>
      </form>

      {message && <p style={{ color: isSuccess ? "green" : "red" }}>{message}</p>}
    </div>
  );
};

export default FromCampus;
