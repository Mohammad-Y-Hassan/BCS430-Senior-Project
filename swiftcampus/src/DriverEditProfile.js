import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Components/Modal";
import Settings from "./Components/Settings/Settings";
import "./Components/User Profile/Profile.css";

const DriverEditProfilePage = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("driverUsername");

  const [lastName, setLastName] = useState("");
  const [selectedImage, setSelectedImage] = useState("default.png"); 
  const [customProfileFile, setCustomProfileFile] = useState(null); // Selected file (not yet uploaded)
  const [previewUrl, setPreviewUrl] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userUploadedImages, setUserUploadedImages] = useState([]);
  const [useCustomUpload, setUseCustomUpload] = useState(false);
  const isPremade = selectedImage?.startsWith("profile") || selectedImage === "default.png";

  const profileImageSrc = previewUrl
    ? previewUrl
    : isPremade
      ? `/images/${selectedImage}`
      : `${process.env.REACT_APP_BACKEND}/uploads/${selectedImage}`;

    useEffect(() => {
    setLastName(localStorage.getItem("lastname") || "");

    // Fetch latest selected profile image
    fetch(`${process.env.REACT_APP_BACKEND}/latest-profile/${username}`)
        .then((res) => res.json())
        .then((data) => setSelectedImage(data.photo || "default.png"))
        .catch(() => setSelectedImage("default.png"));

    //Fetch all user uploaded profile images for the modal
    fetch(`${process.env.REACT_APP_BACKEND}/profile-images/${username}`)
        .then((res) => res.json())
        .then((data) => {
          const premadeNames = [
            "profile1.png",
            "profile2.png",
            "profile3.png",
            "profile4.png",
            "profile5.png",
            "profile6.jpg",
          ];
  
      const uniqueUserUploadedImages = Array.from(new Set(data.photos)).filter(
        (img) => !premadeNames.includes(img)
      );
  
      setUserUploadedImages(uniqueUserUploadedImages);
    })
    .catch((err) => {
      console.error("Failed to fetch user-uploaded profile images:", err);
    });
  
    }, [username]);

  const handleSelectImage = async (filename) => {
    // This is just for preview 
    setSelectedImage(filename);
    setCustomProfileFile(null);
    setPreviewUrl(null);
    setUseCustomUpload(false); // cancel the previous file upload
    setIsModalOpen(false);
  };


  const handleSave = async () => {
    try {
      let finalFilename = selectedImage;
  
      if (customProfileFile && previewUrl) {
        const formData = new FormData();
        formData.append("profileImage", customProfileFile);
        formData.append("username", username);
  
        const response = await fetch(`${process.env.REACT_APP_BACKEND}/upload-profile`, {
          method: "POST",
          body: formData,
        });
  
        const data = await response.json();
        finalFilename = data.filename;
  
      } else {
        await fetch(`${process.env.REACT_APP_BACKEND}/select-profile-image`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, filename: finalFilename }),
        });
      }
  
      // Save profile text info
      await fetch(`${process.env.REACT_APP_BACKEND}/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, lastname: lastName }),
      });
  
      localStorage.setItem("lastname", lastName);
      localStorage.setItem(`profileImage_${username}`, finalFilename);

      window.dispatchEvent(new Event("storage"));
  
      navigate("/driver-profile");
    } catch (err) {
      console.error("Failed to save profile changes:", err);
    }
  };
  
  
  const handleDeleteImage = async (filename) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this photo?");
    if (!confirmDelete) return;
  
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND}/delete-profile-image`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, filename }),
      });
  
      const result = await res.json();
      console.log("Deleted:", result.message);
  
      // Refresh uploaded images
      setUserUploadedImages((prev) => prev.filter((img) => img !== filename));
    } catch (err) {
      console.error("Failed to delete image:", err);
    }
  };
  
  
  

  const handleCancel = () => {
        setUseCustomUpload(false);
        setPreviewUrl(null);
        setCustomProfileFile(null);
        navigate("/driver-profile");
  };

  return (
    <div className="profile-container">
      <Settings />

      <div className="profile-main-layout">
        <div className="profile-card">
          <div className="profile-pic-container">
            <img
              src={profileImageSrc}
              alt="Profile"
              className="profile-pic"
              onClick={() => setIsModalOpen(true)}
              style={{ cursor: "pointer" }}
            />
            <small>Click image to choose from presets</small>
          </div>

          <div className="custom-profile-upload">
            <h4>Or upload your own profile picture</h4>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  setCustomProfileFile(file);
                  setPreviewUrl(URL.createObjectURL(file));
                  setUseCustomUpload(true); 
                }
              }}
            />
            <small>Image will be saved when you click Done.</small>
          </div>

          <div className="profile-info">
            <label>Last Name:</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>

          <div className="profile-buttons">
            <button onClick={handleSave}>Done</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal
            uploadedImages={userUploadedImages} // pure filenames
            premadeImages={[
                "profile1.png",
                "profile2.png",
                "profile3.png",
                "profile4.png",
                "profile5.png",
                "profile6.jpg",
            ]}
            onClose={() => setIsModalOpen(false)}
            onSelectImage={handleSelectImage}
            onDeleteImage={handleDeleteImage}
            />
      )}
    </div>
  );
};

export default DriverEditProfilePage;
