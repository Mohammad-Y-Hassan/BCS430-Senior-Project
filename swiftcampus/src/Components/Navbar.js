
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

  return (
    <div className="navbar">
      <div className="left-nav">
        <Link to="/" className={location.pathname === "/" ? "active" : ""}>
          Swift Campus
        </Link>
      </div>

      <div className="right-nav">
        {isAuthenticated ? (
          <>
            <Link
              to="/fromcampus"
              className={location.pathname === "/fromcampus" ? "active" : ""}
            >
              From Campus
            </Link>
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
        )}
      </div>
    </div>
  );
};

export default Navbar;
