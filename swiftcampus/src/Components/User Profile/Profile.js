


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import Settings from "../Settings/Settings";
import CarPhotoGallery from "./CarPhotoGallary";
import alucardwalking from "../alucardwalking.gif";

const ProfilePage = () => {
  const [pastride, setPastRide] = useState([]);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [selectedImage, setSelectedImage] = useState("default.png");
  const navigate = useNavigate(); 
  const [carImages, setCarImages] = useState([]);
  const username = localStorage.getItem("username");

  const isPremade = selectedImage?.startsWith("profile") || selectedImage === "default.png";
  const profileImageSrc = isPremade
    ? `/images/${selectedImage}`
    : `${process.env.REACT_APP_BACKEND}/uploads/${selectedImage}`;
  


  // Load user data & saved profile image
  useEffect(() => {
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
    fetch(`${process.env.REACT_APP_BACKEND}/latest-profile/${username}`)
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
  


      useEffect(() => {
        const fetchData = async () => {
          setIsLoading(true);
          try {
              const pastRide = await fetch(`${process.env.REACT_APP_BACKEND}/PastRide?param1=${username}`);
              const data = await pastRide.json();
              console.log("Data:" + data)
              setPastRide(data);
          } catch (error) {
             console.error('Error fetching users:', error);
             setIsError(true)
          } finally {setIsLoading(false)}
        };
        fetchData();
      }, []);

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
          <div style={{maxHeight: 600, overflow: 'auto'}}>
            <h3>Your Ride History</h3>
            {isError && <div>An error has occured!</div>}
            {isLoading && <div> <img src={alucardwalking} alt="loading..." /><br></br>Loading...</div>}
            {!isLoading && (<ul>
            {pastride.map(ride => (
              <li key = {ride.order_id}>
                <p> Your driver was {ride.username_drivers}<br></br>
                You were picked up at : {ride.origin} in {ride.town == "" ? (<>(Town was not saved / Didn't exist at the time)</>) : (ride.town)} at {ride.time}<br></br>
                You went to : {ride.destination}<br></br>
                Other Riders:<br></br>
                            {(ride.Rider1 == null || ride.Rider1 == username) && 
                             (ride.Rider2 == null || ride.Rider2 == username) &&
                             (ride.Rider3 == null || ride.Rider3 == username) &&
                             (ride.Rider4 == null || ride.Rider4 == username) && 
                             (ride.Rider5 == null || ride.Rider5 == username) && 
                             (ride.Rider6 == null || ride.Rider6 == username) && 
                             (<p>There were no other passengers</p>)}
                            {ride.Rider1 != null && ride.Rider1 != username && ride.Rider1}
                            {ride.Rider2 != null && ride.Rider2 != username && ride.Rider2}
                            {ride.Rider3 != null && ride.Rider3 != username && ride.Rider3}
                            {ride.Rider4 != null && ride.Rider4 != username && ride.Rider4}
                            {ride.Rider5 != null && ride.Rider5 != username && ride.Rider5}
                            {ride.Rider6 != null && ride.Rider6 != username && ride.Rider6}
                </p>
                <hr/>
              </li>
            ))}</ul>)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
