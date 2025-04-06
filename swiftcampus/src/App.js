import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";

import Signup from "./Signup";
import Login from "./Login";
import Profile from "./Profile";
import Home from "./Home";
import FromCampus from "./FromCampus";
import DriverLogin from "./DriverLogIn";
import DriverSignup from "./DriverSignup";
import Car from "./Car";
import DriverProfile from "./DriverProfile";
import DriverHome from "./DriverHome";
import RequestRideFromCampus from "./RequestRideFromCampus";

// ✅ Updated Navigation component
const Navigation = ({ isAuthenticated, isDriverAuthenticated }) => {
  const location = useLocation();
  const isDriverRoute = location.pathname.includes("driver");

  // ✅ Hide all auth links if user or driver is logged in
  if (isAuthenticated || isDriverAuthenticated) return null;

  return (
    <nav style={{ marginBottom: "20px" }}>
      {isDriverRoute ? (
        <>
          <Link to="/driver-login">Driver Login</Link> | <Link to="/driver-signup">Driver Sign Up</Link>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link> | <Link to="/signup">Sign Up</Link>
        </>
      )}
    </nav>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  const [isDriverAuthenticated, setIsDriverAuthenticated] = useState(!!localStorage.getItem("driverToken"));

  useEffect(() => {
    const checkAuth = () => {
      setIsAuthenticated(!!localStorage.getItem("token"));
      setIsDriverAuthenticated(!!localStorage.getItem("driverToken"));
    };
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  return (
    <Router>
      <h1 className="titlefont">Swift Campus</h1>
      <div className="card">
        <Navigation isAuthenticated={isAuthenticated} isDriverAuthenticated={isDriverAuthenticated} />
        <Routes>
          <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/fromcampus" element={<FromCampus />} />
          <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />

          <Route path="/driver-login" element={<DriverLogin />} />
          <Route path="/driver-signup" element={<DriverSignup />} />
          <Route path="/car-details" element={<Car />} />
          <Route path="/driver-profile" element={<DriverProfile />} />
          <Route path="/driver-home" element={<DriverHome />} />
          <Route path="/requestride-fromcampus" element={<RequestRideFromCampus />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
