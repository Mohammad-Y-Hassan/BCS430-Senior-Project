import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
        window.dispatchEvent(new Event("storage")); //  Ensure session updates
        navigate("/login");
    };
    return (
        <div class="tablecard">
        <div>
            <h2 class="titlefont">Welcome to Swift Campus!</h2>
            <RequestARide />
            {/*  Logout Button */}
            </div>
            <div class="spacer"/>
        </div>
    );
};

export default Home;
