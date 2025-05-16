import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Settings from "./Components/Settings/Settings";
import "./Components/User Profile/Profile.css";
import CarPhotoGallery from "./Components/User Profile/CarPhotoGallary";
import EditCar from "./Components/User Profile/EditCar";

const DriverProfile = () => {
  const [driver, setDriver] = useState(null);
  const [car, setCar] = useState(null);
  const [selectedImage, setSelectedImage] = useState("default.png");
  const [errors, setErrors] = useState({ driver: "", car: "" });
  const [isEditingCar, setIsEditingCar] = useState(false);

  const navigate = useNavigate();
  const username = localStorage.getItem("driverUsername");

  const refreshCarInfo = async () => {
    try {
      const res = await fetch(`process.env.REACT_APP_BACKEND/car/${username}`);
      const text = await res.text();
      const data = JSON.parse(text);
      if (!res.ok) throw new Error(data.error || "Error fetching car info");
      setCar(data);
    } catch (err) {
      console.error("Car info error:", err);
      setCar(null);
      setErrors((prev) => ({ ...prev, car: err.message || "Failed to fetch car info" }));
    }
  };

  useEffect(() => {
    const userType = localStorage.getItem("userType");
    if (userType !== "driver") navigate("/unauthorized");

    if (!username) {
      navigate("/driver-login");
      return;
    }

    const fetchDriverInfo = async () => {
      try {
        const res = await fetch(`process.env.REACT_APP_BACKEND/driver/${username}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error fetching driver info");
        setDriver(data);
      } catch (err) {
        console.error("Driver info error:", err);
        setErrors((prev) => ({ ...prev, driver: err.message }));
      }
    };

    const fetchProfileImage = async () => {
      try {
        const res = await fetch(`process.env.REACT_APP_BACKEND/latest-profile/${username}`);
        const data = await res.json();
        setSelectedImage(data.photo || "default.png");
      } catch (err) {
        console.error("Image fetch error:", err);
        setSelectedImage("default.png");
      }
    };

    fetchDriverInfo();
    refreshCarInfo();
    fetchProfileImage();
  }, [navigate, username]);

  const profileImageSrc =
    selectedImage?.startsWith("profile") || selectedImage === "default.png"
      ? `/images/${selectedImage}`
      : `process.env.REACT_APP_BACKEND/uploads/${selectedImage}`;

  if (errors.driver || errors.car) {
    return (
      <div style={{ textAlign: "center" }}>
        <h3 style={{ color: "red" }}>{errors.driver || errors.car}</h3>
        <button onClick={() => navigate("/driver-home")}>Back to Home</button>
      </div>
    );
  }

  if (!driver || !car) return <p>Loading driver profile...</p>;

  return (
    <div className="profile-container">
      <Settings />

      <div className="profile-main-layout">
        {/* LEFT: Profile */}
        <div className="profile-card">
          <div className="profile-pic-container">
            <img src={profileImageSrc} alt="Driver Profile" className="profile-pic" />
          </div>

          <div className="profile-info">
            <h2>{driver.firstname} {driver.lastname}</h2>
            <p><strong>Username:</strong> {driver.username}</p>
            <p><strong>Email:</strong> {driver.email}</p>
            <p><strong>Gender:</strong> {driver.gender}</p>
          </div>

          <div className="profile-buttons">
            <button onClick={() => navigate("/driver-profile/edit")}>Edit Profile</button>
          </div>
        </div>

        {/* RIGHT: Car info + Edit */}
        <div className="profile-detail-column">
          <div className="vehicle-info-box">
            {/* LEFT: Car Info */}
            <div className="vehicle-info-details">
              <h3>Vehicle Information</h3>
              <p><strong>Type:</strong> {car.car_type}</p>
              <p><strong>Color:</strong> {car.color}</p>
              <p><strong>License Plate:</strong> {car.License_plate}</p>
              <p><strong>Year:</strong> {car.year}</p>
              <p><strong>Make:</strong> {car.make}</p>
              <p><strong>Model:</strong> {car.model}</p>
              <p><strong>Seats:</strong> {car.seats}</p>

              {!isEditingCar && (
                <button className="edit-vehicle" onClick={() => setIsEditingCar(true)}>
                  Edit Vehicle Info
                </button>
              )}
            </div>

            {/* RIGHT: Edit Form */}
            <div className="vehicle-edit-wrapper">
              {isEditingCar && (
                <EditCar
                  username={username}
                  existingCar={car}
                  onCarUpdated={() => {
                    refreshCarInfo();
                    setIsEditingCar(false);
                  }}
                  onCancel={() => setIsEditingCar(false)}
                />
              )}
            </div>
          </div>

          {/* BELOW: Car Gallery */}
          <CarPhotoGallery username={username} />
        </div>
      </div>
    </div>
  );
};

export default DriverProfile;
