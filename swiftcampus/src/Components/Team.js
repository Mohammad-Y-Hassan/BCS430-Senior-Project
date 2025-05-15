import React from "react";

const Developers = () => {
  const devs = [
    {
      name: "Justin",
      img: "https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs/324896467/original/7c5ef8eff2b401fb1b82fbe5a4c112f5099a45ef/draw-a-pokemon-illustration-for-you.png",
    },
    {
      name: "Jordan",
      img: "https://pm1.aminoapps.com/6761/d63cf8f1a27519a70c9e5b86c45a5b2bb1fe8f85v2_hq.jpg",
    },
    {
      name: "Matthew",
      img: "https://i.imgur.com/WhgDW.png",
    },
    {
      name: "Mohammad",
      img: "https://i.pinimg.com/236x/b8/85/b8/b885b890a3db1ed568cac58fa714c66f.jpg",
    },
    {
      name: "Michael",
      img: "https://fiverr-res.cloudinary.com/images/t_main1,q_auto,f_auto,q_auto,f_auto/gigs2/214189718/original/49919eaf03041fde53492917cd557331b7c6364e/create-you-a-pokemon-profile-picture.png",
    },
  ];

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "40px auto",
        padding: "20px",
        textAlign: "center",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "30px" }}>
        Meet the Developers
      </h1>

      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        {devs.map((dev, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "#fff",
              borderRadius: "12px",
              padding: "16px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
              width: "150px",
              transition: "transform 0.3s",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.05)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            <img
              src={dev.img}
              alt={`${dev.name}'s avatar`}
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                objectFit: "cover",
                marginBottom: "10px",
              }}
            />
            <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
              {dev.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Developers;
