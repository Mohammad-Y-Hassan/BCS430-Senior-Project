import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Car = () => {
  const [car, setCar] = useState({
    car_type: "",
    color: "",
    License_plate: "",
    year: "",
    make: "",
    model: "",
    seats: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const username = localStorage.getItem("driverUsername");

  useEffect(() => {
    if (!username) {
      setMessage("Session expired or not logged in as a driver. Please log in again.");
      // Optionally redirect them automatically:
      // navigate("/driver-login");
    }
  }, [username, navigate]);

  const handleChange = (e) => {
    setCar({ ...car, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username) {
      setMessage("No driver username found. Please log in first.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/add-car", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...car, username }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Failed to save car info.");
        return;
      }

      setMessage("Car details saved successfully!");
      // Direct the driver to the dashboard/profile page after saving car info
      navigate("/driver-profile");
    } catch (error) {
      console.error("Car Submit Error:", error);
      setMessage("Server error. Please try again.");
    }
  };

  return (
    <div class="signup-card">
      <h2 className="titlefont">Enter Your Car Details</h2>
      <div className="blockstyle">
        <form onSubmit={handleSubmit}>
          <label className="fieldlabel">
            Car Type
            <br />
          </label>
          <input
            className="inputfieldsignup"
            type="text"
            name="car_type"
            value={car.car_type}
            onChange={handleChange}
            required
          />
          <br />
          <label className="fieldlabel">
            Color
            <br />
          </label>
          <input
            className="inputfieldsignup"
            type="text"
            name="color"
            value={car.color}
            onChange={handleChange}
            required
          />
          <br />
          <label className="fieldlabel">
            License Plate
            <br />
          </label>
          <input
            className="inputfieldsignup"
            type="text"
            name="License_plate"
            value={car.License_plate}
            onChange={handleChange}
            required
          />
          <br />
          <label className="fieldlabel">
            Year
            <br />
          </label>
          <input
            className="inputfieldsignup"
            type="text"
            name="year"
            value={car.year}
            onChange={handleChange}
            required
          />
          <br />
          <label className="fieldlabel">
            Make
            <br />
          </label>
          <input
            className="inputfieldsignup"
            type="text"
            name="make"
            value={car.make}
            onChange={handleChange}
            required
          />
          <br />
          <label className="fieldlabel">
            Model
            <br />
          </label>
          <input
            className="inputfieldsignup"
            type="text"
            name="model"
            value={car.model}
            onChange={handleChange}
            required
          />
          <br />
          <label className="fieldlabel">
            Available Seats
            <br />
          </label>
          <input
            className="inputfieldsignup"
            type="number"
            name="seats"
            value={car.seats}
            onChange={handleChange}
            required
          />
          <br />
          <button className="submitbtn" type="submit">
            Save Car Info
          </button>
        </form>
        {message && (
          <p style={{ color: message.includes("success") ? "green" : "red" }}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default Car;
