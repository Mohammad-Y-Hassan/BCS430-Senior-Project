import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


const FromCampus = () => {

    const [message, setMessage] = useState("");
    const [location_id, setLocationID] = useState("10006");
    const [car_id, setCarID] = useState("4");
    const [isSuccess, setIsSuccess] = useState(null); // ✅ New state for success/fail color
    const navigate = useNavigate();


    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const hours = today.getHours();
    const minutes = today.getMinutes();
   
    const handleOrder = async (e) => {
    e.preventDefault();
    
    const Order_Date = mm + '/' + dd + '/' + yyyy + '-' + hours + ':' + minutes
    const username = localStorage.getItem("username")
    console.log(Order_Date)
    console.log(username)
    console.log(location_id)
    console.log(car_id)
    const userOrder = { Order_Date, username, location_id, car_id};
    console.log( userOrder)
    try {
    const creatingorder = await fetch("http://localhost:5000/orderridefromcampus", 
        {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userOrder)
        });

    const data = await creatingorder.json();
    setMessage(data.message);
    setIsSuccess(creatingorder.ok); // ✅ Store success/fail state
        if (creatingorder.ok) {
            console.log("Order Made successfully")
            navigate("/"); //Doesn't exist yet
        }
    } catch (error) {
    setIsSuccess(false);
    setMessage("Server error. Please try again later.");
    }  
}

// JUST FOR PRESENTATION
  return (
    <div style ={{textAlign: "center"}}>
    <h2>Ride From Campus</h2>
    <form onSubmit={handleOrder}>
    <label>Driver</label>
    <select value = {car_id} onChange={(e) => setCarID(e.target.value)} required>
            <option value = "4" >john Doe</option>
            <option value = "5" >jane Doe</option>
        </select>
        <br></br>
        <label>Go to location</label>
        <select value = {location_id}onChange={(e) => setLocationID(e.target.value)} required>
            <option value = "10006" >116 Briadhollow RD</option>
        </select>
        <br></br>
        <button type = "submit">Make Order</button>
    </form>
    {message && <p style={{ color: isSuccess ? "green" : "red" }}>{message}</p>}
    </div>
  );
}

export default FromCampus;