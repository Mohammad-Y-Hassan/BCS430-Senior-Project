import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Profile from "./Profile";
import Home from "./Home";
import FromCampus from "./FromCampus";

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
        <Router>
            <h1 class="titlefont">Swift Campus</h1>
            <div class="card">
           

                {/* ✅ Navigation updates dynamically */}
                <nav style={{ marginBottom: "20px" }}>
                    {isAuthenticated ? (
                        <>
                            <Link to="/">Home</Link> |{" "}
                            <Link to="/profile">Profile</Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link> |{" "}
                            <Link to="/signup">Sign Up</Link>
                        </>
                    )}
                </nav>

                <Routes>
                    <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/login" />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/fromcampus" element={<FromCampus />} />
                    <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
                </Routes>

            </div>
        </Router>
    );
};

export default App;
