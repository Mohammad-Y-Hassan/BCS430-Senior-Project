import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

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

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            {/* ✅ Navigation */}
            <div style={{ marginBottom: "20px" }}>
                <Link to="/" style={{ marginRight: "15px", fontWeight: "bold", color: "purple", textDecoration: "underline" }}>
                    Home
                </Link>
                |
                <Link to="/profile" style={{ marginLeft: "15px", fontWeight: "bold", color: "purple", textDecoration: "underline" }}>
                    Profile
                </Link>
            </div>

            <h2>Welcome to Swift Campus</h2>

            {/* ✅ "Request a Ride" Button */}
            <button onClick={() => navigate("/requestride-fromcampus")} style={{
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
