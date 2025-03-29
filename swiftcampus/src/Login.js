import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [isSuccess, setIsSuccess] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            setMessage(data.message);
            setIsSuccess(response.ok);

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
        } catch (error) {
            setIsSuccess(false);
            setMessage("Server error. Please try again later.");
        }
    };

    return (
        <div>
            <h2 className="headerfont">Login to Your Account</h2>
            <div className="blockstyle">
                <form onSubmit={handleLogin}>
                    <label htmlFor="username" className="fieldlabel"> Username <br /></label>
                    <input className="inputfieldlogin" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
                    <br />
                    <label htmlFor="password" className="fieldlabel"> Password <br /></label>
                    <input className="inputfieldlogin" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <br />
                    <button className="submitbtn" type="submit">Sign In</button>
                </form>
                {message && <p style={{ color: isSuccess ? "green" : "red" }}>{message}</p>}

                {/* ➕ Green Button for Driver Login */}
                <div style={{ marginTop: "20px" }}>
                    <Link to="/driver-login">
                        <button style={{ backgroundColor: "green", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px" }}>
                            Driver Log in
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
