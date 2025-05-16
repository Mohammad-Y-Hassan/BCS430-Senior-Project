  import React, { useState, useEffect } from "react";
  import { useNavigate } from "react-router-dom";
  import "./Components/User Profile/AddCar.css";


  const Car = () => {
    const [car, setCar] = useState({
      car_type: "",
      color: "",
      customColor: "",
      License_plate: "",
      year: "",
      make: "",
      model: "",
      seats: "",
    });

    const carTypes = ["Car", "Truck", "SUV", "Motorcycle", "Van"];

    const colors = [
      "Black", "White", "Gray", "Silver", "Red", "Blue", "Brown",
      "Green", "Beige", "Yellow", "Orange", "Purple", "Gold",
      "Maroon", "Navy", "Teal", "Turquoise", "Pink", "Bronze", "Other"
    ];

    const makes = {
      Toyota: ["Camry", "Corolla", "RAV4"],
      Honda: ["Civic", "Accord", "CR-V"],
      Ford: ["F-150", "Escape", "Explorer"],
      Chevrolet: ["Silverado", "Equinox", "Malibu"],
      Nissan: ["Altima", "Rogue", "Sentra"],
      Hyundai: ["Elantra", "Tucson", "Santa Fe"],
      Kia: ["Soul", "Sportage", "Forte"],
      Volkswagen: ["Jetta", "Passat", "Tiguan"],
      Subaru: ["Outback", "Forester", "Impreza"],
    };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);


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
    
      const finalColor = car.color === "Other" ? car.customColor : car.color;
    
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND}/add-car`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...car, color: finalColor, username }),
        });
    
        const data = await response.json();
    
        if (!response.ok) {
          setMessage(data.error || "Failed to save car info.");
          return;
        }
    
        setMessage("Car details saved successfully!");
        navigate("/driver-profile"); 
      } catch (error) {
        console.error("Car Submit Error:", error);
        setMessage("Server error. Please try again.");
      }
    };
    

    return (
      <form className="car-form" onSubmit={handleSubmit}>
        <div>
          <label>Car Type:</label>
          <select name="car_type" value={car.car_type} onChange={handleChange}>
            <option value="">Select car type</option> 
            {carTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Color:</label>
          <select name="color" value={car.color} onChange={handleChange}>
            <option value="">Select a color</option>
            {colors.map((color) => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
        </div>

        {car.color === "Other" && (
          <div>
            <label>Custom Color:</label>
            <input
              type="text"
              name="customColor"
              value={car.customColor}
              onChange={handleChange}
            />
          </div>
        )}

        <div>
          <label>License Plate:</label>
          <input
            type="text"
            name="License_plate"
            maxLength="8"
            value={car.License_plate}
            onChange={handleChange}
          />
        </div>

        <div>
          <label>Year:</label>
          <select name="year" value={car.year} onChange={handleChange}>
            <option value="">Select year</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Make:</label>
          <select name="make" value={car.make} onChange={handleChange}>
            <option value="">Select make</option> 
            {Object.keys(makes).map((make) => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Model:</label>
          <select name="model" value={car.model} onChange={handleChange}>
            <option value="">Select model</option>
            {(makes[car.make] || []).map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Seats (for passengers):</label>
          <input
            type="number"
            name="seats"
            min="1"
            max="8"
            value={car.seats}
            onChange={handleChange}
          />
        </div>

        <button className="submitbtn" type="submit">
            Save Car Info
        </button>
        {message && (
          <p style={{ color: message.includes("success") ? "green" : "red" }}>
            {message}
          </p>
        )}
      </form>
  );
};

  export default Car;
