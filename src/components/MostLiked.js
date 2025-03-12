import React, { useEffect, useState } from "react";
import Sidebar from "./partials/Navbar";
import Slider from "./partials/Slider";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Footer from "./partials/Footer";

const apiUrl = process.env.REACT_APP_API_URL;

function MostLiked() {
    const [postData, setPostData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const itemsPerPage = 16;

    useEffect(() => {
        document.title = "bad wap wwwxxx xvedeo sexv icegay sex sister tiktits |VipMilfNut";

        const updateMetaTag = (name, content) => {
            let tag = document.querySelector(`meta[name='${name}']`);
            if (tag) {
                tag.setAttribute("content", content);
            } else {
                tag = document.createElement("meta");
                tag.name = name;
                tag.content = content;
                document.head.appendChild(tag);
            }
        };

        updateMetaTag("description", "xmoviesforyou aunty sex wwwxxx sex sister aunty sexy video bad wap beeg hindi badwap badwap com sexv tiktits boobs kiss boobs pressing borwap boudi sex | VipMilfNut");
        updateMetaTag("robots", "index, follow");

        let canonical = document.querySelector("link[rel='canonical']");
        if (!canonical) {
            canonical = document.createElement("link");
            canonical.rel = "canonical";
            document.head.appendChild(canonical);
        }
        canonical.href = "https://vipmilfnut.com/most-liked";
    }, []);

    const fetchData = async (page = 1, category = "", searchQuery = "") => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${apiUrl}/getTopRate?page=${page}&limit=${itemsPerPage}&category=${category}&search=${searchQuery}`,
                { mode: "cors" }
            );
            if (!response.ok) throw new Error("Failed to fetch data");
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
        if (newPage > 0 && newPage <= totalPages) setCurrentPage(newPage);
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
                <title>bad wap wwwxxx xvedeo sexv icegay sex sister tiktits |VipMilfNut</title>
                <link rel="canonical" href="https://vipmilfnut.com/most-liked" />
                <link rel="icon" href="/favicon.ico?v=2" type="image/x-icon" />
                <meta name="description" content="xmoviesforyou aunty sex wwwxxx sex sister aunty sexy video bad wap beeg hindi badwap badwap com sexv tiktits boobs kiss boobs pressing borwap boudi sex | VipMilfNut" />
                <meta name="robots" content="index, follow" />
            </Helmet>

            <Sidebar onSearch={(query) => setSearch(query)} />
            <Slider onCategorySelect={(category) => setSelectedCategory(category)} />
            <h1 style={{fontSize:"18px", textAlign:"center"}}>Watch All MilfNut most Liked Videos – Latest & Trending Videos</h1>

            <div style={{ width: "95%", margin: "auto" }}>
                {loading && <p>Loading...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
                <div className="row row-cols-1 row-cols-md-3 g-4">
                    {postData.map((post) => (
                        <div className="col" key={post._id}>
                            <Link onClick={(e) => handleCardClick(post._id, post.views)} style={{ textDecoration: "none" }} to={`/video/${post._id}-${slugifyTitle(post.titel)}`}>
                                <div className="card">
                                    <img loading="lazy" style={{ height: "250px" }} src={post.imageUrl} className="card-img-top" alt={post.titel} />
                                    <div className="card-body">
                                        <div>
                                            <p><i className="bi bi-hand-thumbs-up-fill"></i> {Math.min(Math.round((post.views / 200) * 100), 100)}%</p>
                                           
                                            <p><i className="bi bi-eye-fill"></i> {post.views || 2}K+..</p>
                                            <p><i className="bi bi-clock-fill"></i> {post.minutes}</p>
                                        </div>
                                        <h2 className="card-title">{post.titel}</h2>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: "20px", textAlign: "center" }}>
                    <button className="btn btn-dark" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                        Previous
                    </button>
                    {[...Array(totalPages)].map((_, i) => (
                        <button key={i + 1} className={`btn btn-dark ${currentPage === i + 1 ? "active" : ""}`} onClick={() => handlePageChange(i + 1)}>
                            {i + 1}
                        </button>
                    ))}
                    <button className="btn btn-dark" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                        Next
                    </button>
                </div>
            </div>

            <Footer/>
        </>
    );
}

export default MostLiked;
