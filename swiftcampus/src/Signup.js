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
            <h2 class="headerfont">Create a New Account!</h2>
            <div class="blockstyle">
            <form onSubmit={handleSignup}>
                <label class="fieldlabel"> First Name <br /></label>
                <input class="inputfieldsignup" type="text" placeholder="" onChange={(e) => setFirstname(e.target.value)} required />
                <br/>
                <label class="fieldlabel"> Last Name <br /></label>
                <input class="inputfieldsignup" type="text" placeholder="" onChange={(e) => setLastname(e.target.value)} required />
                <br/>
                <label class="fieldlabel"> Username <br /></label>
                <input class="inputfieldsignup" type="text" placeholder="" onChange={(e) => setUsername(e.target.value)} required />
                <br/>
                <label class="fieldlabel"> Email <br /></label>
                <input class="inputfieldsignup" type="email" placeholder="" onChange={(e) => setEmail(e.target.value)} required />
                <br/>
                <label class="fieldlabel"> Password <br /></label>
                <input class="inputfieldsignup" type="password" placeholder="" onChange={(e) => setPassword(e.target.value)} required />
                <br/>
                <select class="genderselect" onChange={(e) => setGender(e.target.value)} required>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                </select>
                <br/>
                <button class="submitbtn" type="submit">Sign Up</button>
            </form>
            {message && <p style={{ color: isSuccess ? "green" : "red" }}>{message}</p>}
            </div>
        </div>
    );
};

export default Signup;
