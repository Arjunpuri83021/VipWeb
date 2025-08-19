import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "./partials/Navbar";
import Slider from "./partials/Slider"; 
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";

import PaginationComponent from '../components/partials/PaginationComponent'; // Import the PaginationComponent
import Footer from "./partials/Footer";
import "./Video/Video.css";
import SmartLinkBanner from "./partials/SmartLinkBanner";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import "./TagGrid.css";

const apiUrl = process.env.REACT_APP_API_URL;

function Home() {
    const { page } = useParams(); // Get the page number from the URL
    const currentPage = page ? Number(page) : 1; // Default to page 1 if not present
    const navigate = useNavigate();
    

    useEffect(() => {
        if (isNaN(currentPage) || currentPage < 1) {
            navigate('/404', { replace: true });
        }
    }, [currentPage, navigate]);

    // Redirect to root URL if currentPage is 1
    useEffect(() => {
        if (currentPage === 1 && window.location.pathname !== '/') {
            navigate('/');  // Redirect to root URL
        }
    }, [currentPage, navigate]);

    const [postData, setPostData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState(""); 
    const [selectedCategory, setSelectedCategory] = useState(""); 
    const itemsPerPage = 16;

    // Dynamic tag states
    const [allTags, setAllTags] = useState([]); // All available tags from API
    const [displayTags, setDisplayTags] = useState([]); // Currently displayed 64 tags
    const [refreshInterval, setRefreshInterval] = useState(null);

    // Helper to slugify tags for URL
    const slugifyTag = (tag) => tag.toLowerCase().replace(/\s+/g, "-");
    
    // Helper to format tags for display (replace hyphens with spaces and capitalize)
    const formatTagForDisplay = (tag) => {
        return tag
            .replace(/-/g, ' ') // Replace hyphens with spaces
            .split(' ') // Split into words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize each word
            .join(' '); // Join back with spaces
    };

    // state to hold preview images for each tag
    const [tagImages, setTagImages] = useState({});
    const [tagLoaded, setTagLoaded] = useState({});
    const showPosts = false; // toggle: if true old post list renders

    // Function to get random 64 tags from all available tags
    const getRandomTags = (tags, count = 64) => {
        if (tags.length <= count) return tags;
        const shuffled = [...tags].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };

    // Function to fetch random tags from optimized API
    const fetchRandomTags = async () => {
        try {
            // Check if we have saved tags and timestamp in localStorage
            const savedTagsData = localStorage.getItem('vipmilfnut_display_tags');
            const now = Date.now();
            
            if (savedTagsData) {
                const { tags, timestamp, images } = JSON.parse(savedTagsData);
                const timeDiff = now - timestamp;
                const tenMinutes = 10 * 60 * 1000;
                
                // If less than 10 minutes have passed, use saved tags and images
                if (timeDiff < tenMinutes && tags && tags.length > 0) {
                    setDisplayTags(tags);
                    if (images) {
                        setTagImages(images);
                    }
                    return tags;
                }
            }
            
            // Fetch random tags from optimized endpoint
            const response = await fetch(`${apiUrl}/tags/random?count=64`, { mode: "cors" });
            if (!response.ok) {
                console.error('Failed to fetch random tags');
                return [];
            }
            
            const data = await response.json();
            if (!data.success || !Array.isArray(data.tags)) {
                console.error('Invalid response format from tags API');
                return [];
            }
            
            const randomTags = data.tags;

            
            // Save to localStorage
            localStorage.setItem('vipmilfnut_display_tags', JSON.stringify({
                tags: randomTags,
                timestamp: now,
                images: {} // Will be populated when images are fetched
            }));
            
            setDisplayTags(randomTags);
            return randomTags;
            
        } catch (err) {
            console.error("❌ Error fetching random tags:", err);
            return [];
        }
    };

    // Function to refresh tags with new random selection
    const refreshTags = async () => {
        try {

            
            // Fetch new random tags from API
            const response = await fetch(`${apiUrl}/tags/random?count=64`, { mode: "cors" });
            if (!response.ok) {
                console.error('Failed to refresh tags');
                return;
            }
            
            const data = await response.json();
            if (!data.success || !Array.isArray(data.tags)) {
                console.error('Invalid response format from tags refresh API');
                return;
            }
            
            const newRandomTags = data.tags;
            const now = Date.now();
            
            // Fetch images for new tags
            const newImages = await fetchTagImages(newRandomTags);
            
            // Update localStorage with new tags and images
            localStorage.setItem('vipmilfnut_display_tags', JSON.stringify({
                tags: newRandomTags,
                timestamp: now,
                images: newImages || {}
            }));
            
            setDisplayTags(newRandomTags);

        } catch (err) {
            console.error('❌ Error refreshing tags:', err);
        }
    };

    // Initial setup and interval management
    useEffect(() => {
        // Fetch all tags and set up initial display
        fetchRandomTags().then((initialTags) => {
            if (initialTags && initialTags.length > 0) {
                // Check if images are already cached
                const savedTagsData = localStorage.getItem('vipmilfnut_display_tags');
                if (savedTagsData) {
                    const { images } = JSON.parse(savedTagsData);
                    if (images && Object.keys(images).length > 0) {

                        return;
                    }
                }
                
                // Fetch images for the initial tags
                fetchTagImages(initialTags);
            }
        });

        // Set up 10-minute interval for refreshing tags
        const interval = setInterval(() => {
            refreshTags();
        }, 10 * 60 * 1000); // 10 minutes in milliseconds

        setRefreshInterval(interval);

        // Cleanup interval on component unmount
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchTagImages = async (tagsToFetch = null) => {
        const targetTags = tagsToFetch || displayTags;
        if (targetTags.length === 0) return;
        
        try {

            
            // Use optimized tag images API
            const response = await fetch(`${apiUrl}/tags/images`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ tags: targetTags }),
                mode: "cors"
            });
            
            if (!response.ok) {
                console.error('Failed to fetch tag images');
                return {};
            }
            
            const data = await response.json();
            if (!data.success || !data.tagImages) {
                console.error('Invalid response format from tag images API');
                return {};
            }
            
            const imgMap = data.tagImages;
            const successCount = Object.values(imgMap).filter(img => img !== null).length;
            
            setTagImages(imgMap);

            
            // Return the image map for use in refreshTags
            return imgMap;
        } catch (err) {
            console.error("❌ Error fetching tag images:", err);
            return {};
        }
    };

    useEffect(() => {
        fetchTagImages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

   

    useEffect(() => {
        document.title = `VipMilfNut Free XXXHD Adult Content Videos And Free Porn Videos`;
    
        // Update meta description
        const metaDesc = document.querySelector("meta[name='description']");
        if (metaDesc) {
            metaDesc.setAttribute(
                "content",
                "fry99 hqpornee freeomovie 3gp king adelt movies auntymaza badwap com bf full hd bf hd video bfxxx bigfucktv xxxhd spanbank borwap com pornve wowuncut| VipMilfNut"
            );
        } else {
            const newMeta = document.createElement("meta");
            newMeta.name = "description";
            newMeta.content = "desi 52 com desi 49 com dehati sex dasi sex blueflim boyfriendtv com bollywood sex bf sexy indiangaysite sxyprn bf hindi video bf hindi movie banglaxx | VipMilfNut";
            document.head.appendChild(newMeta);
        }
    
        // Update canonical link dynamically based on current page
        const canonicalLink = document.querySelector("link[rel='canonical']");
        const currentUrl = `https://vipmilfnut.com/${currentPage === 1 ? '' : currentPage}`;  // Handle root URL (page 1) and others
        if (canonicalLink) {
            canonicalLink.setAttribute("href", currentUrl);
        } else {
            const newCanonical = document.createElement("link");
            newCanonical.rel = "canonical";
            newCanonical.href = currentUrl;
            document.head.appendChild(newCanonical);
        }
    }, [currentPage]);  // Re-run this when the page changes

    // Function to slugify title for URL
    const slugifyTitle = (title) => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[\s]+/g, "-") 
            .replace(/[^a-z0-9-]/g, "");
    };

    // Fetch data for the current page with enhanced search handling
    const fetchData = async (page = 1, category = "", searchQuery = "") => {
        setLoading(true);
        setError(null);
        try {
            let apiEndpoint;
            let searchParam = "";
            
            // Check if this is a title fallback search
            if (searchQuery.startsWith('title:')) {
                // Remove 'title:' prefix and search by title
                searchParam = searchQuery.replace('title:', '');
                apiEndpoint = `${apiUrl}/getpostdata?page=${page}&limit=${itemsPerPage}&category=${category}&search=${searchParam}`;

            } else if (searchQuery) {
                // Regular tag/star name search
                searchParam = searchQuery;
                apiEndpoint = `${apiUrl}/getpostdata?page=${page}&limit=${itemsPerPage}&category=${category}&search=${searchParam}`;

            } else {
                // No search query
                apiEndpoint = `${apiUrl}/getpostdata?page=${page}&limit=${itemsPerPage}&category=${category}`;

            }
            
            const response = await fetch(apiEndpoint, { mode: "cors" });
            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            
            if (searchQuery && data.records?.length > 0) {

            } else if (searchQuery) {

            }
            
            setPostData(data.records);
            setTotalPages(data.totalPages);
            
            // Log search results for debugging
            if (searchQuery) {

            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // useEffect hook to fetch data when page, category, or search query changes
    useEffect(() => {
        fetchData(currentPage, selectedCategory, search);
    }, [currentPage, selectedCategory, search]);

    // Handle page change and update the URL
    const handlePageChange = (event, value) => {
        navigate(`/${value}`);
        window.scrollTo(0, 0); // Change URL to reflect the selected page
    };

 

    const handleCardClick = async (id, currentViews) => {
        try {
          const updatedViews = (currentViews || 0) + 1;
          const updatedPosts = postData.map((item) =>
            item._id === id ? { ...item, views: updatedViews } : item
          );
          setPostData(updatedPosts);
    
          await fetch(`${apiUrl}/updateviews/${id}`, {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ views: updatedViews }),
          });
        } catch (error) {
          console.error("Error updating views:", error);
        }
      };
    return (
        <>
            <Helmet>
                <title>VipMilfNut Free XXXHD Adult Content Videos And Free Porn Videos</title>
                {/* SEO structured data */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebSite",
                        "name": "VipMilfNut",
                        "url": "https://vipmilfnut.com",
                        "description": "Premium adult entertainment platform with high-quality videos",
                        "potentialAction": {
                            "@type": "SearchAction",
                            "target": "https://vipmilfnut.com/search?q={search_term_string}",
                            "query-input": "required name=search_term_string"
                        }
                    })}
                </script>
            </Helmet>

            <Sidebar onSearch={(query) => setSearch(query)} />
            
            {/* SEO-friendly main content */}
            <main role="main">
                {/* Breadcrumbs for SEO */}
                <nav aria-label="Breadcrumb" style={{
                    
                    backgroundColor: '#fff',
                    borderBottom: '1px solid #eee'
                }}>
                    <ol style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        display: 'flex',
                        fontSize: '14px'
                    }}>
                       
                        {currentPage > 1 && (
                            <>
                                <li style={{ margin: '0 8px', color: '#666' }}>›</li>
                                <li style={{ color: '#666' }}>Page {currentPage}</li>
                            </>
                        )}
                    </ol>
                </nav>

               
                {/* Categories section */}
                <section aria-label="Popular Categories" style={{
                    padding: '20px 0'
                }}>
                    <h1 style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: '#333',
                        textAlign: 'center',
                        margin: '0 0 20px 0'
                    }}>
                        Browse Popular Porn Categories
                    </h1>

            {/* Dynamic Tags List - Refreshes every 10 minutes */}
            <Grid style={{marginTop:"20px"}} container spacing={{ xs: 0, sm: 2 }} className="tag-container" sx={{ px: { xs: 0, sm: 2 }, py: 1 }}>
                {displayTags.length > 0 ? displayTags.map((tag) => (
                    <Grid item xs={6} sm={4} md={3} key={tag} sx={{ px: { xs: 0.5, sm: 1 } }}>
                        <Link to={`/tag/${slugifyTag(tag)}`} style={{ textDecoration: "none", color: "inherit" }}>
                            <Box className="tag-box" sx={{ borderRadius: 0, overflow: 'hidden' }}>
                                {tagImages[tag] && (
                                    <img
                                        loading="lazy"
                                        
                                        className="tag-image"
                                        src={tagImages[tag]}
                                        alt={tag}
                                        onLoad={() => setTagLoaded(prev => ({ ...prev, [tag]: true }))}
                                        style={{ opacity: tagLoaded[tag] ? 1 : 0, transition: 'opacity 0.3s ease' }}
                                    />
                                )}
                                {!tagLoaded[tag] && (
                                    <div className="tag-placeholder">
                                        <span>Loading...</span>
                                    </div>
                                )}
                                <span className="tag-overlay">{formatTagForDisplay(tag)}</span>
                            </Box>
                        </Link>
                    </Grid>
                )) : (
                    <Grid item xs={12}>
                        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                            Loading Best category for you...
                        </div>
                    </Grid>
                )}
            </Grid>
                </section>

                
            </main>
          

            <Footer/>
        </>
    );
}

export default Home;
