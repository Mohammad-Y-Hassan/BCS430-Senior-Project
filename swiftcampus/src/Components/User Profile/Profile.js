


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import Settings from "../Settings/Settings";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [selectedImage, setSelectedImage] = useState("default.png");
  const navigate = useNavigate(); 

  const isPremade = selectedImage?.startsWith("profile") || selectedImage === "default.png";
  const profileImageSrc = isPremade
    ? `/images/${selectedImage}`
    : `http://localhost:5000/uploads/${selectedImage}`;
  


  // Load user data & saved profile image
  useEffect(() => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");
  

    if (!token || !username) {
      navigate("/login");
      return;
    }
  
    setUserData({
      username,
      firstname: localStorage.getItem("firstname"),
      lastname: localStorage.getItem("lastname"),
      email: localStorage.getItem("email"),
      gender: localStorage.getItem("gender"),
    });
  
    // Fetch most recent profile image for this user
    fetch(`http://localhost:5000/latest-profile/${username}`)
      .then(res => res.json())
      .then(data => {
        const filename = data.photo || "default.png";
        setSelectedImage(filename);
      })
      .catch(err => {
        console.error("Failed to fetch profile image:", err);
        setSelectedImage("default.png");
      });
  }, [navigate]);
  
  

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };
  


  return (
    <div className="profile-container">
      <Settings />

      <div className="profile-main-layout">
        {/* Left side = Profile Card */}
        <div className="profile-card">
          <div className="profile-pic-container">
          <img
              src={profileImageSrc}
              alt="Profile"
              className="profile-pic"
            />

          </div>

          {userData ? (
            <div className="profile-info">
              <h2>
                {userData.firstname} {userData.lastname}
              </h2>
              <p><strong>Username:</strong> {userData.username}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Gender:</strong> {userData.gender}</p>
            </div>
          ) : (
            <p>Loading...</p>
          )}

          <div className="profile-buttons">
            <button onClick={handleLogout}>Logout</button>
            <button onClick={() => navigate("/profile/edit")}>Edit Profile</button>

          </div>
        </div>

        {/* Right side = Car image gallery + vehicle info */}
        <div className="profile-detail-column">
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
