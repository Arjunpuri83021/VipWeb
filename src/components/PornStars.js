import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "./partials/Navbar";
import Slider from "./partials/Slider";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Footer from "./partials/Footer";
import PaginationComponent from './partials/PaginationComponent';

const apiUrl = process.env.REACT_APP_API_URL;

function PornStars() {
    const { page } = useParams(); // Get page from URL
    const currentPage = page ? Number(page) : 1; // Default to page 1
    const navigate = useNavigate();
    
    const [stars, setStars] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [setSelectedCategory] = useState(""); // For category selection
    const [starImages, setStarImages] = useState({}); // Store random images for each star
    const [selectedLetter, setSelectedLetter] = useState(""); // For A-Z filtering
    const [filteredStars, setFilteredStars] = useState([]); // Filtered stars based on letter
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    
    const itemsPerPage = 30;

    // Redirect to root URL if currentPage is 1
    useEffect(() => {
        if (currentPage === 1 && window.location.pathname !== '/pornstars') {
            navigate('/pornstars');  // Redirect to root URL
        }
    }, [currentPage, navigate]);

    useEffect(() => {
        if (isNaN(currentPage) || currentPage < 1) {
            navigate('/404', { replace: true });
        }
    }, [currentPage, navigate]);

    useEffect(() => {
        document.title = "VipMilfNut Adult Actress 3Pornstar 4K Pornstar Black Pornstars";

        const metaDesc = document.querySelector("meta[name='description']");
        if (metaDesc) {
            metaDesc.setAttribute("content", "a pornstar is born aaliyah love abby byens active pornstars black pornstars 3pornstar adult actress Hottest Pornstars Top Rated Pornstars in 4K Tube Pornstars");
        } else {
            const newMeta = document.createElement("meta");
            newMeta.name = "description";
            newMeta.content = "a pornstar is born aaliyah love abby byens active pornstars black pornstars 3pornstar adult actress Hottest Pornstars Top Rated Pornstars in 4K Tube Pornstars";
            document.head.appendChild(newMeta);
        }

        const canonicalLink = document.querySelector("link[rel='canonical']");
        if (!canonicalLink) {
            const newCanonical = document.createElement("link");
            newCanonical.rel = "canonical";
            newCanonical.href = "https://vipmilfnut.com/Pornstars";
            document.head.appendChild(newCanonical);
        }
    }, []);

    // Handle window resize for responsive grid
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Function to fetch all unique pornstars with pagination
    const fetchAllStars = async () => {
        try {
            console.log('Fetching stars for page:', currentPage);
            setLoading(true);
            setError(null);
            
            // Fetch all posts to extract unique pornstar names
            const response = await fetch(`${apiUrl}/getpostdata?page=1&limit=1000`, {
                mode: "cors"
            });
            
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            
            const data = await response.json();
            const allRecords = data.records || [];
            
            // Extract all unique pornstar names
            const uniqueNames = new Set();
            const nameMap = new Map(); // To store original case versions
            
            allRecords.forEach(post => {
                if (Array.isArray(post.name)) {
                    post.name.forEach(name => {
                        if (name && name.trim()) {
                            const trimmedName = name.trim();
                            const normalizedName = trimmedName.toLowerCase();
                            
                            if (!uniqueNames.has(normalizedName)) {
                                uniqueNames.add(normalizedName);
                                nameMap.set(normalizedName, trimmedName);
                            }
                        }
                    });
                }
            });
            
            // Convert to array and sort alphabetically
            let starsArray = Array.from(uniqueNames)
                .map(normalizedName => ({ name: nameMap.get(normalizedName) }))
                .sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
            
            // Apply letter filter if selected
            if (selectedLetter) {
                starsArray = starsArray.filter(star => 
                    star.name.toLowerCase().startsWith(selectedLetter.toLowerCase())
                );
                console.log(`Filtered ${starsArray.length} stars starting with '${selectedLetter}'`);
            }
            
            setFilteredStars(starsArray); // Store filtered results
            
            // Calculate pagination
            const totalStars = starsArray.length;
            const calculatedTotalPages = Math.ceil(totalStars / itemsPerPage);
            console.log('Total stars:', totalStars, 'Total pages:', calculatedTotalPages, 'Current page:', currentPage);
            setTotalPages(calculatedTotalPages);
            
            // Get stars for current page
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentPageStars = starsArray.slice(startIndex, endIndex);
            console.log('Stars for page', currentPage, ':', currentPageStars.length, 'stars');
            
            setStars(currentPageStars);
            
            // Fetch random images for current page stars
            await fetchStarImages(currentPageStars, allRecords);
            
        } catch (error) {
            console.error('Error in fetchAllStars:', error);
            setError(error.message);
            
        } finally {
            setLoading(false);
        }
    };
    
    // Function to fetch random images for pornstars
    const fetchStarImages = async (starsToFetch, allRecords = null) => {
        try {
            // Check localStorage for cached images
            const savedImagesData = localStorage.getItem('vipmilfnut_star_images');
            const now = Date.now();
            let existingImages = {};
            
            if (savedImagesData) {
                const { images, timestamp } = JSON.parse(savedImagesData);
                const timeDiff = now - timestamp;
                const tenMinutes = 10 * 60 * 1000;
                
                // If less than 10 minutes have passed, use saved images
                if (timeDiff < tenMinutes && images && Object.keys(images).length > 0) {
                    console.log('Using saved star images from localStorage');
                    existingImages = images;
                    
                    // Check if we have images for all current stars
                    const missingImages = starsToFetch.filter(star => !existingImages[star.name]);
                    
                    if (missingImages.length === 0) {
                        // All images are cached, use them
                        setStarImages(existingImages);
                        return;
                    } else {
                        console.log('Some images missing, fetching for:', missingImages.length, 'stars');
                        // Set existing images first to prevent blinking
                        setStarImages(existingImages);
                    }
                } else {
                    console.log('Cache expired or empty, fetching fresh images');
                }
            }
            
            // Fetch fresh data if not provided
            let records = allRecords;
            if (!records) {
                const response = await fetch(`${apiUrl}/getpostdata?page=1&limit=1000`, { mode: "cors" });
                if (!response.ok) return;
                const data = await response.json();
                records = data.records || [];
            }
            
            // Start with existing images to prevent blinking
            const imgMap = { ...existingImages };
            
            // Only fetch images for stars that don't have cached images
            const starsNeedingImages = starsToFetch.filter(star => !existingImages[star.name]);
            
            // For each star that needs an image, find a random image from their videos
            starsNeedingImages.forEach(star => {
                // Find all records that have this star name
                const starRecords = records.filter(record => 
                    Array.isArray(record.name) && 
                    record.name.some(name => 
                        name.toLowerCase().trim() === star.name.toLowerCase().trim()
                    )
                );
                
                // Filter records with valid images
                const validRecords = starRecords.filter(record => record.imageUrl);
                
                if (validRecords.length > 0) {
                    // Select random image
                    const randomIndex = Math.floor(Math.random() * validRecords.length);
                    imgMap[star.name] = validRecords[randomIndex].imageUrl;
                } else {
                    // Fallback to default image
                    imgMap[star.name] = 'female.png';
                }
            });
            
            // Save updated images to localStorage with timestamp
            localStorage.setItem('vipmilfnut_star_images', JSON.stringify({
                images: imgMap,
                timestamp: now
            }));
            
            setStarImages(imgMap);
            console.log(`Fetched random images for ${starsNeedingImages.length} new stars, total cached: ${Object.keys(imgMap).length}`);
            
        } catch (error) {
            console.error('Error fetching star images:', error);
        }
    };

    useEffect(() => {
        // Preload cached images before fetching stars to prevent blinking
        const savedImagesData = localStorage.getItem('vipmilfnut_star_images');
        if (savedImagesData) {
            try {
                const { images, timestamp } = JSON.parse(savedImagesData);
                const now = Date.now();
                const tenMinutes = 10 * 60 * 1000;
                const timeDiff = now - timestamp;
                
                // If cache is still valid, preload images
                if (timeDiff < tenMinutes && images && Object.keys(images).length > 0) {
                    console.log('Preloading cached images to prevent blinking');
                    setStarImages(images);
                }
            } catch (error) {
                console.error('Error preloading cached images:', error);
            }
        }
        
        fetchAllStars();
    }, [currentPage, search, selectedLetter]);

    // Handle page change for pagination
    const handlePageChange = (event, newPage) => {
        if (newPage === 1) {
            navigate('/pornstars');
        } else {
            navigate(`/pornstars/${newPage}`);
        }
    };

    // Handle letter filter
    const handleLetterFilter = (letter) => {
        setSelectedLetter(letter === selectedLetter ? "" : letter); // Toggle filter
        navigate('/pornstars'); // Reset to page 1 when filtering
    };

    // Generate A-Z buttons
    const generateAlphabetButtons = () => {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
        return alphabet.map(letter => (
            <button
                key={letter}
                onClick={() => handleLetterFilter(letter)}
                style={{
                    padding: '8px 12px',
                    margin: '2px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: selectedLetter === letter ? '#2c3e50' : '#fff',
                    color: selectedLetter === letter ? '#fff' : '#333',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                    if (selectedLetter !== letter) {
                        e.target.style.backgroundColor = '#f8f9fa';
                    }
                }}
                onMouseLeave={(e) => {
                    if (selectedLetter !== letter) {
                        e.target.style.backgroundColor = '#fff';
                    }
                }}
            >
                {letter}
            </button>
        ));
    };

    return (
        <>
            <Helmet>
                <title>VipMilfNut Adult Actress 3Pornstar 4K Pornstar Black Pornstars | VipMilfNut</title>
                <link rel="canonical" href="https://vipmilfnut.com/Pornstars" />
                <meta name="description" content="A list of top-rated adult actresses and pornstars, including black pornstars and 4K-rated performers." />
                <meta name="robots" content="index, follow" />
            </Helmet>

            <Sidebar onSearch={(query) => setSearch(query)} />
            <Slider onCategorySelect={(category) => setSelectedCategory(category)}/>

            <div style={{ width: "95%", margin: "auto" }}>
                <h1 style={{fontSize:"20px", textAlign:"center", marginBottom: "20px", color: "#333"}}>Adult Actress 3Pornstar and 4K Pornstar and Black Pornstars Videos</h1>
                
                {/* A-Z Filter */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '20px',
                    padding: '15px',
                    
                }}>
                    <h3 style={{
                        fontSize: '16px',
                        marginBottom: '10px',
                        color: '#333',
                        fontWeight: '600'
                    }}>Filter by First Letter:</h3>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: '5px'
                    }}>
                        <button
                            onClick={() => handleLetterFilter('')}
                            style={{
                                padding: '8px 12px',
                                margin: '2px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                backgroundColor: selectedLetter === '' ? '#2c3e50' : '#fff',
                                color: selectedLetter === '' ? '#fff' : '#333',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600'
                            }}
                        >
                            ALL
                        </button>
                        {generateAlphabetButtons()}
                    </div>
                    
                </div>
                
                {loading && <p>Loading...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
                <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: windowWidth <= 768 ? "repeat(2, 1fr)" : "repeat(auto-fit, minmax(180px, 1fr))", 
                    gap: windowWidth <= 480 ? "8px" : windowWidth <= 768 ? "10px" : "15px", 
                    padding: windowWidth <= 480 ? "10px 0" : "20px 0"
                }}>
                    {stars.length > 0 ? (
                        stars.map((star, index) => (
                            <Link 
                                to={`/pornstar/${star.name}`} 
                                key={index} 
                                style={{ 
                                    textAlign: "center", 
                                    textDecoration: "none", 
                                    color: "#444",
                                    backgroundColor: "#f8f9fa",
                                    borderRadius: "8px",
                                    padding: "15px",
                                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                                    border: "1px solid #e9ecef"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-5px)";
                                    e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                <img 
                                    style={{ 
                                        height: "150px", 
                                        width: "150px", 
                                        objectFit: "cover",
                                        borderRadius: "8px",
                                        marginBottom: "10px",
                                        border: "2px solid #dee2e6"
                                    }} 
                                    src={starImages[star.name] || 'female.png'} 
                                    alt={star.name}
                                    loading="lazy"
                                    onError={(e) => {
                                        console.log(`Image failed to load for ${star.name}, using fallback`);
                                        e.target.src = 'female.png';
                                    }}
                                    onLoad={() => {
                                        console.log(`Image loaded successfully for ${star.name}`);
                                    }}
                                />
                                <h2 style={{ 
                                    fontSize: "16px", 
                                    margin: "10px 0 5px 0", 
                                    fontWeight: "600",
                                    color: "#333"
                                }}>
                                    {star.name.replace(/-/g, ' ')}
                                </h2>
                                <p style={{
                                    fontSize: "12px",
                                    color: "#666",
                                    margin: 0
                                }}>
                                    Click to view videos
                                </p>
                            </Link>
                        ))
                    ) : (
                        !loading && <p style={{ textAlign: "center", gridColumn: "1 / -1" }}>No stars found.</p>
                    )}
                </div>

                {/* Pagination Component */}
                <PaginationComponent
                    count={totalPages}
                    page={currentPage}
                    onPageChange={handlePageChange}
                />
            </div>

            <Footer/>
        </>
    );
}

export default PornStars;
