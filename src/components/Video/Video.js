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
    
    // Helper function to convert dashes to spaces for display
    const displayText = (text) => {
        return text.replace(/-/g, ' ');
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
        
        // Update URL to include video title after ID
        if (data.titel) {
            const slugifiedTitle = slugifyTitle(data.titel);
            const newUrl = `/video/${numericId}-${slugifiedTitle}`;
            // Only update if the current URL doesn't already have the title
            if (window.location.pathname !== newUrl) {
                window.history.replaceState(null, '', newUrl);
            }
        }
        
        // Fetch related videos based on both tags and star names
        let searchQuery = [];
        
        // Add tags to search query
        if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
            searchQuery = [...searchQuery, ...data.tags];
        }
        
        // Add star names to search query (clean up hyphens and format)
        if (data.name && Array.isArray(data.name) && data.name.length > 0) {
            const cleanedNames = data.name.map(name => 
                name.replace(/-/g, ' ').trim() // Replace hyphens with spaces
            );
            searchQuery = [...searchQuery, ...cleanedNames];
        }
        
        // Create final query string or fallback to title
        const finalQuery = searchQuery.length > 0 
            ? searchQuery.join(' ') 
            : data.titel; // Fallback to title if no tags or names
            
        // Debug: Log the search query to console
        console.log('Related videos search query:', finalQuery);
        console.log('Video data tags:', data.tags);
        console.log('Video data names:', data.name);
            
        fetchPostData(finalQuery, 1);
    } catch (error) {
        console.error("Error fetching video details:", error);
        navigate("/notfound", { replace: true }); // Redirect in case of error
    }
};
        fetchVideoData();
    }, [numericId]);

    const loadMorePosts = () => {
        // Use both tags and star names for loading more posts
        let searchQuery = [];
        
        // Add tags to search query
        if (videoData.tags && Array.isArray(videoData.tags) && videoData.tags.length > 0) {
            searchQuery = [...searchQuery, ...videoData.tags];
        }
        
        // Add star names to search query (clean up hyphens and format)
        if (videoData.name && Array.isArray(videoData.name) && videoData.name.length > 0) {
            const cleanedNames = videoData.name.map(name => 
                name.replace(/-/g, ' ').trim() // Replace hyphens with spaces
            );
            searchQuery = [...searchQuery, ...cleanedNames];
        }
        
        // Create final query string or fallback to title
        const finalQuery = searchQuery.length > 0 
            ? searchQuery.join(' ') 
            : videoData.titel; // Fallback to title if no tags or names
            
        fetchPostData(finalQuery, currentPage + 1);
    };

    const toggleDescription = () => {
        setIsFullDescVisible(!isFullDescVisible);
    };

    const titleText = `${videoData?.titel || ""}`;
    const truncatedTitle = titleText.length > 60 ? titleText.slice(0, 57) + "..." : titleText;

    useEffect(() => {
        document.title = videoData?.titel ? `${videoData.titel} | VipMilfNut` : "VipMilfNut";

        // Override robots meta tag to noindex for video pages
        const existingRobotsTag = document.querySelector('meta[name="robots"]');
        if (existingRobotsTag) {
            existingRobotsTag.setAttribute('content', 'noindex, nofollow');
        } else {
            // Create new robots meta tag if it doesn't exist
            const robotsTag = document.createElement('meta');
            robotsTag.name = 'robots';
            robotsTag.content = 'noindex, nofollow';
            document.head.appendChild(robotsTag);
        }

        // Cleanup function to restore original robots tag when component unmounts
        return () => {
            const robotsTag = document.querySelector('meta[name="robots"]');
            if (robotsTag) {
                robotsTag.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
            }
        };
    }, [videoData]);

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
                <title>{videoData?.titel ? `${videoData.titel} | VipMilfNut` : "VipMilfNut"}</title>
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

            {/* Video Tags Section */}
            {videoData.tags && Array.isArray(videoData.tags) && videoData.tags.length > 0 && (
                <div className="video-tags-section" style={{ margin: '20px 0', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                    <h4 style={{ marginBottom: '15px', color: '#333', fontSize: '18px' }}>
                        <i className="bi bi-tags-fill"></i> Tags
                    </h4>
                    <div className="tags-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {videoData.tags.map((tag, index) => {
                            const slugifiedTag = tag.toLowerCase().replace(/\s+/g, "-");
                            return (
                                <Link 
                                    key={index} 
                                    to={`/tag/${slugifiedTag}`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <span 
                                        className="video-tag"
                                        style={{
                                            display: 'inline-block',
                                            padding: '6px 12px',
                                            backgroundColor: '#6c757d',
                                            color: 'white',
                                            borderRadius: '20px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            transition: 'all 0.3s ease',
                                            cursor: 'pointer',
                                            border: 'none'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = '#5a6268';
                                            e.target.style.transform = 'translateY(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = '#6c757d';
                                            e.target.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        #{displayText(tag)}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

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
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                        <div 
                                            style={{
                                                display: 'none',
                                                height: '250px',
                                                backgroundColor: '#f8f9fa',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                flexDirection: 'column',
                                                border: '2px dashed #dee2e6',
                                                color: '#6c757d',
                                                textAlign: 'center',
                                                padding: '20px'
                                            }}
                                        >
                                            <i className="bi bi-image" style={{ fontSize: '2rem', marginBottom: '10px' }}></i>
                                            <p style={{ margin: '0', fontSize: '14px', fontWeight: '500' }}>
                                               Image not found
                                            </p>
                                        </div>
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
