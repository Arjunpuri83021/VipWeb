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

    // List of tags to display
    const tagsList = [
        'Caught', 'Close Up', 'Redhead', 'BBW', 'Wife', 'Japanese', 'Yoga', 'Spanking',
        'Ladyboy', 'FFM', 'Tattoo', 'Skinny', 'Cumshot', 'Cameltoe', 'Korean', 'Russian',
        'Legs', 'Webcam', 'Pussy', 'Footjob', 'College', 'Slut', 'Orgasm', 'Perfect',
        'Cum In Pussy', 'Panties', 'Sport', 'Cowgirl', 'Natural Tits', 'Pretty', 'Doggystyle',
        'Maid', 'Housewife', 'Curvy', 'Deepthroat', 'Surprise', 'Party', 'BBC',
        'Shower','Screaming','Jeans','Handjob','Teacher','Stuck','Babysitter','Masturbation','Girlfriend','Big Tits','Kissing','Saggy Tits','White','Beautiful','Teen','Chinese','Pregnant','Glasses','Twins','Short Hair','Swinger','Stockings','Bathroom','Indian','Wedding','Cheerleader','office','babe'
    ];

    // Helper to slugify tags for URL
    const slugifyTag = (tag) => tag.toLowerCase().replace(/\s+/g, "-");

    // state to hold preview images for each tag
    const [tagImages, setTagImages] = useState({});
    const [tagLoaded, setTagLoaded] = useState({});
    const showPosts = false; // toggle: if true old post list renders

    useEffect(() => {
        fetchTagImages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchTagImages = async () => {
        try {
            const promises = tagsList.map(async (tg) => {
                try {
                    const res = await fetch(`${apiUrl}/getpostdata?page=1&limit=5&search=${encodeURIComponent(tg)}`, { mode: "cors" });
                    if (!res.ok) return [tg, null];
                    const data = await res.json();
                    if (!data.records || data.records.length === 0) return [tg, null];
                    const validRec = data.records.find(rec => rec.imageUrl);
                    return [tg, validRec ? validRec.imageUrl : null];
                } catch (e) {
                    return [tg, null];
                }
            });
            const results = await Promise.all(promises);
            const imgMap = {};
            results.forEach(([tg, url]) => { imgMap[tg] = url; });
            setTagImages(imgMap);
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

    // Fetch data for the current page
    const fetchData = async (page = 1, category = "", searchQuery = "") => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${apiUrl}/getpostdata?page=${page}&limit=${itemsPerPage}&category=${category}&search=${searchQuery}`,
                { mode: "cors" }
            );
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            const data = await response.json();
            setPostData(data.records);
            setTotalPages(data.totalPages);
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
                <title>VipMilfNut WowUncut XXXHD Videos | SpanBank Full HD Streaming On VipMilfNut</title>
                {/* Dynamically set the canonical link */}
                <link 
                    rel="canonical" 
                    href={`https://vipmilfnut.com/${currentPage === 1 ? '' : currentPage}`} 
                />
               
                <meta 
                    name="description" 
                    content="fry99 hqpornee freeomovie 3gp king adelt movies auntymaza badwap com bf full hd bf hd video bfxxx bigfucktv xxxhd spanbank borwap com pornve wowuncut| VipMilfNut" 
                />
                <meta name="robots" content="index, follow" />
            </Helmet>

            <Sidebar onSearch={(query) => setSearch(query)} />
            

            {/* Tags List */}
            <Grid style={{marginTop:"20px"}} container spacing={{ xs: 0, sm: 2 }} className="tag-container" sx={{ px: { xs: 0, sm: 2 }, py: 1 }}>
                {tagsList.map((tag) => (
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
                                <span className="tag-overlay">{tag}</span>
                            </Box>
                        </Link>
                    </Grid>
                ))}
            </Grid>
            
          

            <Footer/>
        </>
    );
}

export default Home;
