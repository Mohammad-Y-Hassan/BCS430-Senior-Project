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
        const cacheusername = localStorage.getItem("username");
        const username_riders = {cacheusername}
        console.log(username_riders)
        setIsLoading(true);
        try {
            const activeride = await fetch("http://localhost:5000/ActiveRide", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(username_riders),
            });
           const data = await activeride.json();
           console.log("Data:" + data)
           setActiveRide(data)
        } catch (error) {
           console.error('Error fetching users:', error);
           setIsError(true)
        } finally {setIsLoading(false)}
      };
      fetchData();
    }, []);

    console.log("Active Ride:" + activeride);
    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Active Ride</h2>

                    <div style={{ textAlign: "center", marginTop: "50px" }}>
                        <h2>Avaliable Rides</h2>
                        {isError && <div>An error has occured!</div>}
                        {isLoading && <div> <img src={Puzzlenobackground} alt="loading..." /><br></br>Loading...</div>}
                        {!isLoading && (            <ul>
                        {activeride.map(ride => (
                        <li key={ride.order_id}>
                        <p>{ride.username_drivers} is going to be at {ride.origin} at {ride.time}<br></br>
                        They are going to {ride.destination}, they have {ride.seat_number} seats avaliable <button>Catch a Ride</button></p>
                        </li>
                        ))}
                        </ul>)}
                        <button onClick={() => navigate("/")}>Home</button>
                    </div>
        </div>
        
    );
};

export default ActiveRide;