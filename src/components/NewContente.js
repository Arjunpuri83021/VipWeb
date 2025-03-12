import React, { useEffect, useState } from "react";
import Sidebar from "./partials/Navbar";
import Slider from "./partials/Slider";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Footer from "./partials/Footer";

const apiUrl = process.env.REACT_APP_API_URL;

function NewContent() {
    const [postData, setPostData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const itemsPerPage = 16;

    useEffect(() => {
        document.title = "fsiblog df6 org df6org dinotube draftsex drtuber fsiblog com | VipMilfNut";

        const metaDescContent = "gekso fsiblog com fsiblog fry99 com english bf video elephant tube bad wap beeg hindi draftsex dinotube df6 org tiktits 3gp king icegay xxxhd sex18 imo sex | VipMilfNut";

        let metaDesc = document.querySelector("meta[name='description']");
        if (!metaDesc) {
            metaDesc = document.createElement("meta");
            metaDesc.name = "description";
            document.head.appendChild(metaDesc);
        }
        metaDesc.content = metaDescContent;

        let canonicalLink = document.querySelector("link[rel='canonical']");
        if (!canonicalLink) {
            canonicalLink = document.createElement("link");
            canonicalLink.rel = "canonical";
            document.head.appendChild(canonicalLink);
        }
        canonicalLink.href = "https://vipmilfnut.com/new-content";
    }, []);

    const fetchData = async (page = 1, category = "", searchQuery = "") => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${apiUrl}/getnewVideos?page=${page}&limit=${itemsPerPage}&category=${category}&search=${searchQuery}`, {
                mode: "cors"
            });
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            const data = await response.json();
            setPostData(data.records);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentPage, selectedCategory, search);
    }, [currentPage, selectedCategory, search]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const generatePageNumbers = () => {
        const pages = [];
        let startPage = Math.max(1, currentPage - 1);
        let endPage = Math.min(totalPages, currentPage + 1);

        if (currentPage === 1) endPage = Math.min(totalPages, 3);
        if (currentPage === totalPages) startPage = Math.max(1, totalPages - 2);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        if (!pages.includes(totalPages) && totalPages > 3) {
            pages.push(totalPages);
        }

        return pages;
    };

    const slugifyTitle = (title) =>
        title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

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
                <title>fsiblog df6 org df6org dinotube draftsex drtuber fsiblog com | VipMilfNut</title>
                <link rel="canonical" href="https://vipmilfnut.com/new-content" />
                <link rel="icon" href="/favicon.ico?v=2" type="image/x-icon" />
                <meta name="description" content="gekso fsiblog com fsiblog fry99 com english bf video elephant tube..." />
                <meta name="robots" content="index, follow" />
            </Helmet>

            <Sidebar onSearch={setSearch} />
            <Slider onCategorySelect={setSelectedCategory} />

            <div style={{ width: "95%", margin: "auto" }}>
                {loading && <p>Loading...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
                <div className="row row-cols-1 row-cols-md-3 g-4">
                    {postData.map((post, index) => (
                        <div className="col" key={post._id}>
                            <Link onClick={(e) => handleCardClick(post._id, post.views)} to={`/video/${post._id}-${slugifyTitle(post.titel)}`} style={{ textDecoration: "none" }}>
                                <div className="card">
                                    <img loading="lazy" style={{ height: "250px" }} src={post.imageUrl} className="card-img-top" alt={post.altKeywords?.trim() || post.titel} />
                                    <div className="card-body">
                                        <div>
                                            <p><i className="bi bi-hand-thumbs-up-fill"></i> {Math.min(Math.round((post.views / 200) * 100), 100)}%</p>

                                            <p><i className="bi bi-eye-fill"></i> {post.views || 2}K+..</p>
                                            <p><i className="bi bi-clock-fill"></i> {post.minutes}</p>
                                        </div>
                                        {index === 0 ? <h1 className="card-title">{post.titel}</h1> : <h2 className="card-title">{post.titel}</h2>}
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: "20px", textAlign: "center" }}>
                    <button className="btn btn-dark" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} style={{ marginRight: "10px" }}>Previous</button>
                    {generatePageNumbers().map((pageNumber) => (
                        <button key={pageNumber} className={`btn btn-dark ${currentPage === pageNumber ? "active" : ""}`} onClick={() => handlePageChange(pageNumber)} style={{ margin: "0 5px" }}>{pageNumber}</button>
                    ))}
                    <button className="btn btn-dark" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} style={{ marginLeft: "10px" }}>Next</button>
                </div>
            </div>

            <Footer/>
        </>
    );
}

export default NewContent;
