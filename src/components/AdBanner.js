import React from "react";

const AdBanner = () => {
  const bannerStyle = {
    backgroundImage: "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('https://cdn77-pic.xnxx-cdn.com/videos/thumbs169xnxxposter/95/ea/2f/95ea2f599792468d7011d0f29a8d2c40/95ea2f599792468d7011d0f29a8d2c40.2.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "#fff",
    padding: "20px 10px",
    textAlign: "center",
    borderRadius: "8px",
    margin: "20px auto",
    maxWidth: "95%",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
  };

  const overlayStyle = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: "15px",
    textAlign: "left",
    backgroundColor: "transparent",
    padding: "15px",
    borderRadius: "8px",
  };

  const buttonStyle = {
    background: "#ffffff",
    color: "#ff4b2b",
    border: "none",
    padding: "10px 24px",
    fontSize: "16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "all 0.3s ease",
  };

  const handleMouseOver = (e) => {
    e.target.style.background = "#ffe6e0";
  };

  const handleMouseOut = (e) => {
    e.target.style.background = "#ffffff";
  };

  return (
    <div style={bannerStyle}>
      <div style={overlayStyle}>
        {/* Background image applied via CSS */}
        <div>
          <h2 style={{margin:"0 0 6px",fontSize:"22px",lineHeight:"1.3",textShadow:"0 1px 3px rgba(0,0,0,0.8)"}}>
            Earn ₹2,000 – 3,000 daily by uploading videos on VipMilfNut
          </h2>
          <p style={{margin:"0 0 12px",fontSize:"16px",textShadow:"0 1px 3px rgba(0,0,0,0.8)"}}>
            We are hiring – start earning today!
          </p>
        </div>
      </div>
      <a
        href="https://docs.google.com/forms/d/e/1FAIpQLSdAEiNguaxkyQoW88ABhS0ggUu1hAYHQSxFxZPlIrnWn4lCLw/viewform"
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
      >
        <button
          style={buttonStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          Apply Now
        </button>
      </a>
    </div>
  );
};

export default AdBanner;
