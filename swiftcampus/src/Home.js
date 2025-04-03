import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Puzzlenobackground from "../src/Puzzlenobackground.gif";

const Home = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        window.dispatchEvent(new Event("storage")); // ✅ Ensure session updates
        navigate("/login");
    };

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)

    useEffect(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
           const response = await fetch("http://localhost:5000/TestFormat");
           if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
           }
           const data = await response.json();
           setOrders(data);
        } catch (error) {
           console.error('Error fetching users:', error);
           setIsError(true)
        } finally {setIsLoading(false)}
      };
      fetchData();
    }, []);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Welcome to Swift Campus</h2>

            {/* ✅ "Request a Ride" Button */}
            <button onClick={() => navigate("/RequestARide")} style={{
                margin: "10px",
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "5px"
            }}>
                Request a Ride
            </button>

            {/* ✅ "Register as a Driver" Button */}
            <button onClick={() => navigate("/profile")} style={{
                margin: "10px",
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "5px"
            }}>
                Profile Page
            </button>

            {/* ✅ Logout Button */}
            <button onClick={handleLogout} style={{
                margin: "10px",
                padding: "10px",
                backgroundColor: "#dc3545",
                color: "#fff",
                border: "none",
                borderRadius: "5px"
            }}>
                Logout
            </button>
        </div>
    );
};

export default Home;
