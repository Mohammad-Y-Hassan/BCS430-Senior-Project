import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-left">
        <img
          src="/logolarge2.png" // Replace with your actual logo path if different
          alt="Swift Campus Logo"
          className="footer-logo"
        />
        <span className="footer-brand">Swift Campus</span>
      </div>

      <div className="footer-links">
        <Link to="/team">Developers / Team</Link>
        <Link to="/about">About Us</Link>
      </div>
    </footer>
  );
};

export default Footer;
