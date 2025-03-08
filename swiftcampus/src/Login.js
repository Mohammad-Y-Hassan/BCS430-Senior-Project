import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(null); // ✅ New state for success/fail color
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
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
        <div>
            <h2 class="headerfont">Login to Your Account</h2>
            <div class="blockstyle">
            <form onSubmit={handleLogin}>
                
                <label for="username" class="fieldlabel"> Username <br /></label>
                <input className="inputfieldlogin" type="text" placeholder="" value={username} onChange={(e) => setUsername(e.target.value)} required />
                <br />
                <label for="password" class="fieldlabel"> Password <br /></label>
                <input className="inputfieldlogin" type="password" placeholder="" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <br />
                <button className="submitbtn" type="submit">Sign In</button>
            </form>
            {message && <p style={{ color: isSuccess ? "green" : "red" }}>{message}</p>}
            </div>
        </div>
    );
};

export default Login;
