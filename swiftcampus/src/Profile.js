import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        setUserData({
            username: localStorage.getItem("username"),
            firstname: localStorage.getItem("firstname"),
            lastname: localStorage.getItem("lastname"),
            email: localStorage.getItem("email"),
            gender: localStorage.getItem("gender")
        });
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        window.dispatchEvent(new Event("storage")); // ✅ Update session status
        navigate("/login");
    };

    return (
        <div style={{ textAlign: "center" }}>
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

            <h2>Profile</h2>
            {userData ? (
                <>
                    <p><strong>Username:</strong> {userData.username}</p>
                    <p><strong>First Name:</strong> {userData.firstname}</p>
                    <p><strong>Last Name:</strong> {userData.lastname}</p>
                    <p><strong>Email:</strong> {userData.email}</p>
                    <p><strong>Gender:</strong> {userData.gender}</p>
                </>
            ) : (
                <p>Loading...</p>
            )}

            <button onClick={() => navigate("/")} style={{
                marginRight: "10px",
                padding: "10px 20px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "5px"
            }}>
                Home
            </button>

            <button onClick={handleLogout} style={{
                padding: "10px 20px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "5px"
            }}>
                Logout
            </button>
        </div>
    );
};

export default Profile;
