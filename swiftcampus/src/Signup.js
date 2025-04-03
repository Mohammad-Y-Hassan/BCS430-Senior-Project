import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
    const [userData, setUserData] = useState({});
    const [otp, setOtp] = useState("");
    const [message, setMessage] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setMessage("");

        const formData = new FormData(e.target);
        const userData = Object.fromEntries(formData.entries());

        if (!userData.email.endsWith("@farmingdale.edu")) {
            setMessage("Only Farmingdale.edu emails are allowed.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.error || "Signup failed. Please try again.");
                return;
            }

            setMessage("OTP sent to email. Please verify.");
            setUserData(userData);
            setIsVerifying(true);
        } catch (error) {
            setMessage("Server error. Please try again later.");
        }
    };

    const handleVerifyOTP = async () => {
        try {
            const response = await fetch("http://localhost:5000/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...userData, otp }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.error || "Invalid OTP. Please try again.");
                return;
            }

            localStorage.setItem("token", data.token);
            localStorage.setItem("username", data.username);
            localStorage.setItem("firstname", data.firstname);
            localStorage.setItem("lastname", data.lastname);
            localStorage.setItem("email", data.email);
            localStorage.setItem("gender", data.gender);

            window.dispatchEvent(new Event("storage"));
            navigate("/profile");
        } catch (error) {
            setMessage("Server error. Please try again.");
        }
    };

    return (
        <div style={{ textAlign: "center" }}>
            <h2 className="headerfont">Create a New Account!</h2>
            <div className="blockstyle">
                {!isVerifying ? (
                    <form onSubmit={handleSignup}>
                        <label className="fieldlabel"> First Name <br /></label>
                        <input className="inputfieldsignup" name="firstname" type="text" required />
                        <br />
                        <label className="fieldlabel"> Last Name <br /></label>
                        <input className="inputfieldsignup" name="lastname" type="text" required />
                        <br />
                        <label className="fieldlabel"> Username <br /></label>
                        <input className="inputfieldsignup" name="username" type="text" required />
                        <br />
                        <label className="fieldlabel"> Email <br /></label>
                        <input className="inputfieldsignup" name="email" type="email" required />
                        <br />
                        <label className="fieldlabel"> Password <br /></label>
                        <input className="inputfieldsignup" name="password" type="password" required />
                        <br />
                        <select className="genderselect" name="gender" required>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                        <br />
                        <button className="submitbtn" type="submit">Sign Up</button>
                    </form>
                ) : (
                    <div>
                        <p>Enter OTP sent to your email:</p>
                        <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                        <button onClick={handleVerifyOTP}>Verify OTP</button>
                    </div>
                )}
                {message && <p style={{ color: isVerifying ? "green" : "red" }}>{message}</p>}

                {/* ➕ Green Button for Driver Sign Up */}
                <div style={{ marginTop: "20px" }}>
                    <Link to="/driver-signup">
                        <button style={{ backgroundColor: "green", color: "white", padding: "10px 20px", border: "none", borderRadius: "5px" }}>
                            Go to Driver Sign up
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
