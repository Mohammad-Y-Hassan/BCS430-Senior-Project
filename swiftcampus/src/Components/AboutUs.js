import React from "react";

const AboutUs = () => {
  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "20px",
        borderRadius: "12px",
        backgroundColor: "#f9f9f9",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "10px" }}>About Us</h1>
      <p style={{ fontSize: "1rem", color: "#333", marginBottom: "30px" }}>
        We are 5 random students who needed to do a class project.
      </p>
      <img
        src="https://maps.googleapis.com/maps/api/staticmap?center=Farmingdale+State+College&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7Clabel:%7CFarmingdale+State+College&key=AIzaSyB41v8HDC4z4OoRwIqFz-VyjnFW9Nx6SvQ"
        alt="Our project location at Farmingdale State College"
        style={{
          width: "100%",
          height: "auto",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        }}
      />
    </div>
  );
};

export default AboutUs;
