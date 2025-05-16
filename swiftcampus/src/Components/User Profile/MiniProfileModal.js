import React from "react";
import "./MiniProfileModal.css";

const MiniProfileModal = ({ driver, photos, onClose }) => {
  if (!driver) return null;

  const getProfileImage = () => {
    const file = driver?.profile_pic;
  
    const premadeImages = [
      "default.png",
      "profile1.png",
      "profile2.png",
      "profile3.png",
      "profile4.png",
      "profile5.png",
      "profile6.jpg"
    ];
  
    if (
      !file ||
      file === "null" ||
      file === "undefined" ||
      premadeImages.includes(file)
    ) {
      return `/images/${file || "default.png"}`; // fallback to default if empty
    }
  
    return `${process.env.REACT_APP_BACKEND}/uploads/${file}`;
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>   
        <img
          src={getProfileImage()}
          alt="Driver Profile"
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            objectFit: "cover",
            margin: "0 auto 10px",
            display: "block",
            border: "2px solid #ddd"
          }}
        />
        <h3 style={{ marginBottom: "10px" }}>
          {driver.firstname || "First"} {driver.lastname || "Last"}'s Profile
        </h3>
        <p><strong>Username:</strong> {driver.username}</p>

        {driver.car && driver.car.make ? (
          <div style={{ textAlign: "left", margin: "15px 0" }}>
            <h4>Car Info:</h4>
            <p><strong>Make & Model:</strong> {driver.car.year} {driver.car.make} {driver.car.model}</p>
            <p><strong>Type:</strong> {driver.car.car_type}</p>
            <p><strong>Color:</strong> {driver.car.color}</p>
            <p><strong>License Plate:</strong> {driver.car.License_plate}</p>
            <p><strong>Seats:</strong> {driver.car.seats}</p>
          </div>
        ) : (
          <p style={{ fontStyle: "italic", color: "gray" }}>
            Car info not available.
          </p>
        )}

        <div className="photo-gallery" style={{ marginTop: "15px", textAlign: "center" }}>
          {Array.isArray(photos) && photos.length > 0 ? (
            photos.map((photo, index) => (
              <img
                key={index}
                src={`${process.env.REACT_APP_BACKEND}/uploads/${photo}`}
                alt={`Car ${index}`}
                style={{
                  width: "100px",
                  margin: "5px",
                  borderRadius: "5px",
                  objectFit: "cover"
                }}
              />
            ))
          ) : (
            <>
              <img
                src="/images/no-car.jpeg"
                alt="No car uploaded"
                style={{
                  width: "120px",
                  margin: "10px auto",
                  borderRadius: "5px",
                  opacity: 0.4,
                  display: "block",
                  objectFit: "cover"
                }}
              />
              <p style={{ fontStyle: "italic", color: "gray", marginTop: "5px" }}>
                No car photos uploaded.
              </p>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: "20px",
            padding: "8px 16px",
            backgroundColor: "#dc3545",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default MiniProfileModal;
