import React, { useState, useEffect } from "react";
import "./AddCar.css";

const EditCar = ({ username, existingCar, onCarUpdated, onCancel }) => {
  const [formData, setFormData] = useState({
    car_type: existingCar?.car_type || "Car",
    color: existingCar?.color || "",
    customColor: "",
    license_plate: existingCar?.license_plate || "",
    year: existingCar?.year || "",
    make: existingCar?.make || "",
    model: existingCar?.model || "",
    seats: existingCar?.seats || 1,
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Reset model if make changes
    if (name === "make") {
      setFormData((prev) => ({ ...prev, make: value, model: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalColor = formData.color === "Other" ? formData.customColor : formData.color;

    const payload = {
      username,
      car_type: formData.car_type,
      color: finalColor,
      license_plate: formData.license_plate,
      year: formData.year,
      make: formData.make,
      model: formData.model,
      seats: formData.seats,
    };

    try {
      const res = await fetch("process.env.REACT_APP_BACKEND/edit-car", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update car");

      if (onCarUpdated) onCarUpdated();
      alert("Car updated successfully!");
    } catch (err) {
      console.error("Update failed:", err.message);
    }
  };

  return (
    <form className="car-form" onSubmit={handleSubmit}>
    <div className="form-columns">
      <div className="left-column">
        <div>
          <label>Car Type:</label>
          <select name="car_type" value={formData.car_type} onChange={handleChange}>
            {carTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
  
        <div>
          <label>Color:</label>
          <select name="color" value={formData.color} onChange={handleChange}>
            <option value="">Select a color</option>
            {colors.map((color) => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>
        </div>
  
        {formData.color === "Other" && (
          <div>
            <label>Custom Color:</label>
            <input
              type="text"
              name="customColor"
              value={formData.customColor}
              onChange={handleChange}
            />
          </div>
        )}
  
        <div>
          <label>License Plate:</label>
          <input
            type="text"
            name="license_plate"
            maxLength="8"
            value={formData.license_plate}
            onChange={handleChange}
          />
        </div>
      </div>
  
      <div className="right-column">
        <div>
          <label>Year:</label>
          <select name="year" value={formData.year} onChange={handleChange}>
            <option value="">Select year</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
  
        <div>
          <label>Make:</label>
          <select name="make" value={formData.make} onChange={handleChange}>
            <option value="">Select make</option>
            {Object.keys(makes).map((make) => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
        </div>
  
        <div>
          <label>Model:</label>
          <select name="model" value={formData.model} onChange={handleChange}>
            <option value="">Select model</option>
            {(makes[formData.make] || []).map((model) => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
  
        <div>
          <label>Seats:</label>
          <input
            type="number"
            name="seats"
            min="1"
            max="8"
            value={formData.seats}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  
    <div className="form-buttons">
  <button type="submit" className="save-btn">Save</button>
  <button type="button" className="cancel-btn" onClick={onCancel}>Cancel</button>
    </div>

  </form>
  
  );
};

export default EditCar;
