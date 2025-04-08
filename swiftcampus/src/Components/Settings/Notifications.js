import React from "react";
import { Link } from "react-router-dom";
import "./Notifications.css"; 

const Notification = () => {
  return (
    <div className="notification-container">
      <div className="notification-box">
        <h1 className="error-code">404</h1>
        <p className="headline">Oops! Notifications ran away.</p>
        <p className="subtext">
          There’s nothing to notify you about yet... or maybe they're hiding 
        </p>
        <Link to="/" className="home-link">
          Take Me Home
        </Link>
      </div>
    </div>
  );
};

export default Notification;
