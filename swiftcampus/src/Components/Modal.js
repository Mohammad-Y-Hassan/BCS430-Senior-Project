import React from 'react';

const Modal = ({
  uploadedImages = [],
  premadeImages = [],
  onClose,
  onSelectImage,
  onDeleteImage
}) => {
  return (
    <div style={modalOverlayStyle}>
      <div style={modalStyle}>
        <h3>Select a Profile Picture</h3>

        {uploadedImages.length > 0 && (
          <>
            <p style={{ marginTop: 10, marginBottom: 5 }}>Your Uploads</p>
            <div style={imageGridStyle}>
              {uploadedImages.map((filename, index) => (
                <div style={{ position: 'relative' }} key={`uploaded-${index}`}>
                  <img
                    src={`http://localhost:5000/uploads/${filename}`}
                    alt={`Uploaded ${index + 1}`}
                    style={imageStyle}
                    onClick={() => onSelectImage(filename)}
                  />
                  <button
                    style={deleteButtonStyle}
                    onClick={(e) => {
                      e.stopPropagation(); // prevent selection when deleting
                      onDeleteImage(filename);
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <p style={{ marginTop: 20, marginBottom: 5 }}>Premade Avatars</p>
        <div style={imageGridStyle}>
          {premadeImages.map((image, index) => (
            <img
              key={`premade-${index}`}
              src={`/images/${image}`}
              alt={`Profile ${index + 1}`}
              style={imageStyle}
              onClick={() => onSelectImage(image)}
            />
          ))}
        </div>

        <button onClick={onClose} style={buttonStyle}>Close</button>
      </div>
    </div>
  );
};

// My inline kind of style
const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999,
};

const modalStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '10px',
  width: '320px',
  maxHeight: '80vh',        
  overflowY: 'auto',          
  textAlign: 'center',
};

const imageGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: '10px',
  marginBottom: '20px',
};

const imageStyle = {
  width: '80px',
  height: '80px',
  cursor: 'pointer',
  borderRadius: '10px',
};

const buttonStyle = {
  padding: '10px 20px',
  backgroundColor: '#007BFF',
  color: 'white',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

const deleteButtonStyle = {
  position: 'absolute',
  top: '-6px',
  right: '-6px',
  background: 'red',
  color: 'white',
  border: 'none',
  borderRadius: '50%',
  width: '20px',
  height: '20px',
  cursor: 'pointer',
  fontSize: '14px',
  lineHeight: '18px',
  textAlign: 'center',
  padding: 0
};

export default Modal;
