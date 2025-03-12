import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
            <button onClick={() => navigate("/")}>Home</button>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default Profile;
