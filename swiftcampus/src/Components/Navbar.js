
// import React from "react";
// import { Link, useLocation } from "react-router-dom";
// import "./Navbar.css";

// const Navbar = ({ isAuthenticated }) => {
//   const location = useLocation();

//   const userImage = "https://eskipaper.com/images/goofy-wallpaper-1.jpg";

//   return (
//     <div className="navbar">
//       <div className="left-nav">
//         <Link to="/" className={location.pathname === "/" ? "active" : ""}>
//           Swift Campus
//         </Link>
//       </div>

//       <div className="right-nav">
//         {isAuthenticated ? (
//           <>
//             <Link
//               to="/fromcampus"
//               className={location.pathname === "/fromcampus" ? "active" : ""}
//             >
//               From Campus
//             </Link>
//             <Link to="/profile" className="profile-link">
//               <img
//                 src={userImage}
//                 alt="User Profile"
//                 className="profile-image"
//               />
//             </Link>
//           </>
//         ) : (
//           <>
//             <Link
//               to="/login"
//               className={location.pathname === "/login" ? "active" : ""}
//             >
//               Login
//             </Link>
//             <Link
//               to="/signup"
//               className={location.pathname === "/signup" ? "active" : ""}
//             >
//               Sign Up
//             </Link>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Navbar;

import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ isAuthenticated }) => {
  const location = useLocation();
  const [profileImageSrc, setProfileImageSrc] = useState("/images/default.png");
  const [isRider, setIsRider] = useState(null);
  const [isDriver, setIsDriver] = useState(null);

  useEffect(() => {
  if (localStorage.getItem("isRider") === true) {
    setIsRider(true)
    setIsDriver(false)
  }
  if (localStorage.getItem("isDriver") === true) {
    setIsRider(false)
    setIsDriver(true)
  }}, [Navbar])


  const updateProfileImage = () => {
    const image = localStorage.getItem("profileImage");
    if (image) {
      const isPremade = image.startsWith("profile") || image === "default.png";
      const src = isPremade
        ? `/images/${image}`
        : `http://localhost:5000/uploads/${image}`;
      setProfileImageSrc(src);
    }
  };

  useEffect(() => {
    updateProfileImage();

    const handleStorageChange = () => updateProfileImage();

    // 🔄 Listen to localStorage changes
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [isAuthenticated]);
  console.log("isDriver: " + localStorage.getItem("isDriver"))
  console.log("isRider: " + localStorage.getItem("isRider"))
  

  return (
    <div className="navbar">
      <div className="left-nav">
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>
          Swift Campus
        </Link>
      </div>

      <div className="right-nav">
      {  isRider === true ? (
        isAuthenticated ? (
          <>
            <Link to="/profile" className="profile-link">
              <img
                src={profileImageSrc}
                alt="User Profile"
                className="profile-image"
              />
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className={location.pathname === "/login" ? "active" : ""}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className={location.pathname === "/signup" ? "active" : ""}
            >
              Sign Up
            </Link>
          </>
        ) 
      ) : (
        isAuthenticated ? (
          <>
            <Link to="/profile" className="profile-link">
              <img
                src={profileImageSrc}
                alt="User Profile"
                className="profile-image"
              />
            </Link>
          </>
        ) : (
          <>
            <Link
              to="/driver-login"
              className={location.pathname === "/driver-login" ? "active" : ""}
            >
              Driver Login
            </Link>
            <Link
              to="/driver-signup"
              className={location.pathname === "/driver-signup" ? "active" : ""}
            >
              Driver Sign Up
            </Link>
          </>
        )
      )}
      </div>
    </div>
  );
};

export default Navbar;
