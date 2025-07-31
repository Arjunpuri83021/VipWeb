import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import Sidebar from "./partials/Navbar";
import Slider from "./partials/Slider";
import PaginationComponent from "./partials/PaginationComponent";
import Footer from "./partials/Footer";
import SmartLinkBanner from "./partials/SmartLinkBanner";
import "./Category/category.css";

const apiUrl = process.env.REACT_APP_API_URL;

function TagPage() {
  const { tag, page } = useParams();
  const currentPage = parseInt(page) || 1;

  // Convert slug back to readable tag (e.g., "cum-in-pussy" => "cum in pussy")
  const decodedTag = decodeURIComponent(tag || "").replace(/-/g, " ");

  const [postData, setPostData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 16;

  const navigate = useNavigate();

  // Redirect canonical root handling
  useEffect(() => {
    if (currentPage === 1 && window.location.pathname !== `/tag/${tag}`) {
      navigate(`/tag/${tag}`);
    }
  }, [currentPage, navigate, tag]);

  // Update page metadata
  useEffect(() => {
    document.title = `VipMilfNut ${decodedTag} videos page ${currentPage}`;

    const metaDescContent = `Watch premium ${decodedTag} videos on VipMilfNut. Enjoy high-quality content filtered for your preferences.`;

    const metaDesc = document.querySelector("meta[name='description']");
    if (metaDesc) {
      metaDesc.setAttribute("content", metaDescContent);
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "description";
      newMeta.content = metaDescContent;
      document.head.appendChild(newMeta);
    }

    const canonicalUrl = `https://vipmilfnut.com/tag/${tag}/${currentPage === 1 ? "" : currentPage}`;
    const canonicalLink = document.querySelector("link[rel='canonical']");
    if (canonicalLink) {
      canonicalLink.setAttribute("href", canonicalUrl);
    } else {
      const newCanonical = document.createElement("link");
      newCanonical.rel = "canonical";
      newCanonical.href = canonicalUrl;
      document.head.appendChild(newCanonical);
    }
  }, [decodedTag, currentPage, tag]);

  const fetchData = async (pageNumber = 1) => {
    setLoading(true);
    setError(null);
    try {
      // Filter posts by tag using search parameter
      // Backend should filter posts where tags array contains the decoded tag
      const response = await fetch(
        `${apiUrl}/getpostdata?page=${pageNumber}&limit=${itemsPerPage}&search=${encodeURIComponent(decodedTag)}`,
        { mode: "cors" }
      );
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      setPostData(data.records);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage, decodedTag]);

  const handlePageChange = (event, value) => {
    navigate(`/tag/${tag}/${value}`);
    window.scrollTo(0, 0);
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
        <title>{`VipMilfNut ${decodedTag} videos`}</title>
        <link
          rel="canonical"
          href={`https://vipmilfnut.com/tag/${tag}/${currentPage === 1 ? "" : currentPage}`}
        />
        <meta
          name="description"
          content={`Watch premium ${decodedTag} videos on VipMilfNut.`}
        />
      </Helmet>
      <Sidebar onSearch={() => {}} />
      <Slider />
      <div style={{ width: "95%", margin: "auto" }}>
        <h1
          style={{ fontSize: "18px", textAlign: "center", marginTop: "10px" }}
        >
          {decodedTag} Videos
        </h1>

        <SmartLinkBanner />
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="row row-cols-2 row-cols-md-3 g-2">
          {postData.map((post) => (
            <div className="col" key={post._id}>
              <Link
                onClick={() => handleCardClick(post._id, post.views)}
                style={{ textDecoration: "none" }}
                to={`/video/${post._id}`}
              >
                <div className="card">
                  <img
                    loading="lazy"
                    style={{ height: "250px" }}
                    src={post.imageUrl}
                    className="card-img-top card-img"
                    alt={post.altKeywords?.trim() || post.titel}
                  />
                  <div className="card-body p-2">
                    <h2
                      className="card-title"
                      style={{ fontSize: "13px", margin: 0, padding: 0 }}
                    >
                      {post.titel.length > 30
                        ? `${post.titel.substring(0, 30)}...`
                        : post.titel}
                    </h2>
                    <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                      <p>
                        <i className="bi bi-eye-fill"></i> {post.views || 2}K+
                      </p>
                      <p>
                        <i className="bi bi-clock-fill"></i> {post.minutes}
                      </p>
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

      <Footer />
    </>
  );
}

export default TagPage;
