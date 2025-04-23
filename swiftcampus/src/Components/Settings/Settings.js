import React from "react";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

const Settings = () => {
  const navigate = useNavigate();

  return (
    
    <div className="settings-sidebar">
      <h3>Settings</h3>
      <ul>
        <li onClick={() => navigate("/profile")}>Edit Profile</li>
        <li onClick={() => navigate("/settings/notifications")}>Notifications</li>
        <li onClick={() => navigate("/settings/privacy")}>Privacy</li>
        <li onClick={() => navigate("/settings/security")}>Security</li>
      </ul>
    </div>
  );
};

export default Settings;
