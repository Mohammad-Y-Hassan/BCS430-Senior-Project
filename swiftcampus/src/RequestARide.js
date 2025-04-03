import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Puzzlenobackground from "../src/Puzzlenobackground.gif";

const RequestARide = () => {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

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
                console.error("Error fetching users:", error);
                setIsError(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddRider = async (orderID) => {
        const username_riders = localStorage.getItem("username");
        const userToAdd = { username_riders, order_id: orderID };
        try {
            const creatingOrder = await fetch("http://localhost:5000/AddingUserToRide", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userToAdd),
            });
            const data = await creatingOrder.json();
            if (creatingOrder.ok) {
                console.log("Order Made successfully");
                navigate("/ActiveRide");
            } else {
                console.error("Failed to create order:", data.message);
            }
        } catch (error) {
            console.error("Server error:", error);
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2 class="headerfont">Available Rides</h2>
            {isError && <div>An error has occurred!</div>}
            {isLoading && (
                <div>
                    <img src={Puzzlenobackground} alt="loading..." />
                    <br />
                    Loading...
                </div>
            )}
            {!isLoading && (
                <ul>
                    {orders.map((order) => (
                        <dd key={order.order_id}>
                            <div class="card2">
                                {order.username_drivers} is going to be at {order.origin} at{" "}
                                {order.time}
                                <br />
                                They are going to {order.destination}, they have {order.seat_number}{" "}
                                seats available!{" "}
                                <br/>
                                <button class="scooter" onClick={() => handleAddRider(order.order_id)}>
                                    Catch a Ride
                                </button>
                            </div>
                        </dd>
                    ))}
                </ul>
            )}
            <button class="submitbtn"onClick={() => navigate("/")}>Home</button>
        </div>
    );
};

export default RequestARide;
