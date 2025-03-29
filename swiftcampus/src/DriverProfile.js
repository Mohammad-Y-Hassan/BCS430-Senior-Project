import React, { useEffect, useState } from "react";

const DriverProfile = () => {
  const [driver, setDriver] = useState(null);
  const [car, setCar] = useState(null);
  const [driverError, setDriverError] = useState("");
  const [carError, setCarError] = useState("");

  // This must match how you store the driver username in localStorage
  const username = localStorage.getItem("driverUsername");

  useEffect(() => {
    const fetchDriverInfo = async () => {
      try {
        const res = await fetch(`http://localhost:5000/driver/${username}`);
        if (!res.ok) {
          // e.g., 404 or 500
          const errData = await res.json().catch(() => ({}));
          setDriverError(errData.error || "Error fetching driver info");
          return;
        }
        const data = await res.json();
        setDriver(data);
      } catch (err) {
        console.error("Error fetching driver info", err);
        setDriverError("Network error or server not reachable.");
      }
    };

    const fetchCarInfo = async () => {
      try {
        const res = await fetch(`http://localhost:5000/car/${username}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setCarError(errData.error || "Error fetching car info");
          return;
        }
        const data = await res.json();
        setCar(data);
      } catch (err) {
        console.error("Error fetching car info", err);
        setCarError("Network error or server not reachable.");
      }
    };

    if (username) {
      fetchDriverInfo();
      fetchCarInfo();
    }
  }, [username]);

  // If there's no username in localStorage, they aren't logged in as a driver
  if (!username) {
    return <p>No driver username found. Please log in.</p>;
  }

  // If we have any error, display it instead of "Loading profile..."
  if (driverError || carError) {
    return (
      <div style={{ textAlign: "center" }}>
        {driverError && <p style={{ color: "red" }}>{driverError}</p>}
        {carError && <p style={{ color: "red" }}>{carError}</p>}
      </div>
    );
  }

  // If the data hasn't loaded yet (no errors, but still null), show "Loading"
  if (!driver || !car) {
    return <p>Loading profile...</p>;
  }

  // Otherwise, we have valid driver & car data; render the profile
  return (
    <div
      className="driver-profile-container"
      style={{ display: "flex", justifyContent: "space-around", padding: "2rem" }}
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
  );
};

export default DriverProfile;
