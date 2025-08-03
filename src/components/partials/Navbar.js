import React, { useState, useEffect } from "react";
import "./Sidebar.css";
import { Link, useNavigate } from "react-router-dom";
import { IconButton, InputBase, Paper, Collapse, useMediaQuery, useTheme } from '@mui/material';
import { Search as SearchIcon, Close as CloseIcon } from '@mui/icons-material';

const apiUrl = process.env.REACT_APP_API_URL;

const Sidebar = ({ onSearch }) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Material UI responsive breakpoint
    
    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false); // Track search bar visibility
    const [searchQuery, setSearchQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [allTags, setAllTags] = useState([]);
    const [allStars, setAllStars] = useState([]);

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    const toggleSearchBar = () => {
        setIsSearchOpen(!isSearchOpen); // Toggle search bar visibility
    };

    // Fetch all tags and star names for suggestions
    useEffect(() => {
        const fetchSuggestionData = async () => {
            try {
                // Increase limit to get more records and catch more star names
            const response = await fetch(`${apiUrl}/getpostdata?page=1&limit=2000`, { mode: "cors" });
                if (!response.ok) return;
                const data = await response.json();
                const allRecords = data.records || [];
                
                // Extract unique tags
                const uniqueTags = new Set();
                const uniqueStars = new Set();
                
                allRecords.forEach(post => {
                    // Extract tags
                    if (Array.isArray(post.tags)) {
                        post.tags.forEach(tag => {
                            if (tag && tag.trim()) {
                                uniqueTags.add(tag.trim());
                            }
                        });
                    }
                    
                    // Extract star names
                    if (Array.isArray(post.name)) {
                        post.name.forEach(name => {
                            if (name && name.trim()) {
                                // Keep star names as stored in database (with hyphens)
                                // But also add cleaned version for better user experience
                                uniqueStars.add(name.trim());
                                // Also add cleaned version for display
                                const cleanName = name.replace(/-/g, ' ').trim();
                                uniqueStars.add(cleanName);
                            }
                        });
                    }
                });
                
                const tagsArray = Array.from(uniqueTags);
                const starsArray = Array.from(uniqueStars);
                
                setAllTags(tagsArray);
                setAllStars(starsArray);
                
                // Debug logging to see what we extracted
                console.log('🏷️ Total unique tags extracted:', tagsArray.length);
                console.log('⭐ Total unique stars extracted:', starsArray.length);
                console.log('🔍 Sample tags:', tagsArray.slice(0, 10));
                console.log('🔍 Sample stars:', starsArray.slice(0, 10));
                
                // Check specifically for "dani daniels" variations
                const daniVariations = starsArray.filter(star => 
                    star.toLowerCase().includes('dani')
                );
                console.log('🔎 Dani variations found:', daniVariations);
                
                // Check if "dani-daniels" exists
                const hasDaniDaniels = starsArray.some(star => 
                    star.toLowerCase().includes('dani') && star.toLowerCase().includes('daniel')
                );
                console.log('❓ Has Dani Daniels variations:', hasDaniDaniels);
            } catch (err) {
                console.error("Error fetching suggestion data:", err);
            }
        };
        
        fetchSuggestionData();
    }, []);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.length > 0) {
            // Filter suggestions from tags and star names
            const tagSuggestions = allTags.filter(tag => 
                tag.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5).map(tag => ({ text: tag, type: 'tag' }));
            
            const starSuggestions = allStars.filter(star => 
                star.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 5).map(star => ({ text: star, type: 'star' }));
            
            const combinedSuggestions = [...tagSuggestions, ...starSuggestions].slice(0, 8);
            setSuggestions(combinedSuggestions);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };
    
    // Helper function to convert dashes to spaces for display
    const displayText = (text) => {
        return text.replace(/-/g, ' ');
    };
    
    // Helper function to slugify text for URLs
    const slugifyText = (text) => {
        return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    };

    const handleSuggestionClick = (suggestion) => {
        console.log('🎯 Suggestion clicked:', suggestion);
        
        // Update search query
        setSearchQuery(suggestion.text);
        setShowSuggestions(false);
        
        // Close mobile search if open
        if (isMobile && isSearchOpen) {
            setIsSearchOpen(false);
        }
        
        // Check if the search query matches any tag or star name
        const isTagMatch = allTags.some(tag => 
            tag.toLowerCase() === suggestion.text.toLowerCase()
        );
        const isStarMatch = allStars.some(star => 
            star.toLowerCase() === suggestion.text.toLowerCase()
        );
        
        console.log('🔍 Search analysis:', {
            searchQuery: suggestion.text,
            isTagMatch,
            isStarMatch,
            suggestionType: suggestion.type
        });
        
        // Redirect to appropriate page based on suggestion type
        if (suggestion.type === 'tag' || isTagMatch) {
            const slugifiedTag = slugifyText(suggestion.text);
            console.log('🏷️ Redirecting to tag page:', `/tag/${slugifiedTag}`);
            navigate(`/tag/${slugifiedTag}`);
        } else if (suggestion.type === 'star' || isStarMatch) {
            const slugifiedStar = slugifyText(suggestion.text);
            console.log('⭐ Redirecting to star page:', `/pornstar/${slugifiedStar}`);
            navigate(`/pornstar/${slugifiedStar}`);
        } else {
            // Fallback: trigger search for non-tag/star suggestions
            console.log('🔍 Fallback: triggering title search');
            onSearch(`title:${suggestion.text}`);
        }
    };
    
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        
        console.log('📤 Form submitted with query:', searchQuery);
        
        // Check if the search query matches any tag or star name
        const isTagMatch = allTags.some(tag => 
            tag.toLowerCase() === searchQuery.toLowerCase()
        );
        const isStarMatch = allStars.some(star => 
            star.toLowerCase() === searchQuery.toLowerCase()
        );
        
        console.log('🔍 Search analysis:', {
            searchQuery,
            isTagMatch,
            isStarMatch,
            totalTags: allTags.length,
            totalStars: allStars.length
        });
        
        if (isTagMatch || isStarMatch) {
            // Search by tag/star name
            console.log('✅ Exact match found - searching by tag/star:', searchQuery);
            onSearch(searchQuery);
        } else {
            // Fallback: search by title
            console.log('⚠️ No exact match - falling back to title search:', `title:${searchQuery}`);
            onSearch(`title:${searchQuery}`);
        }
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
                    {/* Mobile Search Icon */}
                    {isMobile && (
                        <IconButton
                            onClick={toggleSearchBar}
                            sx={{ 
                                color: '#000',
                                '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                            }}
                        >
                            {isSearchOpen ? <CloseIcon /> : <SearchIcon />}
                        </IconButton>
                    )}
                    
                    {/* Search Bar Container */}
                    <div className="search-container" style={{ position: 'relative', flex: 1 }}>
                        {/* Desktop Search Bar - Always Visible */}
                        {!isMobile && (
                            <Paper
                                component="form"
                                onSubmit={handleSearchSubmit}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: 350,
                                    borderRadius: '25px',
                                    border: '1px solid #ddd',
                                    '&:hover': { borderColor: '#333' },
                                    '&:focus-within': { 
                                        borderColor: '#333',
                                        boxShadow: '0 0 0 2px rgba(51, 51, 51, 0.25)'
                                    }
                                }}
                                elevation={0}
                            >
                                <InputBase
                                    placeholder="Search here....."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    sx={{ 
                                        ml: 2, 
                                        flex: 1,
                                        fontSize: '16px'
                                    }}
                                />
                                <IconButton type="submit" sx={{ p: '10px' }}>
                                    <SearchIcon />
                                </IconButton>
                            </Paper>
                        )}
                        
                        {/* Mobile Search Bar - Full Width Overlay */}
                        {isMobile && isSearchOpen && (
                            <div
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    backgroundColor: 'white',
                                    zIndex: 9999,
                                    padding: '10px 15px',
                                    borderBottom: '1px solid #ddd',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}
                            >
                                <Paper
                                    component="form"
                                    onSubmit={handleSearchSubmit}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        borderRadius: '25px',
                                        border: '1px solid #ddd',
                                        backgroundColor: '#f8f9fa',
                                        '&:focus-within': { 
                                            borderColor: '#333',
                                            backgroundColor: 'white'
                                        }
                                    }}
                                    elevation={0}
                                >
                                    <IconButton 
                                        onClick={toggleSearchBar}
                                        sx={{ p: '10px', color: '#666' }}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                    <InputBase
                                        placeholder="Search here....."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                        sx={{ 
                                            flex: 1,
                                            fontSize: '16px',
                                            px: 1
                                        }}
                                        autoFocus
                                    />
                                    
                                </Paper>
                            </div>
                        )}
                        
                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="suggestions-dropdown" style={{
                                position: isMobile && isSearchOpen ? 'fixed' : 'absolute',
                                top: isMobile && isSearchOpen ? '60px' : '100%',
                                left: isMobile && isSearchOpen ? '15px' : '0',
                                right: isMobile && isSearchOpen ? '15px' : '0',
                                width: isMobile && isSearchOpen ? 'calc(100% - 30px)' : 'auto',
                                backgroundColor: 'white',
                                border: '1px solid #ddd',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                zIndex: isMobile && isSearchOpen ? 9998 : 1000,
                                maxHeight: '200px',
                                overflowY: 'auto'
                            }}>
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="suggestion-item"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        style={{
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            borderBottom: index < suggestions.length - 1 ? '1px solid #eee' : 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            fontSize: '14px'
                                        }}
                                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                                        onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                                    >
                                        {displayText(suggestion.text)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
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
