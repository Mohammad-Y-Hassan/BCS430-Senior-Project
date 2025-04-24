import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ isAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [userType, setUserType] = useState(localStorage.getItem("userType"));
  const [username, setUsername] = useState(
    localStorage.getItem("userType") === "driver"
      ? localStorage.getItem("driverUsername")
      : localStorage.getItem("username")
  );

  const [profileImageSrc, setProfileImageSrc] = useState("/images/default.png");

  const updateProfileImage = () => {
    if (!username) return;

    const storedImage = localStorage.getItem(`profileImage_${username}`);
    if (storedImage) {
      const isPremade = storedImage.startsWith("profile") || storedImage === "default.png";
      const src = isPremade
        ? `/images/${storedImage}`
        : `http://localhost:5000/uploads/${storedImage}`;
      setProfileImageSrc(src);
    } else {
      setProfileImageSrc("/images/default.png");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  useEffect(() => {
    // update everything when localStorage changes
    const handleStorageChange = () => {
      const newUserType = localStorage.getItem("userType");
      const newUsername =
        newUserType === "driver"
          ? localStorage.getItem("driverUsername")
          : localStorage.getItem("username");

      setUserType(newUserType);
      setUsername(newUsername);
      updateProfileImage();
    };

    handleStorageChange(); // initial load
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [isAuthenticated]);

  console.log("Navbar Debug → token:", localStorage.getItem("token"));
  console.log("Navbar Debug → driverToken:", localStorage.getItem("driverToken"));
  console.log("Navbar Debug → userType:", localStorage.getItem("userType"));
  

  return (
    <div className="navbar">
      <div className="left-nav">
        <Link to={userType === "driver" ? "/driver-home" : "/"}>Swift Campus</Link>
      </div>

      <div className="right-nav">
        {isAuthenticated ? (
          <>
            {userType === "rider" && (
              <>
                <Link to="/profile">
                  <img src={profileImageSrc} alt="Profile" className="profile-image" />
                </Link>
                <button onClick={handleLogout} className="logout-btn">Log Out</button>
              </>
            )}
            {userType === "driver" && (
              <>
                <Link to="/driver-profile">
                  <img src={profileImageSrc} alt="Driver Profile" className="profile-image" />
                </Link>
                <button onClick={handleLogout} className="logout-btn">Log Out</button>
              </>
            )}
          </>
        ) : (
          <>
            <Link to="/login" className={location.pathname === "/login" ? "active" : ""}>
              Login/Sign Up
            </Link>
            <Link to="/driver-signup" className={location.pathname === "/driver-signup" ? "active" : ""}>
              Become a Driver
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
