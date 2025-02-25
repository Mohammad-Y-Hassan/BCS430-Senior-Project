import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Profile = () => {
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const storedUsername = localStorage.getItem("username");

        if (!token) {
            navigate("/login"); // Redirect to login if no token is found
            return;
        }

        fetch("http://localhost:5000/profile", {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.username) {
                setMessage(`Welcome, ${data.username}!`);
            } else {
                setMessage("Error loading profile.");
            }
        });
    }, [navigate]);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Profile</h2>
            <p>{message}</p>
            <button onClick={() => { localStorage.clear(); navigate("/login"); }}>Logout</button>
        </div>
    );
};

export default Profile;
