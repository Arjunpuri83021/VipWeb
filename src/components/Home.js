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

    // Function to fetch all unique tags from the API
    const fetchAllTags = async () => {
        try {
            const response = await fetch(`${apiUrl}/getpostdata?page=1&limit=1000`, { mode: "cors" });
            if (!response.ok) return;
            const data = await response.json();
            const allRecords = data.records || [];
            
            // Extract all unique tags from all posts
            const uniqueTags = new Set();
            const tagMap = new Map(); // To store original case versions
            
            allRecords.forEach(post => {
                if (Array.isArray(post.tags)) {
                    post.tags.forEach(tag => {
                        if (tag && tag.trim()) {
                            const trimmedTag = tag.trim();
                            const normalizedTag = trimmedTag.toLowerCase();
                            
                            // Only add if we haven't seen this normalized version
                            if (!uniqueTags.has(normalizedTag)) {
                                uniqueTags.add(normalizedTag);
                                tagMap.set(normalizedTag, trimmedTag); // Store original case
                            }
                        }
                    });
                }
            });
            
            // Convert back to array using original case versions
            const tagsArray = Array.from(uniqueTags).map(normalizedTag => tagMap.get(normalizedTag));
            console.log(`Total unique tags found: ${tagsArray.length}`);
            
            setAllTags(tagsArray);
            
            // Check if we have saved tags and timestamp in localStorage
            const savedTagsData = localStorage.getItem('vipmilfnut_display_tags');
            const now = Date.now();
            
            if (savedTagsData) {
                const { tags, timestamp, images } = JSON.parse(savedTagsData);
                const timeDiff = now - timestamp;
                const tenMinutes = 10 * 60 * 1000;
                
                // If less than 10 minutes have passed, use saved tags and images
                if (timeDiff < tenMinutes && tags && tags.length > 0) {
                    console.log('Using saved tags and images from localStorage');
                    setDisplayTags(tags);
                    if (images) {
                        setTagImages(images);
                    }
                    return tags;
                }
            }
            
            // Generate new random tags and save to localStorage
            const randomTags = getRandomTags(tagsArray, 64);
            localStorage.setItem('vipmilfnut_display_tags', JSON.stringify({
                tags: randomTags,
                timestamp: now,
                images: {} // Will be populated when images are fetched
            }));
            console.log('Generated new random tags and saved to localStorage');
            setDisplayTags(randomTags);
            
            return randomTags;
        } catch (err) {
            console.error("Error fetching all tags:", err);
            return [];
        }
    };

    // Function to refresh tags with new random selection
    const refreshTags = async () => {
        if (allTags.length > 0) {
            const newRandomTags = getRandomTags(allTags, 64);
            const now = Date.now();
            
            setDisplayTags(newRandomTags);
            console.log('Tags refreshed with new random selection');
            
            // Fetch images for new tags and save everything to localStorage
            const newImages = await fetchTagImages(newRandomTags);
            
            // Save new tags and images to localStorage with current timestamp
            localStorage.setItem('vipmilfnut_display_tags', JSON.stringify({
                tags: newRandomTags,
                timestamp: now,
                images: newImages || {}
            }));
            
            console.log('Tags and images refreshed and saved to localStorage');
        }
    };

    // Initial setup and interval management
    useEffect(() => {
        // Fetch all tags and set up initial display
        fetchAllTags().then(async (initialTags) => {
            if (initialTags && initialTags.length > 0) {
                // Check if we already have saved images from localStorage
                const savedTagsData = localStorage.getItem('vipmilfnut_display_tags');
                if (savedTagsData) {
                    const { images } = JSON.parse(savedTagsData);
                    if (images && Object.keys(images).length > 0) {
                        // Images already loaded from localStorage, no need to fetch again
                        return;
                    }
                }
                
                // Fetch images and save to localStorage
                const newImages = await fetchTagImages(initialTags);
                const now = Date.now();
                
                // Update localStorage with images
                const currentSavedData = localStorage.getItem('vipmilfnut_display_tags');
                if (currentSavedData) {
                    const currentData = JSON.parse(currentSavedData);
                    localStorage.setItem('vipmilfnut_display_tags', JSON.stringify({
                        ...currentData,
                        images: newImages || {}
                    }));
                }
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
            // Fetch all posts first, then filter by tags
            const response = await fetch(`${apiUrl}/getpostdata?page=1&limit=1000`, { mode: "cors" });
            if (!response.ok) return;
            const data = await response.json();
            const allRecords = data.records || [];

            // Helper function to normalize tags (same as TagPage)
            const normalizeTag = (tag) =>
                tag && tag.trim().toLowerCase().replace(/\s+/g, "-");

            // Track used image URLs to avoid duplicates
            const usedImageUrls = new Set();
            const imgMap = {};
            
            // Process tags sequentially to ensure unique images
            for (const tg of targetTags) {
                try {
                    // Filter records that have this tag in their tags array
                    const matchingRecords = allRecords.filter(post =>
                        Array.isArray(post.tags) &&
                        post.tags.some(tag => normalizeTag(tag) === normalizeTag(tg))
                    );
                    
                    if (matchingRecords.length === 0) {
                        imgMap[tg] = null;
                        continue;
                    }
                    
                    // Get all records with valid images for this tag
                    const allValidRecords = matchingRecords.filter(rec => rec.imageUrl);
                    
                    if (allValidRecords.length === 0) {
                        imgMap[tg] = null;
                        continue;
                    }
                    
                    // Try to find the first unused image
                    let selectedRecord = null;
                    
                    // First, try to get the first image (index 0) if it's not used
                    if (allValidRecords.length > 0 && !usedImageUrls.has(allValidRecords[0].imageUrl)) {
                        selectedRecord = allValidRecords[0];
                    } else {
                        // If first image is already used, find the next available image
                        selectedRecord = allValidRecords.find(rec => !usedImageUrls.has(rec.imageUrl));
                        
                        // If no unique image found, use the first image as fallback
                        if (!selectedRecord) {
                            selectedRecord = allValidRecords[0];
                        }
                    }
                    
                    if (selectedRecord) {
                        imgMap[tg] = selectedRecord.imageUrl;
                        usedImageUrls.add(selectedRecord.imageUrl);
                    } else {
                        imgMap[tg] = null;
                    }
                    
                } catch (e) {
                    imgMap[tg] = null;
                }
            }
            
            setTagImages(imgMap);
            console.log(`Fetched images for ${targetTags.length} tags, ${usedImageUrls.size} unique images used`);
            
            // Return the image map for use in refreshTags
            return imgMap;
        } catch (err) {
            console.error("Error fetching tag images", err);
        }
    };

    useEffect(() => {
        fetchTagImages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

   

    useEffect(() => {
        document.title = `VipMilfNut WowUncut XXXHD Videos SpanBank Page ${currentPage}`;
    
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
                console.log('🔍 Searching by title (fallback):', searchParam);
                console.log('📡 API Endpoint:', apiEndpoint);
            } else if (searchQuery) {
                // Regular tag/star name search
                searchParam = searchQuery;
                apiEndpoint = `${apiUrl}/getpostdata?page=${page}&limit=${itemsPerPage}&category=${category}&search=${searchParam}`;
                console.log('🏷️ Searching by tag/star:', searchParam);
                console.log('📡 API Endpoint:', apiEndpoint);
            } else {
                // No search query
                apiEndpoint = `${apiUrl}/getpostdata?page=${page}&limit=${itemsPerPage}&category=${category}`;
                console.log('📋 Loading all posts (no search)');
            }
            
            const response = await fetch(apiEndpoint, { mode: "cors" });
            if (!response.ok) {
                throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            
            // Detailed debugging
            console.log('📊 API Response:', {
                totalRecords: data.totalRecords,
                totalPages: data.totalPages,
                currentPage: data.currentPage,
                recordsCount: data.records?.length || 0
            });
            
            if (searchQuery && data.records?.length > 0) {
                console.log('✅ Sample search results:', data.records.slice(0, 2).map(record => ({
                    title: record.titel,
                    tags: record.tags,
                    stars: record.name
                })));
            } else if (searchQuery) {
                console.log('❌ No results found for search:', searchParam);
                console.log('💡 This might mean:');
                console.log('   - The backend search doesn\'t search in tags/name fields');
                console.log('   - The search term doesn\'t match any content');
                console.log('   - There\'s a case sensitivity issue');
            }
            
            setPostData(data.records);
            setTotalPages(data.totalPages);
            
            // Log search results for debugging
            if (searchQuery) {
                console.log(`🎯 Final results for "${searchParam}": ${data.records?.length || 0} videos found`);
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
                <title>VipMilfNut</title>
            </Helmet>

            <Sidebar onSearch={(query) => setSearch(query)} />
            

            {/* Dynamic Tags List - Refreshes every 5 minutes */}
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
            
          

            <Footer/>
        </>
    );
}

export default Home;
