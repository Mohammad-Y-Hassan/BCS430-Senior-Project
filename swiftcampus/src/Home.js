import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await fetch('http://localhost:5000/listoforders');
          if (!response.ok) {throw new Error(`HTTP error! status: ${response.status}`);}
          const json = await response.json();
          setData(json);
          setLoading(false);
        } catch (e) {
          setError(e);
          setLoading(false);
        }
      };
      fetchData();
    }, []);
  
    if (loading) {
      return <p>Loading...</p>;
    }
  
    if (error) {
      return <p>Error: {error.message}</p>;
    }

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Welcome to Swift Campus</h2>

            <div>{data && (<pre>{JSON.stringify(data, null, 2)}</pre>)}</div>

            {/* ✅ "Request a Ride" Button */}
            <button onClick={() => navigate("/fromcampus")} style={{
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
            <button onClick={() => navigate("/register-driver")} style={{
                margin: "10px",
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                borderRadius: "5px"
            }}>
                Register to Be a Driver
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
