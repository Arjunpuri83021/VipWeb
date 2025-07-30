import React, { useEffect, useState } from "react";
import Sidebar from "./partials/Navbar";
import Slider from "./partials/Slider";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Footer from "./partials/Footer";

const apiUrl = process.env.REACT_APP_API_URL;

function Muslim() {
    const [indians, setIndians] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const itemsPerPage = 16;

    useEffect(() => {
        document.title = "VipMilfNut bp sexy video bravotube brezzar comxxx blueflim";

        const metaDescription = document.querySelector("meta[name='description']");
        if (metaDescription) {
            metaDescription.setAttribute("content", "boobs kiss bravotube boobs pressing blueflim brazzers3x dasi sex dehati sex brezzar bfxxx comxxx bf sexy banglaxx beeg hindi blueflim auntymaza adult movies | VipMilfNut");
        } else {
            const newMeta = document.createElement("meta");
            newMeta.name = "description";
            newMeta.content = "desi 52 com desi 49 com dehati sex dasi sex blueflim boyfriendtv com bollywood sex bf sexy indiangaysite sxyprn bf hindi video bf hindi movie banglaxx | comxxx";
            document.head.appendChild(newMeta);
        }

        const canonicalLink = document.querySelector("link[rel='canonical']");
        if (canonicalLink) {
            canonicalLink.setAttribute("href", "https://vipmilfnut.com/muslim");
        } else {
            const newCanonical = document.createElement("link");
            newCanonical.rel = "canonical";
            newCanonical.href = "https://vipmilfnut.com/muslim";
            document.head.appendChild(newCanonical);
        }
    }, []);

    const fetchData = async (page = 1, category = "", searchQuery = "") => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${apiUrl}/getHijabi?page=${page}&limit=${itemsPerPage}&category=${category}&search=${searchQuery}`, { mode: "cors" });
            if (!response.ok) throw new Error("Failed to fetch data");
            const data = await response.json();
            setIndians(data.records);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentPage, selectedCategory, searchTerm);
    }, [currentPage, selectedCategory, searchTerm]);

    const handlePageChange = (newPage) => {
        if (newPage > 0 && newPage <= totalPages) setCurrentPage(newPage);
    };

    const slugifyTitle = (title) => {
        return title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    };

    const handleCardClick = async (id, currentViews) => {
        try {
          const updatedViews = (currentViews || 0) + 1;
          const updatedPosts = indians.map((item) =>
            item._id === id ? { ...item, views: updatedViews } : item
          );
          setIndians(updatedPosts);
    
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
                <title>VipMilfNut bp sexy video bravotube brazzers3x brezzar comxxx blueflim | VipMilfNut</title>
                <link rel="canonical" href="https://vipmilfnut.com/muslim" />
                <meta name="description" content="boobs kiss bravotube boobs pressing blueflim brazzers3x dasi sex dehati sex brezzar bfxxx comxxx bf sexy banglaxx beeg hindi blueflim auntymaza adult movies | VipMilfNut" />
                <meta name="robots" content="index, follow" />
            </Helmet>

            <Sidebar onSearch={setSearchTerm} />
            <Slider onCategorySelect={setSelectedCategory} />
            <h1 style={{fontSize:"18px", textAlign:"center", marginTop:"10px"}}>VipMilfNut Hijabi sex Videos</h1>
            <div style={{ width: "95%", margin: "auto" }}>
                {loading && <p>Loading...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}

                <div className="row row-cols-1 row-cols-md-3 g-4">
                    {indians.map((post, index) => (
                        <div className="col" key={post._id}>
                            <Link onClick={(e) => handleCardClick(post._id, post.views)} to={`/video/${post._id}`} style={{ textDecoration: "none" }}>
                                <div className="card">
                                    <img loading="lazy" style={{ height: "250px" }} src={post.imageUrl} className="card-img-top" alt={post.altKeywords?.trim() || post.titel} />
                                    <div className="card-body">
                                        <div>
                                            <p><i className="bi bi-hand-thumbs-up-fill"></i> {Math.min(Math.round((post.views / 200) * 100), 100)}%</p>
                                            
                                            <p><i className="bi bi-eye-fill"></i> {post.views || 2}</p>
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
    <button className="btn btn-dark" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} style={{ marginRight: "10px" }}>
        Previous
    </button>

    {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((page) => {
            return (
                page === 1 || // always show first page
                page === totalPages || // always show last page
                (page >= currentPage - 1 && page <= currentPage + 1) // show around current
            );
        })
        .reduce((acc, page, index, array) => {
            if (index > 0 && page - array[index - 1] > 1) {
                acc.push("ellipsis"); // inject ellipsis
            }
            acc.push(page);
            return acc;
        }, [])
        .map((page, index) => {
            if (page === "ellipsis") {
                return <span key={`ellipsis-${index}`} className="btn btn-dark disabled">...</span>;
            }
            return (
                <button style={{margin:"10px"}}
                    key={page}
                    className={`btn btn-dark ${currentPage === page ? "active" : ""}`}
                    onClick={() => handlePageChange(page)}
                >
                    {page}
                </button>
            );
        })}

    <button className="btn btn-dark" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} style={{ marginLeft: "10px" }}>
        Next
    </button>
</div>
            </div>

            <Footer/>
        </>
    );
}

export default Muslim;
