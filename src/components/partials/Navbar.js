import React, { useState } from "react";
import "./Sidebar.css";
import { Link } from "react-router-dom";

const Sidebar = ({ onSearch }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false); // Track search bar visibility
    const [searchQuery, setSearchQuery] = useState("");

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const toggleSearchBar = () => {
        setIsSearchOpen(!isSearchOpen); // Toggle search bar visibility
    };

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        onSearch(query); // Pass the search query to the parent (Home)
    };

    const menuItems = [
        { name: "Home", icon: "🏠", path: "/" },
        { name: "Models", icon: "👩‍🦰", path: "/Pornstars" },
        { name: "Indians", icon: "👧🏼", path: "/indian" },
        { name: "Muslim", icon: "👩‍🦳🎀", path: "/muslim" },
        { name: "Top Videos", icon: "🎬🔥", path: "/top-videos" },
        { name: "New Content", icon: "🆕📹", path: "/new-content" },
        { name: "Most Liked", icon: "❤️👍", path: "/most-liked" },
        { name: "Our Network", icon: "🔗", path: "/our-network" },

    ];

    return (
        <div className="navbar-container">
            {/* Top Navbar */}
            <div className="top-navbar">
                <div className="left-section">
                    {/* Toggle Button */}
                    <button className="toggle-button" onClick={toggleSidebar}>
                        {isOpen ? "✖" : "☰"}
                    </button>
                    {/* Logo */}
                    <Link style={{ textDecoration: "none" }} to="/">
                        <h2 className="logo">VipMilfNut</h2>
                    </Link>
                   
                </div>
              
                 <span className="icon profile-icon">
      <a
        href="https://t.ancdu.link/378191/3785/0?bo=2753,2754,2755,2756&po=6456&aff_sub5=banner1"
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        style={{
          display: 'block',
          maxWidth: '100%',
          margin: '20px auto',
          textAlign: 'center',
        }}
      >
       
      </a>
    </span>
                <div className="right-section">
                    {/* Search Icon (Only visible on mobile) */}
                    <span className="icon search-icon" onClick={toggleSearchBar}>🔍</span>
                    {/* Search Bar (Visible when `isSearchOpen` is true) */}
                    <input
                        type="text"
                        className={`search-bar ${isSearchOpen ? "visible" : ""}`}
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                    {/* Profile Icon */}
                    
                    
                   

                </div>
            </div>

            {/* Sidebar */}
            <div className={`sidebar ${isOpen ? "open" : ""}`}>
                {/* Cross Icon inside Sidebar */}
                {isOpen && (
                    <button className="close-button" onClick={toggleSidebar}>✖</button>
                )}
                <ul className="menu">
                    {menuItems.map((item, index) => (
                        <li key={index} className="menu-item">
                            <Link
                                style={{ textDecoration: "none" }}
                                to={item.path}
                                className="menu-link"
                                onClick={toggleSidebar}
                            >
                                <span className="icon">{item.icon}</span>
                                <span className="text">{item.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
