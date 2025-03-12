import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom"; // Import useParams
import { Helmet } from "react-helmet";
import Sidebar from "../partials/Navbar";
import Slider from "../partials/Slider";
import PaginationComponent from '../partials/PaginationComponent';
import './category.css'
import Footer from "../partials/Footer";
const apiUrl = process.env.REACT_APP_API_URL;

function Aunt() {
    const [postData, setPostData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("mom");
    const itemsPerPage = 16;

    const { page } = useParams(); // Get the current page number from the URL
    const currentPage = parseInt(page) || 1; // Default to page 1 if the page is not defined

    const navigate = useNavigate();


    useEffect(() => {
            if (currentPage === 1 && window.location.pathname !== '/category/aunt-sex') {
                navigate('/category/aunt-sex');  // Redirect to root URL
            }
        }, [currentPage, navigate]);

    useEffect(() => {
        document.title = `Aunt Sex Videos page ${currentPage} on VipMilfNut - milf300 wwwxxx sex adelt movies`;
        const metaDescContent = "Explore a collection of premium Aunt Sex videos on VipMilfNut. Enjoy handpicked, high-quality content filtered for your preferences.";

        const metaDesc = document.querySelector("meta[name='description']");
        if (metaDesc) {
            metaDesc.setAttribute("content", metaDescContent);
        } else {
            const newMeta = document.createElement("meta");
            newMeta.name = "description";
            newMeta.content = metaDescContent;
            document.head.appendChild(newMeta);
        }

        // Dynamically set the canonical link
        const canonicalUrl = `https://vipmilfnut.com/category/aunt-sex/${currentPage === 1 ? '' : currentPage}`;
        const canonicalLink = document.querySelector("link[rel='canonical']");
        if (canonicalLink) {
            canonicalLink.setAttribute("href", canonicalUrl);
        } else {
            const newCanonical = document.createElement("link");
            newCanonical.rel = "canonical";
            newCanonical.href = canonicalUrl;
            document.head.appendChild(newCanonical);
        }
    }, [currentPage]); // Run when currentPage changes

    const fetchData = async (page = 1, searchQuery = "mom") => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${apiUrl}/getpostdata?page=${page}&limit=${itemsPerPage}&search=${searchQuery}`, { mode: "cors" });
            if (!response.ok) throw new Error("Failed to fetch data");
            const data = await response.json();
            setPostData(data.records);
            setTotalPages(data.totalPages);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentPage, search);
    }, [currentPage, search]);

    const handlePageChange = (event, value) => {
        navigate(`/category/aunt-sex/${value}`); // Update URL with new page
        window.scrollTo(0, 0); // Scroll to top after page change
    };

    const handleSearch = (query) => {
        setSearch(query || "mom");
        navigate(`/category/aunt-sex/1`); // Reset to page 1 on search
    };

    const slugifyTitle = (title) => title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");


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
                <title>Aunt Sex Videos on VipMilfNut - milf300 wwwxxx sex adelt movies</title>
                <link rel="canonical" href={`https://vipmilfnut.com/category/aunt-sex/${currentPage === 1 ? '' : currentPage}`} /> {/* Dynamic canonical URL */}
                <meta name="description" content="Explore a collection of premium Aunt Sex videos on VipMilfNut. Enjoy handpicked, high-quality content filtered for your preferences." />
            </Helmet>
            <Sidebar onSearch={handleSearch} />
            <Slider />
            <div style={{ width: "95%", margin: "auto" }}>
                <h1>Aunt Sex Videos</h1>
                {loading && <p>Loading...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
                <div className="row row-cols-2 row-cols-md-3 g-2">
                    {postData.map((post) => (
                        <div className="col" key={post._id}>
                            <Link onClick={(e) => handleCardClick(post._id, post.views)} style={{ textDecoration: "none" }} to={`/video/${post._id}-${slugifyTitle(post.titel)}`}>
                                <div className="card">
                                    <img style={{ height: "250px" }} src={post.imageUrl} className="card-img-top card-img" alt={post.altKeywords?.trim() || post.titel} />
                                    <div className="card-body p-2">
                                        <h2 className="card-title" style={{ fontSize: "13px", margin:"0px", padding:"0px" }}>{post.titel.length > 30? `${post.titel.substring(0, 30)}...` : post.titel}</h2>
                                        <div style={{borderBottom:"0px", justifyContent:"start", marginTop:"5px",}}>
                                           
                                            <p><i className="bi bi-eye-fill"></i> {post.views || 2}K+</p>
                                            <p><i className="bi bi-clock-fill ms-3"></i> {post.minutes}</p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
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

export default Aunt;
