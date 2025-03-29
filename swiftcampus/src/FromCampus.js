import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


const FromCampus = () => {

    const [message, setMessage] = useState("");
    const [seat_number, setSeat_Number] = useState("1");
    const [time, setTime] = useState("08:00");
    const [origin, setOrigin] = useState("Amityville");
    const [destination, setDestination] = useState("Campus Center");

    const [isSuccess, setIsSuccess] = useState(null); // ✅ New state for success/fail color
    const navigate = useNavigate();

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    

    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const hours = today.getHours();
    const minutes = today.getMinutes();
   
    const handleOrder = async (e) => {
    e.preventDefault();
    
    const Order_Date = mm + '/' + dd + '/' + yyyy// + '-' + hours + ':' + minutes
    const username_drivers = localStorage.getItem("username")
    console.log(Order_Date)
    console.log(username_drivers)
    console.log(seat_number)
    console.log(time)
    console.log(origin)
    console.log(destination)
    const userOrder = { Order_Date, username_drivers, seat_number, time, origin, destination};
    console.log( userOrder)
    try {
    const creatingorder = await fetch("http://localhost:5000/orderridetocampus", 
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
    <label>seat_number</label>
    <select value = {seat_number} onChange={(e) => setSeat_Number(e.target.value)} required>
            <option value = "1" >1</option>
            <option value = "2" >2</option>
            <option value = "3" >3</option>
            <option value = "4" >4</option>
            <option value = "5" >5</option>
            <option value = "6" >6</option>
        </select>
        <br></br>
        time
        <select value = {time} onChange={(e) => setTime(e.target.value)} required>
            <option value = "8:00AM" >8:00 AM</option>
            <option value = "9:00AM" >9:00 AM</option>
            <option value = "10:00AM" >10:00 AM</option>
            <option value = "11:00AM" >11:00 AM</option>
            <option value = "12:00PM" >12:00 PM</option>
            <option value = "1:00PM" >1:00 PM</option>

        </select>
        <br></br>
        origin
        <select value = {origin} onChange={(e) => setOrigin(e.target.value)} required>
            <option value = "Amityville" >Amityville</option>
        </select>
        <br></br>
        <label>destination</label>
        <select value = {destination}onChange={(e) => setDestination(e.target.value)} required>
            <option value = "Campus Center" >Campus Center</option>
            <option value = "Nold" >Nold</option>
        </select>
        <br></br>
        <button type = "submit">Make Order</button>
    </form>
    {message && <p style={{ color: isSuccess ? "green" : "red" }}>{message}</p>}
    </div>
  );
}

export default FromCampus;
