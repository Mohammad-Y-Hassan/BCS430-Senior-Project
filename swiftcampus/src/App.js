import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
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
            <div className="app">
            <Navbar isAuthenticated={isAuthenticated} />
        
            <div class="card">
           <div className="signup-card">
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


                    < Route path="/settings" element={<SettingsLayout />}>
                        <Route path="privacy" element={<Privacy />} />
                        <Route path="security" element={<Security />} />
                        <Route path="notifications" element={<Notifications />} />

                    </Route>
                </Routes>
            </div>
              <Footer />
            </div>
        </Router>
    );
};

export default App;
