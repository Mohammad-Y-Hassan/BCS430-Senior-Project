import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Signup from "./Signup";
import Login from "./Login";
import Profile from "./Profile";

const App = () => {
    return (
        
        <Router>
            <body>

            <div className= "card">
                <h1>Welcome to Swiftcampus</h1>
                <nav>
                    <Link to="/signup">
                    <button className="signupbtn">Signup</button>
                    </Link>
                    
                    <Link to="/login">
                    <button className="loginbtn">Login</button>
                    </Link>
                </nav>
                <Routes>
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/profile" element={<Profile />} />
                </Routes>
            </div>
            </body>
        </Router>

        
    );
};

export default App;