


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import Settings from "../Settings/Settings";
import CarPhotoGallery from "./CarPhotoGallary";

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [selectedImage, setSelectedImage] = useState("default.png");
  const navigate = useNavigate(); 
  const [carImages, setCarImages] = useState([]);

  const isPremade = selectedImage?.startsWith("profile") || selectedImage === "default.png";
  const profileImageSrc = isPremade
    ? `/images/${selectedImage}`
    : `http://localhost:5000/uploads/${selectedImage}`;
  


  // Load user data & saved profile image
  useEffect(() => {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");
  
    fetch(`http://localhost:5000/car-photos/${username}`)
      .then(res => res.json())
      .then(data => {
        const fullPaths = data.photos.map(filename => `http://localhost:5000/uploads/${filename}`);
        setCarImages(fullPaths);
      });


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
  

  const handleCarImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("carImage", file);
    formData.append("username", localStorage.getItem("username"));

    try {
      const res = await fetch("http://localhost:5000/upload-car-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
    } catch (err) {
      console.error("Failed to upload car image:", err);
    }
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
        <CarPhotoGallery username={userData?.username} />



          <div className="vehicle-info-box">
            <h3>Vehicle Information</h3>
            <p><strong>Make:</strong> Toyota</p>
            <p><strong>Model:</strong> Camry</p>
            <p><strong>Color:</strong> White</p>
            <p><strong>Type:</strong> Sedan</p>
            <p><strong>Seats:</strong> 5</p>
            <button className="add-car">Add Car</button>
            <button className="edit-vehicle">Edit Vehicle Info</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
