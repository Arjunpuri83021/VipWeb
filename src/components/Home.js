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
            <Slider onCategorySelect={(category) => setSelectedCategory(category)} />
            
            <h1 style={{fontSize:"18px", textAlign:"center", marginTop:"10px"}}>Watch All VipMilfNut Videos – Latest & Trending Updates</h1>

            <div style={{ width: "95%", margin: "auto" }}>
                {loading && <p>Loading...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}

                <div className="row row-cols-1 row-cols-md-3 g-4">
                    {postData.map((post, idx) => (
                        <React.Fragment key={idx}>
                            <div className="col">
                                <Link onClick={(e) => handleCardClick(post._id, post.views)}
                                    to={`/video/${post._id}`}
                                    style={{ textDecoration: "none" }}
                                >
                                    <div className="card">
                                        <img
                                            loading="lazy"
                                            style={{ height: "250px" }}
                                            src={post.imageUrl}
                                            className="card-img-top"
                                            alt={post.altKeywords?.trim() || post.titel}
                                        />
                                        <div className="card-body">
                                            <div>
                                                <p>
                                                    <i className="bi bi-hand-thumbs-up-fill"></i>{" "}
                                                    {Math.min(Math.round((post.views / 200) * 100), 100)}%
                                                </p>
                                                <p>
                                                    <i className="bi bi-clock-fill"></i> {post.minutes}
                                                </p>
                                                <p>
                                                    <i className="bi bi-eye-fill"></i> {post.views || 2}
                                                </p>
                                            </div>
                                            <h2 className="card-title">{post.titel}</h2>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                           
                                    {((idx + 1) % 2 === 0) && (
                                <div className="col" key={`ad-${idx}`}>
                                    <SmartLinkBanner />
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                {/* Reusable Pagination Component */}
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

export default Home;
