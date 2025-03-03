import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [gender, setGender] = useState("Male");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(null); // ✅ New state for success/fail color
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        const userData = { firstname, lastname, username, email, password, gender };

        const response = await fetch("http://localhost:5000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        setMessage(data.message);
        setIsSuccess(response.ok); // ✅ Store success/fail state

        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
            localStorage.setItem("firstname", data.firstname);
            localStorage.setItem("lastname", data.lastname);
            localStorage.setItem("email", data.email);
            localStorage.setItem("gender", data.gender);

            window.dispatchEvent(new Event("storage"));
            navigate("/profile");
        }
    };

    return (
        <div style={{ textAlign: "center" }}>
            <h2>Sign Up</h2>
            <form onSubmit={handleSignup}>
                <input type="text" placeholder="First Name" onChange={(e) => setFirstname(e.target.value)} required />
                <input type="text" placeholder="Last Name" onChange={(e) => setLastname(e.target.value)} required />
                <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} required />
                <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
                <select onChange={(e) => setGender(e.target.value)} required>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
                <button type="submit">Sign Up</button>
            </form>
            {message && <p style={{ color: isSuccess ? "green" : "red" }}>{message}</p>}
        </div>
    );
};

export default Signup;
