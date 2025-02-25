import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "./logo.svg";

const Signup = () => {
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();

        const userData = {
            firstname: firstname.trim(),
            lastname: lastname.trim(),
            username: username.trim(),
            email: email.trim(),
            password: password.trim()
        };

        const response = await fetch("http://localhost:5000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        setMessage(data.message);

        if (data.message === "User registered successfully!") {
            localStorage.setItem("firstname", userData.firstname);
            localStorage.setItem("lastname", userData.lastname);
            localStorage.setItem("username", userData.username);
            navigate("/profile"); // Redirect to Profile
        }
    };

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Sign Up</h2>
            <form onSubmit={handleSignup}>
                <input type="text" placeholder="First Name" value={firstname} onChange={(e) => setFirstname(e.target.value)} required />
                <br />
                <input type="text" placeholder="Last Name" value={lastname} onChange={(e) => setLastname(e.target.value)} required />
                <br />
                <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <br />
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <br />
                <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <br />
                <button type="submit">Sign Up</button>
            </form>
            {message && <p>{message}</p>}
            <img src={logo} alt="React Logo" style={{ width: "100px", marginTop: "20px" }} />
        </div>
    );
};

export default Signup;
