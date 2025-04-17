import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const DriverSignup = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    username: "",
    password: "",
    gender: "M",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/driver-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || "Signup failed.");
        return;
      }

      localStorage.setItem("driverUsername", data.username);
      // ✅ FIX: Set a dummy token after signup to allow accessing DriverHome
      localStorage.setItem("driverToken", "signed-up-driver-temp-token");

      setMessage("Driver signup successful!");
      navigate("/car-details");
    } catch (error) {
      console.error("Driver Signup Error:", error);
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <><div class="signup-card">
      <h2 class="titlefont">Driver Signup</h2>
      <div className="blockstyle">
        <form onSubmit={handleSubmit}>

          <label className="fieldlabel"> First Name <br /></label>
          <input className="inputfieldsignup" type="text" name="firstname" value={formData.firstname} onChange={handleChange} required />
          <br />
          <label className="fieldlabel"> Last Name <br /></label>
          <input className="inputfieldsignup" type="text" name="lastname" value={formData.lastname} onChange={handleChange} required />
          <br />
          <label className="fieldlabel">Email<br /></label>
          <input className="inputfieldsignup" type="email" name="email" value={formData.email} onChange={handleChange} required />
          <br />
          <label className="fieldlabel">Username (must match the part before '@' in your email):<br /></label>
          <input className="inputfieldsignup" type="text" name="username" value={formData.username} onChange={handleChange} required />
          <br />
          <label className="fieldlabel">Password<br /></label>
          <input className="inputfieldsignup" type="password" name="password" value={formData.password} onChange={handleChange} required />
          <br />
          <label>Gender:<br /></label>
          <select className="genderselect" name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
          <br />
          <button type="submit">Sign Up</button>
        </form>
        {message && (
          <p style={{ color: message.includes("successful") ? "green" : "red" }}>{message}</p>
        )}

        <div style={{ marginTop: "20px" }}>
          <Link to="/signup">
            <button style={{
              backgroundColor: "green",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "5px",
            }}>
              Go to User Signup
            </button>
          </Link>
        </div>
      </div>

    </div><div class="spacer"></div></>
  );
};

export default DriverSignup;
