import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";

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

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));

    useEffect(() => {
        const checkAuth = () => {
            setIsAuthenticated(!!localStorage.getItem("token"));
        };

        window.addEventListener("storage", checkAuth);
        return () => window.removeEventListener("storage", checkAuth);
    }, []);

    return (
        // Need to properly figure out session control
        <Router>
            <div >
            <Navbar isAuthenticated={isAuthenticated} />
        
            
           
            <Routes>
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
            </Routes>
            </div>
                <Routes>
                    <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
                    <Route path="/fromcampus" element={<FromCampus />} />
                    <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/team" element={<Developers />} />
                    <Route path="/profile/edit" element={<EditProfilePage />} />
                    <Route path="/RequestARide" element={<RequestARide />} />
                    <Route path="/ActiveRide" element={<ActiveRide />} />
                    <Route path="/driver-login" element={<DriverLogin />} />
                    <Route path="/driver-signup" element={<DriverSignup />} />
                    <Route path="/car-details" element={<Car />} />
                    {/* <Route path="/driver-dashboard" element={<DriverProfile />} /> */}
                    <Route path="/driver-profile" element={<DriverProfile />} />
                    <Route path="/driver-home" element={<DriverHome />} />


                    < Route path="/settings" element={<SettingsLayout />}>
                        <Route path="privacy" element={<Privacy />} />
                        <Route path="security" element={<Security />} />
                        <Route path="notifications" element={<Notifications />} />

                    </Route>
                </Routes>
            
              <Footer />
            
        </Router>
    );
};

export default App;
