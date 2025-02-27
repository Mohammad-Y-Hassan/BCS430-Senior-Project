import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        setMessage(data.message);

        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
            localStorage.setItem("firstname", data.firstname);
            localStorage.setItem("lastname", data.lastname);
            navigate("/profile");
        }
    };

    return (
        <div style={{marginTop: "50px" }}>
            <div className= "divider"></div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <input className = "inputfield" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <br />
                <input className = "inputfield" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <br />
                <button className="submit" type="submit">Login</button>
            </form>
            {message && <p>{message}</p>}

        </div>
    );
};

export default Login;
