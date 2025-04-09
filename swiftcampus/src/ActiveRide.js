import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Puzzlenobackground from "../src/Puzzlenobackground.gif";

const ActiveRide = () => {
    const navigate = useNavigate();

    const [activeride, setActiveRide] = useState([]);
    const [isLoading, setIsLoading] = useState(false)
    const [isError, setIsError] = useState(false)

    useEffect(() => {
      const fetchData = async () => {
        const username_riders = localStorage.getItem("username");
        console.log(username_riders)
        setIsLoading(true);
        try {
            const activeride = await fetch(`http://localhost:5000/ActiveRide?param1=${username_riders}`);
            const data = await activeride.json();
            console.log("Data:" + data)
            setActiveRide(data);
        } catch (error) {
           console.error('Error fetching users:', error);
           setIsError(true)
        } finally {setIsLoading(false)}
      };
      fetchData();
    }, []);

    const handleCompleteRide = async () => {
        const username_riders = localStorage.getItem("username");
        const userToUpdate = { username_riders};
        try {
            const creatingOrder = await fetch("http://localhost:5000/CompleteRide", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userToUpdate),
            });
            const data = await creatingOrder.json();
            if (creatingOrder.ok) {
                console.log("Order Made successfully");
                localStorage.removeItem("ActiveRide")
                navigate("/");
            } else {
                console.error("Failed to create order:", data.message);
            }
        } catch (error) {
            console.error("Server error:", error);
        }
    };

    console.log("Active Ride:" + activeride);
    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
                    <div style={{ textAlign: "center", marginTop: "50px" }}>
                        <h2>Active Ride</h2>
                        {isError && <div>An error has occured!</div>}
                        {isLoading && <div> <img src={Puzzlenobackground} alt="loading..." /><br></br>Loading...</div>}
                        {!isLoading && (            <ul>
                        {activeride.map(ride => (
                        <li key={ride.order_id}>
                        <p> Your Driver is : {ride.username_drivers}<br></br>
                            You will be picked up at : {ride.origin} at {ride.time}<br></br>
                            You are going to : {ride.destination}<br></br>
                            They have {ride.seat_number} seats avaliable<br></br>
                            <button onClick={() => handleCompleteRide()}>Complete Ride</button></p>
                        </li>
                        ))}
                        </ul>)}
                        <button onClick={() => navigate("/")}>Home</button>
                    </div>
        </div>
        
    );
};

export default ActiveRide;