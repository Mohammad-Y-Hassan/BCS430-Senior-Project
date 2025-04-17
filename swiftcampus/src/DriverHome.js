import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const DriverHome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("driverToken");
    if (!token) {
      navigate("/driver-login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("storage"));
    navigate("/driver-login");
  };

  return (
    <div class="signup-card">
      <h2 class="titlefont">Welcome to Swift Campus</h2>
      <h1>What would you like to do?</h1>
      <button
        onClick={() => navigate("/fromcampus")}
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
        Offer a Ride
      </button>
      <button
        onClick={() => navigate("/driver-profile")}
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
        -Temp Button- Profile
      </button>
      <button
        onClick={handleLogout}
        style={{
          margin: "10px",
          padding: "10px",
          fontSize: "16px",
          backgroundColor: "#dc3545",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default DriverHome;
