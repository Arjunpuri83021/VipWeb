import React from "react";
import { MessageSquare } from "lucide-react";
import "./SmartLinkBanner.css";

const SmartLinkBanner = () => {
  // List of background GIF URLs
  const gifList = [
    "https://live.sexviacam.com/images/18.gif",
    "https://myteenwebcam.com/fapp/gifs/1685b3f8b66924ec56f128e83cabd783.gif",
    "https://voyeur-house.tv/blog/wp-content/uploads/2019/07/Katrin-Hitklif-evening-sexJuly-22.gif",
    "https://voyeur-house.tv/blog/wp-content/uploads/2019/05/Domi-daniel-midnight-fuck-may-1.gif",
  ];

  // Pick a random one
  const randomGif = gifList[Math.floor(Math.random() * gifList.length)];

  const handleClick = () => {
    window.location.href =
      "https://www.profitableratecpm.com/v6ep6sk0?key=66b6449af77be42c6ffdcfdb989ebe74";
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: "relative",
        backgroundImage: `url('${randomGif}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "90%",
        height: "230px",
        margin: "auto",
        borderRadius: "8px",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      {/* LIVE badge - top left */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          backgroundColor: "red",
          color: "white",
          fontSize: "12px",
          fontWeight: "bold",
          padding: "2px 6px",
          borderRadius: "4px",
        }}
      >
        LIVE
      </div>

      {/* Username - bottom left */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          
          color: "white",
          fontSize: "14px",
          fontWeight: "bold",
          padding: "4px 8px",
          borderRadius: "4px",
        }}
      >
        amber_tonny25 🔞
      </div>

      {/* Chat now button - bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          backgroundColor: "#dc2626",
          color: "white",
          fontSize: "12px",
          fontWeight: "500",
          padding: "4px 10px",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <MessageSquare size={14} />
        It’s FREE now 🔥
      </div>
    </div>
  );
};

export default SmartLinkBanner;
