import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const DriverProfile = () => {
    const navigate = useNavigate();
  const [driver, setDriver] = useState(null);
  const [car, setCar] = useState(null);
  const [driverError, setDriverError] = useState("");
  const [carError, setCarError] = useState("");

  const username = localStorage.getItem("driverUsername");

  useEffect(() => {
    const fetchDriverInfo = async () => {
      try {
        const res = await fetch(`http://localhost:5000/driver/${username}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setDriverError(errData.error || "Error fetching driver info");
          return;
        }
        const data = await res.json();
        setDriver(data);
      } catch (err) {
        console.error("Error fetching driver info:", err);
        setDriverError("Network error or server not reachable.");
      }
    };

    const fetchCarInfo = async () => {
      try {
        const res = await fetch(`http://localhost:5000/car/${username}`);
        const text = await res.text();

        try {
          const data = JSON.parse(text);
          if (!res.ok) {
            setCarError(data.error || "Error fetching car info");
            return;
          }
          setCar(data);
        } catch (jsonErr) {
          console.error("Non-JSON response from /car:", text);
          setCarError("Unexpected server response for car info.");
        }

      } catch (err) {
        console.error("Error fetching car info:", err);
        setCarError("Network error or server not reachable.");
      }
    };

    if (username) {
      fetchDriverInfo();
      fetchCarInfo();
    }
  }, [username]);

  if (!username) {
    return <p>No driver username found. Please log in.</p>;
  }

  if (driverError || carError) {
    return (
      <div style={{ textAlign: "center" }}>
        {/* ✅ Navigation */}
        <div style={{ marginBottom: "20px" }}>
          <Link to="/driver-home" style={{ marginRight: "15px", fontWeight: "bold", color: "purple", textDecoration: "underline" }}>
            Home
          </Link>
          |
          <Link to="/driver-profile" style={{ marginLeft: "15px", fontWeight: "bold", color: "purple", textDecoration: "underline" }}>
            Profile
          </Link>
        </div>

        {/* ✅ Error Display */}
        {driverError && <p style={{ color: "red" }}>{driverError}</p>}
        {carError && <p style={{ color: "red" }}>{carError}</p>}
      </div>
    );
  }

  if (!driver || !car) {
    return <p>Loading profile...</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      {/* ✅ Profile Info */}
      <div
        className="driver-profile-container"
        style={{ display: "flex", justifyContent: "space-around" }}
      >
        <div>
          <h2>Driver Info</h2>
          <p><strong>Username:</strong> {driver.username}</p>
          <p><strong>Name:</strong> {driver.firstname} {driver.lastname}</p>
          <p><strong>Email:</strong> {driver.email}</p>
          <p><strong>Gender:</strong> {driver.gender}</p>
        </div>

        <div>
          <h2>Car Info</h2>
          <p><strong>Type:</strong> {car.car_type}</p>
          <p><strong>Color:</strong> {car.color}</p>
          <p><strong>License Plate:</strong> {car.License_plate}</p>
          <p><strong>Year:</strong> {car.year}</p>
          <p><strong>Make:</strong> {car.make}</p>
          <p><strong>Model:</strong> {car.model}</p>
          <p><strong>Seats:</strong> {car.seats}</p>
        </div>
      </div>
{      <div style={{textAlign : "center"}}  >
      <button
        onClick={() => navigate("/driver-home")}
        style={{
          margin: "10px",
          padding: "10px 20px",
          fontSize: "16px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
        }}
      >
        -Temp Button- Home
      </button>
      </div>}
    </div>
  );
};

export default DriverProfile;
