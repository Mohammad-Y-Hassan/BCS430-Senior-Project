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
    const [isSuccess, setIsSuccess] = useState(null);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setMessage("");

        const userData = { firstname, lastname, username, email, password, gender };

        try {
            const response = await fetch("http://localhost:5000/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                setIsSuccess(false);
                setMessage(data.error || "Signup failed. Please try again.");
                return;
            }

            // ✅ Store User Data & Redirect to Profile
            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
            localStorage.setItem("firstname", data.firstname);
            localStorage.setItem("lastname", data.lastname);
            localStorage.setItem("email", data.email);
            localStorage.setItem("gender", data.gender);

            window.dispatchEvent(new Event("storage"));
            navigate("/profile");

        } catch (error) {
            setIsSuccess(false);
            setMessage("Server error. Please try again later.");
        }
    };

    return (
        <div style={{ textAlign: "center" }}>
            <h2 className="headerfont">Create a New Account!</h2>
            <div className="blockstyle">
                <form onSubmit={handleSignup}>
                    <label className="fieldlabel"> First Name <br /></label>
                    <input className="inputfieldsignup" type="text" onChange={(e) => setFirstname(e.target.value)} required />
                    <br />
                    <label className="fieldlabel"> Last Name <br /></label>
                    <input className="inputfieldsignup" type="text" onChange={(e) => setLastname(e.target.value)} required />
                    <br />
                    <label className="fieldlabel"> Username <br /></label>
                    <input className="inputfieldsignup" type="text" onChange={(e) => setUsername(e.target.value)} required />
                    <br />
                    <label className="fieldlabel"> Email <br /></label>
                    <input className="inputfieldsignup" type="email" onChange={(e) => setEmail(e.target.value)} required />
                    <br />
                    <label className="fieldlabel"> Password <br /></label>
                    <input className="inputfieldsignup" type="password" onChange={(e) => setPassword(e.target.value)} required />
                    <br />
                    <select className="genderselect" onChange={(e) => setGender(e.target.value)} required>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                    <br />
                    <button className="submitbtn" type="submit">Sign Up</button>
                </form>
                {message && <p style={{ color: isSuccess ? "green" : "red" }}>{message}</p>}
            </div>
        </div>
    );
};

export default Signup;
