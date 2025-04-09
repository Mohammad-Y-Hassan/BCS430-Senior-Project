import React from "react";

const Privacy = () => {
  return (
    <div className="settings-page">
      <h2>Privacy Settings</h2>
      <ul>
        <li>
          <label>
            <input type="checkbox" /> Show profile info to other users
          </label>
        </li>
        <li>
          <label>
            <input type="checkbox" /> Allow location access
          </label>
        </li>
        <li>
          <label>
            <input type="checkbox" /> Save search history
          </label>
        </li>
      </ul>
    </div>
  );
};

export default Privacy;
