import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Profile from "./Profile";

const App = () => {
    return (
        <Router>
            <div style={{ textAlign: "center", marginTop: "20px" }}>
                <h1>Edit src/App.js and save to reload.</h1>
                <nav>
                    <Link to="/signup">Sign Up</Link> | <Link to="/login">Login</Link>
                </nav>
                <Routes>
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/profile" element={<Profile />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
