import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import "./Video.css";
import Sidebar from "../partials/Navbar";
import Slider from "../partials/Slider";
import SmartLinkBanner from "../partials/SmartLinkBanner";

const apiUrl = process.env.REACT_APP_API_URL || "";

function Video() {
    const [videoData, setVideoData] = useState({});
    const [postdata, setPostData] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isFullDescVisible, setIsFullDescVisible] = useState(false);
    const [setSearch] = useState(""); // Search query

    const navigate = useNavigate();
    
    const { id } = useParams();
    const numericId = id.split("-")[0];

    const slugifyTitle = (title) => {
        if (!title) return ""; // Prevents errors if title is undefined
        return title
            .toLowerCase()
            .trim()
            .replace(/\s+/g, "-") // Replace spaces with hyphens
            .replace(/[^a-z0-9-]/g, ""); // Remove special characters
    };

    const fetchPostData = async (search = "", page = 1, limit = 16) => {
        try {
            setIsLoading(true);
            const response = await fetch(
                `${apiUrl}/relatedpostData?search=${search}&page=${page}&limit=${limit}`,
                { mode: "cors" }
            );
            if (!response.ok) throw new Error("Failed to fetch post data");

            const data = await response.json();
            setPostData((prev) => (page === 1 ? data.records : [...prev, ...data.records]));
            setTotalRecords(data.totalRecords);
            setCurrentPage(data.currentPage);
        } catch (error) {
            console.error("Error fetching post data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });

        const fetchVideoData = async () => {
    try {
        const response = await fetch(`${apiUrl}/getVideo/${numericId}`, {
            method: "POST",
        });

        if (!response.ok) throw new Error("Failed to fetch video details");

        const data = await response.json();

        if (!data || Object.keys(data).length === 0) {
            // Redirect to NotFound page if data is empty
            navigate("/notfound", { replace: true });
            return;
        }

        setVideoData(data);
        fetchPostData(data.titel, 1);
    } catch (error) {
        console.error("Error fetching video details:", error);
        navigate("/notfound", { replace: true }); // Redirect in case of error
    }
};
        fetchVideoData();
    }, [numericId]);

    const loadMorePosts = () => {
        fetchPostData(videoData.titel, currentPage + 1);
    };

    const toggleDescription = () => {
        setIsFullDescVisible(!isFullDescVisible);
    };

    const titleText = `${videoData?.titel || ""}`;
    const truncatedTitle = titleText.length > 60 ? titleText.slice(0, 57) + "..." : titleText;
    useEffect(() => {
        document.title = videoData?.titel || "New sex videos";
    
        const setOrCreateMeta = (attrName, attrValue, content) => {
            let element = document.querySelector(`[${attrName}='${attrValue}']`);
            if (element) {
                element.setAttribute("content", content);
            } else {
                element = document.createElement("meta");
                element.setAttribute(attrName, attrValue);
                element.setAttribute("content", content);
                document.head.appendChild(element);
            }
        };
    
        setOrCreateMeta("name", "description", videoData.desc || "New sex videos on comxxx");
    
        // Open Graph meta tags
        setOrCreateMeta("property", "og:type", "video.other");
        setOrCreateMeta("property", "og:title", videoData.titel || "New sex videos");
        setOrCreateMeta("property", "og:description", videoData.desc || "New sex videos on comxxx");
        setOrCreateMeta("property", "og:image", videoData.imageUrl || "https://vipmilfnut.com/default.jpg");
        setOrCreateMeta("property", "og:url", `https://vipmilfnut.com/video/${numericId}`);
        setOrCreateMeta("property", "og:site_name", "VipMilfNut");
    
        // Twitter Card meta tags
        setOrCreateMeta("name", "twitter:card", "summary_large_image");
        setOrCreateMeta("name", "twitter:title", videoData.titel || "New sex videos");
        setOrCreateMeta("name", "twitter:description", videoData.desc || "New sex videos on comxxx");
        setOrCreateMeta("name", "twitter:image", videoData.imageUrl || "https://vipmilfnut.com/default.jpg");
    
        // Canonical link
        const canonicalHref = `https://vipmilfnut.com/video/${numericId}`;
        const canonicalLink = document.querySelector("link[rel='canonical']");
        if (canonicalLink) {
            canonicalLink.setAttribute("href", canonicalHref);
        } else {
            const newCanonical = document.createElement("link");
            newCanonical.rel = "canonical";
            newCanonical.href = canonicalHref;
            document.head.appendChild(newCanonical);
        }
    }, [videoData, numericId]);
    


    const handleCardClick = async (id, currentViews) => {
        try {
          const updatedViews = (currentViews || 0) + 1;
          const updatedPosts = postdata.map((item) =>
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
                
                <meta name="robots" content="index, follow" />
                <meta property="og:type" content="video.other" />
    <meta property="og:title" content={videoData?.titel || "New sex videos"} />
    <meta property="og:description" content={videoData?.desc || "New sex videos on comxxx"} />
    <meta property="og:image" content={videoData?.imageUrl} />
    <meta property="og:url" content={`https://vipmilfnut.com/video/${numericId}`} />
    <meta property="og:site_name" content="VipMilfNut" />

    {/* Twitter Card */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={videoData?.titel || "New sex videos"} />
    <meta name="twitter:description" content={videoData?.desc || "New sex videos on comxxx"} />
    <meta name="twitter:image" content={videoData?.imageUrl} />
            </Helmet>

            <Sidebar onSearch={(query) => setSearch(query)} />
            <Slider />

            <Link style={{ textDecoration: "none" }} to={videoData.link}>
                <div className="custom-video-container">
                    <img
                        loading="lazy"
                        src={videoData.imageUrl}
                        className="custom-video-thumbnail"
                        alt={videoData.altKeywords?.trim() ? videoData.altKeywords : videoData.title}
                    />
                    <div className="custom-play-button">
                        <span className="custom-play-icon">▶</span>
                    </div>
                </div>
            </Link>

            <div className="video-desc">
                <h1 className="custom-video-title">{videoData.titel}</h1>
                <div className="d-flex flex-wrap">
                    {Array.isArray(videoData.name) ? (
                        videoData.name.map((name, index) => (
                            <Link key={index} to={`/pornstar/${name}`}>
                                <h2 className="pornstar-name">
                                <i class="bi bi-star-fill"></i> {name.replace(/-/g, " ")}
                                </h2>
                            </Link>
                        ))
                    ) : (
                        <h2> PornStars: {videoData.name} </h2>
                    )}
                </div>

                <h3>
                    {isFullDescVisible ? videoData.desc : `${videoData.desc?.slice(0, 210)}...`}
                </h3>
                {videoData.desc?.length > 150 && (
                    <button className="view-more-btn" onClick={toggleDescription}>
                        {isFullDescVisible ? "Less^^" : "More>>"}
                    </button>
                )}
            </div>


            <div className="related-posts">
                <h3 className="mt-4">Related Videos</h3>
                <div className="row row-cols-1 row-cols-md-4 g-4 mt-0 m-auto">
                    {postdata.map((post, idx) => (
                        <React.Fragment key={post._id}>
                            {/* Video Card */}
                            <div className="col" key={post._id}>
                                <Link
                                    onClick={() => handleCardClick(post._id, post.views)}
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
                                                    <i className="bi bi-eye-fill"></i> {post.views || 2}K+ ..
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

                {postdata.length < totalRecords && !isLoading && (
                    <div className="text-center mt-4">
                        <button className="load-more-btn" onClick={loadMorePosts}>Load More...</button>
                    </div>
                )}

                {isLoading && <div className="text-center">Loading...</div>}
            </div>
        </>
    );
}

export default Video;
