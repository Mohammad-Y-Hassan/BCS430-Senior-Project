import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import {APIProvider} from "@vis.gl/react-google-maps"

import Signup from "./Signup";
import Login from "./Login";
import Profile from "./Components/User Profile/Profile";
import Home from "./Home";
import FromCampus from "./FromCampus";
import Privacy from "./Components/Settings/Privacy";
import Security from "./Components/Settings/Security";
import SettingsLayout from "./Components/Settings/SettingsLayout";
import Notifications from "./Components/Settings/Notifications";
import Navbar from "./Components/Navbar"; 
import Footer from "./Components/Footer"; 
import AboutUs from "./Components/AboutUs.js";
import Developers from "./Components/Team.js";
import EditProfilePage from "./Components/User Profile/EditProfilePage.js";
import DriverLogin from "./DriverLogIn";
import DriverSignup from "./DriverSignup";
import Car from "./Car";
import DriverProfile from "./DriverProfile";
import RequestARide from "./RequestARide";
import ActiveRide from "./ActiveRide";
import DriverHome from "./DriverHome";
import DriverEditProfilePage from "./DriverEditProfile";

const App = () => {
  const apikey = process.env.REACT_APP_API_KEY
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token") || !!localStorage.getItem("driverToken")
  );

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const driverToken = localStorage.getItem("driverToken");
      setIsAuthenticated(!!token || !!driverToken);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const userType = localStorage.getItem("userType");

  return (
        <APIProvider apiKey={apikey} onLoad={() => console.log("Maps API provider loaded.")}>
    <Router>
      <div className="app">
        <Navbar isAuthenticated={isAuthenticated} />

        <Routes>
          {/* Auth Routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/driver-login" element={<DriverLogin />} />
          <Route path="/driver-signup" element={<DriverSignup />} />

          {/* Home Route Logic */}
          <Route path="/" element={
            isAuthenticated
              ? (userType === "driver" ? <Navigate to="/driver-home" /> : <Home />)
              : <Navigate to="/login" />
          } />

          {/* Rider Routes */}
          <Route path="/fromcampus" element={<FromCampus />} />
          <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/RequestARide" element={<RequestARide />} />
          <Route path="/ActiveRide" element={<ActiveRide />} />

          {/* Driver Routes */}
          <Route path="/driver-profile" element={<DriverProfile />} />
          <Route path="/driver-profile/edit" element={<DriverEditProfilePage />} />
          <Route path="/driver-home" element={<DriverHome />} />
          <Route path="/car-details" element={<Car />} />

          {/* General Routes */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/team" element={<Developers />} />

          {/* Settings (Nested) */}
          <Route path="/settings" element={<SettingsLayout />}>
            <Route path="privacy" element={<Privacy />} />
            <Route path="security" element={<Security />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Routes>

        <Footer />
      </div>
    </Router>
        </APIProvider>
  );
};

export default App;
