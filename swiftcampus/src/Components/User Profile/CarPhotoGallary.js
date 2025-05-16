import React, { useState, useEffect } from "react";
import "./CarPhotoGallary.css";

const CarPhotoGallery = ({ username }) => {
  const [carImages, setCarImages] = useState([]);
  const [pendingCarFile, setPendingCarFile] = useState(null);
  const [carPreviewUrl, setCarPreviewUrl] = useState(null);
  const [slideshowIndex, setSlideshowIndex] = useState(null);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND}/car-photos/${username}`)
      .then((res) => res.json())
      .then((data) => {
        const fullPaths = data.photos.map((filename) => ({
          url: `${process.env.REACT_APP_BACKEND}/uploads/${filename}`,
          filename,
        }));
        setCarImages(fullPaths);
      })
      .catch((err) => console.error("Failed to fetch car images:", err));
  }, [username]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPendingCarFile(file);
      setCarPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleConfirmUpload = async () => {
    if (!pendingCarFile) return;

    const formData = new FormData();
    formData.append("carImage", pendingCarFile);
    formData.append("username", username);

    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND}/upload-car-image`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const newUrl = `${process.env.REACT_APP_BACKEND}/uploads/${data.filename}`;

      setCarImages((prev) => [...prev, { url: newUrl, filename: data.filename }]);
      setPendingCarFile(null);
      setCarPreviewUrl(null);
    } catch (err) {
      console.error("Car photo upload failed:", err);
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm("Delete this photo?")) return;

    try {
      await fetch(`${process.env.REACT_APP_BACKEND}/delete-car-photo`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, filename }),
      });

      setCarImages((prev) => prev.filter((img) => img.filename !== filename));
      if (slideshowIndex !== null && carImages[slideshowIndex]?.filename === filename) {
        setSlideshowIndex(null);
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const prevImage = () => {
    setSlideshowIndex((prev) => (prev === 0 ? carImages.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setSlideshowIndex((prev) => (prev === carImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="image-upload-box">
      <h3>Uploaded Car Photos</h3>
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {carPreviewUrl && (
        <div style={{ marginTop: "10px" }}>
          <p>Preview:</p>
          <img src={carPreviewUrl} alt="Preview" className="uploaded-image" />
          <br />
          <button onClick={handleConfirmUpload}>Confirm Upload</button>
        </div>
      )}

      <div className="image-preview">
        {carImages.map(({ url, filename }, index) => (
          <div className="car-photo-wrapper" key={index}>
            <img
              src={url}
              alt={`Car ${index}`}
              className="uploaded-image"
              onClick={() => setSlideshowIndex(index)}
            />
            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(filename);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {slideshowIndex !== null && (
        <div className="modal-overlay" onClick={() => setSlideshowIndex(null)}>
          <div className="modal-image-container" onClick={(e) => e.stopPropagation()}>
            <button className="slideshow-arrow left" onClick={prevImage}>
              ‹
            </button>
            <img
              src={carImages[slideshowIndex].url}
              alt="Slide"
              className="modal-image"
            />
            <button className="slideshow-arrow right" onClick={nextImage}>
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarPhotoGallery;
