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

    const [orders, setOrders] = useState([]);

    useEffect(() => {
      const fetchData = async () => {
        try {
           const response = await fetch("http://localhost:5000/TestFormat");
           if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
           }
           const data = await response.json();
           setOrders(data);
        } catch (error) {
           console.error('Error fetching users:', error);
        }
      };
      fetchData();
    }, []);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Welcome to Swift Campus</h2>

            <ul>
            {orders.map(order => (
            <li key={order.order_id}>
            <p>{order.username_drivers} is going to be at {order.origin} at {order.time}<br></br>
            They are going to {order.destination}, they have {order.seat_number} seats avaliable <button>Catch a Ride</button></p>
            </li>
            ))}
            </ul>
            

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
