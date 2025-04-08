import React from "react";
import { Outlet } from "react-router-dom";
import Settings from "./Settings";
import "./Settings.css";

const SettingsLayout = () => {
  return (
    <div className="settings-layout">
      <Settings />
      <div className="settings-content">
        <Outlet />
      </div>
    </div>
  );
};

export default SettingsLayout;
