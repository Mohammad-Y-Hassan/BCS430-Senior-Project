import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Puzzlenobackground from "../src/Puzzlenobackground.gif";
import RequestARide from "./RequestARide";

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

    return (
        <div class="signup-card">
        <div>
            <h2 class="titlefont">Welcome to Swift Campus!</h2>
            <RequestARide />

            {/* ✅ Logout Button */}
            <button onClick={handleLogout} style={{
                margin: "10px",
                padding: "10px",
                fontSize: "16px",
                backgroundColor: "#dc3545",
                color: "#fff",
                border: "none",
                borderRadius: "5px"
            }}>
                Logout
            </button>
            </div>
            <div class="spacer"/>
        </div>

    );
};

export default Home;
