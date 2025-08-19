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
  const urlPage = parseInt(page) || 1;
  const [currentPage, setCurrentPage] = useState(urlPage);

  // Convert slug back to readable tag (e.g., "cum-in-pussy" => "cum in pussy")
  const urlTag = (tag || "").toLowerCase();



  const [postData, setPostData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 16;
  const [allFilteredRecords, setAllFilteredRecords] = useState([]);
  const [uniqueTagsFromPage, setUniqueTagsFromPage] = useState([]); // Store unique tags from current page
  const [tagSpecificPornstars, setTagSpecificPornstars] = useState([]); // Store unique pornstars from this tag
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const navigate = useNavigate();

  // Redirect canonical root handling
  useEffect(() => {
    if (currentPage === 1 && window.location.pathname !== `/tag/${tag}`) {
      navigate(`/tag/${tag}`);
    }
  }, [currentPage, navigate, tag]);

  // Sync currentPage with URL param
  useEffect(() => {
    setCurrentPage(urlPage);
  }, [urlPage]);

  // Handle window resize for responsive image height
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Manually set meta tags as fallback for React Helmet issues
  useEffect(() => {
    const capitalizedTag = urlTag.replace(/-/g, ' ').charAt(0).toUpperCase() + urlTag.replace(/-/g, ' ').slice(1);
    const dynamicDescription = `${capitalizedTag} porn videos collection for 18+ adults. ✔ Free Full Access ✔ Tons Of Movies ✔ 100% Hot sex18 Content ☛ Enjoy NOW!`;
    const dynamicKeywords = `${capitalizedTag}, ${capitalizedTag} porn, ${capitalizedTag} videos, adult content, free porn, sex videos, xxx movies`;
    const canonicalUrl = currentPage === 1 ? `https://vipmilfnut.com/tag/${tag}` : `https://vipmilfnut.com/tag/${tag}/${currentPage}`;

    // Set description
    let metaDesc = document.querySelector("meta[name='description']");
    if (metaDesc) {
      metaDesc.setAttribute("content", dynamicDescription);
    } else {
      metaDesc = document.createElement("meta");
      metaDesc.name = "description";
      metaDesc.content = dynamicDescription;
      metaDesc.setAttribute("data-dynamic", "true");
      document.head.appendChild(metaDesc);
    }

    // Set keywords
    let metaKeywords = document.querySelector("meta[name='keywords']");
    if (metaKeywords) {
      metaKeywords.setAttribute("content", dynamicKeywords);
    } else {
      metaKeywords = document.createElement("meta");
      metaKeywords.name = "keywords";
      metaKeywords.content = dynamicKeywords;
      metaKeywords.setAttribute("data-dynamic", "true");
      document.head.appendChild(metaKeywords);
    }

    // Set canonical URL
    let canonical = document.querySelector("link[rel='canonical']");
    if (canonical) {
      canonical.setAttribute("href", canonicalUrl);
    } else {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      canonical.href = canonicalUrl;
      canonical.setAttribute("data-dynamic", "true");
      document.head.appendChild(canonical);
    }

    // Cleanup function
    return () => {
      const dynamicTags = document.querySelectorAll('[data-dynamic="true"]');
      dynamicTags.forEach(tag => tag.remove());
    };
  }, [urlTag, currentPage, tag]);

  // Clean up any existing dynamic meta tags on unmount
  useEffect(() => {
    return () => {
      // Cleanup function to remove any dynamically added tags
      const dynamicTags = document.querySelectorAll('meta[data-dynamic="true"]');
      dynamicTags.forEach(tag => tag.remove());
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {

      
      // Use optimized API endpoint for posts by tag
      const response = await fetch(
        `${apiUrl}/tags/${encodeURIComponent(urlTag)}/posts?page=${currentPage}&limit=${itemsPerPage}`,
        { mode: "cors" }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts for tag: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch tag posts');
      }
      

      
      // Set the fetched data
      setPostData(data.records || []);
      setTotalPages(data.totalPages || 1);
      
      // Fetch metadata (unique tags and pornstars) separately for better performance
      fetchTagMetadata();
      
    } catch (err) {
      console.error('❌ TagPage: Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Separate function to fetch tag metadata (unique tags and pornstars)
  const fetchTagMetadata = async () => {
    try {

      
      const response = await fetch(
        `${apiUrl}/tags/${encodeURIComponent(urlTag)}/metadata`,
        { mode: "cors" }
      );
      
      if (!response.ok) {
        console.warn('Failed to fetch tag metadata, using fallback');
        return;
      }
      
      const data = await response.json();
      
      if (data.success) {
        setUniqueTagsFromPage(data.uniqueTags || []);
        setTagSpecificPornstars(data.uniquePornstars || []);

      }
      
    } catch (err) {
      console.warn('TagPage: Error fetching metadata:', err);
      // Metadata fetch failure is not critical, continue without it
    }
  };

  useEffect(() => {
    fetchData();
  }, [urlTag, currentPage]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    navigate(`/tag/${tag}/${value}`);
    window.scrollTo(0, 0);
  };

  const slugifyTitle = (title) =>
    title.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const formatDuration = (minutes, videoId) => {
    if (!minutes || minutes === 0) return "00:00";
    
    const totalMinutes = parseInt(minutes);
    
    // Generate consistent random seconds based on videoId
    const generateRandomSeconds = (id) => {
      if (!id) return 0;
      // Use video ID to generate consistent random seconds (0-59)
      let hash = 0;
      for (let i = 0; i < id.length; i++) {
        const char = id.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash) % 60;
    };
    
    const seconds = generateRandomSeconds(videoId);
    
    if (totalMinutes < 60) {
      // For videos under 60 minutes, show as MM:SS format
      return `${totalMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      // For videos 60+ minutes, show as HH:MM:SS format
      const hours = Math.floor(totalMinutes / 60);
      const remainingMinutes = totalMinutes % 60;
      return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
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
        <title>{`Tranding ${urlTag.replace(/-/g, ' ').charAt(0).toUpperCase() + urlTag.replace(/-/g, ' ').slice(1)} Sex Videos Free on VipMilfNut.com`}</title>
        <link
          rel="canonical"
          href={currentPage === 1 ? `https://vipmilfnut.com/tag/${tag}` : `https://vipmilfnut.com/tag/${tag}/${currentPage}`}
        />
        <meta
          name="description"
          content={`${urlTag.replace(/-/g, ' ').charAt(0).toUpperCase() + urlTag.replace(/-/g, ' ').slice(1)} porn videos collection for 18+ adults. ✔ Free Full Access ✔ Tons Of Movies ✔ 100% Hot sex18 Content ☛ Enjoy NOW!`}
        />
        <meta
          name="keywords"
          content={`${urlTag.replace(/-/g, ' ').charAt(0).toUpperCase() + urlTag.replace(/-/g, ' ').slice(1)}, ${urlTag.replace(/-/g, ' ').charAt(0).toUpperCase() + urlTag.replace(/-/g, ' ').slice(1)} porn, ${urlTag.replace(/-/g, ' ').charAt(0).toUpperCase() + urlTag.replace(/-/g, ' ').slice(1)} videos, adult content, free porn, sex videos, xxx movies`}
        />
        <meta name="author" content="VipMilfNut" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="1 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="adult" />
        <meta name="classification" content="adult content" />
        
        {/* Pagination Navigation Links */}
        {currentPage > 1 && (
          <link rel="prev" href={currentPage === 2 ? `https://vipmilfnut.com/tag/${tag}` : `https://vipmilfnut.com/tag/${tag}/${currentPage - 1}`} />
        )}
        {currentPage < totalPages && (
          <link rel="next" href={`https://vipmilfnut.com/tag/${tag}/${currentPage + 1}`} />
        )}
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={`⬤ Full ${urlTag.replace(/-/g, ' ').charAt(0).toUpperCase() + urlTag.replace(/-/g, ' ').slice(1)} Porn Videos & xxbrits Porn videos ⬤ VipMilfNut`} />
        <meta property="og:description" content={`${urlTag.replace(/-/g, ' ').charAt(0).toUpperCase() + urlTag.replace(/-/g, ' ').slice(1)} porn videos collection for 18+ adults. ✔ Free Full Access ✔ Tons Of Movies ✔ 100% Hot sex18 Content ☛ Enjoy NOW!`} />
        <meta property="og:url" content={currentPage === 1 ? `https://vipmilfnut.com/tag/${tag}` : `https://vipmilfnut.com/tag/${tag}/${currentPage}`} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="VipMilfNut" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`⬤ Full ${urlTag.replace(/-/g, ' ').charAt(0).toUpperCase() + urlTag.replace(/-/g, ' ').slice(1)} Porn Videos & xxbrits Porn videos ⬤ VipMilfNut`} />
        <meta name="twitter:description" content={`${urlTag.replace(/-/g, ' ').charAt(0).toUpperCase() + urlTag.replace(/-/g, ' ').slice(1)} porn videos collection for 18+ adults. ✔ Free Full Access ✔ Tons Of Movies ✔ 100% Hot sex18 Content ☛ Enjoy NOW!`} />
        <meta name="twitter:site" content="@vipmilfnut" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": `${urlTag.replace(/-/g, ' ').charAt(0).toUpperCase() + urlTag.replace(/-/g, ' ').slice(1)} Porn Videos`,
            "description": `${urlTag.replace(/-/g, ' ').charAt(0).toUpperCase() + urlTag.replace(/-/g, ' ').slice(1)} porn videos collection for 18+ adults. ✔ Free Full Access ✔ Tons Of Movies ✔ 100% Hot sex18 Content ☛ Enjoy NOW!`,
            "url": currentPage === 1 ? `https://vipmilfnut.com/tag/${tag}` : `https://vipmilfnut.com/tag/${tag}/${currentPage}`,
            "mainEntity": {
              "@type": "ItemList",
              "itemListElement": postData.map((post, index) => ({
                "@type": "VideoObject",
                "position": index + 1,
                "name": post.titel,
                "description": post.altKeywords || post.titel,
                "thumbnailUrl": post.imageUrl,
                "url": `https://vipmilfnut.com/video/${post._id}`,
                "duration": `PT${post.minutes}M`,
                "uploadDate": post.createdAt || new Date().toISOString(),
                "interactionStatistic": {
                  "@type": "InteractionCounter",
                  "interactionType": "https://schema.org/WatchAction",
                  "userInteractionCount": post.views || 0
                }
              }))
            },
            "publisher": {
              "@type": "Organization",
              "name": "VipMilfNut",
              "url": "https://vipmilfnut.com"
            },
            "pagination": {
              "@type": "PaginationInfo",
              "currentPage": currentPage,
              "totalPages": totalPages,
              "itemsPerPage": itemsPerPage,
              ...(currentPage > 1 && {
                "previousPage": currentPage === 2 ? `https://vipmilfnut.com/tag/${tag}` : `https://vipmilfnut.com/tag/${tag}/${currentPage - 1}`
              }),
              ...(currentPage < totalPages && {
                "nextPage": `https://vipmilfnut.com/tag/${tag}/${currentPage + 1}`
              })
            }
          })}
        </script>
      </Helmet>
      <Sidebar onSearch={() => {}} />
      <div style={{ width: "100%", margin: "auto" }}>
        <h1
          style={{ fontSize: "18px", textAlign: "center", marginTop: "10px", textTransform:"capitalize"}}
        >
          {urlTag.replace(/-/g, ' ')} full sex videos
        </h1>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="row row-cols-2 row-cols-md-3 g-1">
          {postData.map((post) => (
            <div className="col" key={post._id}>
              <Link
                onClick={() => handleCardClick(post._id, post.views)}
                style={{ textDecoration: "none" }}
                to={`/video/${post._id}`}
              >
                <div className="card" style={{ position: "relative", border: "none" }}>
                  <img
                    loading="lazy"
                    style={{ 
                      height: windowWidth <= 460 ? "150px" : "250px", 
                      width: "100%", 
                      objectFit: "cover"
                    }}
                    src={post.imageUrl}
                    className="card-img-top card-img"
                    alt={post.altKeywords?.trim() || post.titel}
                  />
                  {/* Duration overlay - bottom right corner */}
                  <div style={{
                    position: "absolute",
                    bottom: "0px",
                    right: "0px",
                    backgroundColor: "rgba(0, 0, 0, 0.75)",
                    color: "white",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px"
                  }}>
{formatDuration(post.minutes, post._id)}
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

        {/* Enhanced SEO Content Section */}
        <div style={{ margin: "20px 0", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
          <h2 style={{ fontSize: "18px", marginBottom: "15px", color: "#333", fontWeight: "600" }}>
            Premium {urlTag.replace(/-/g, ' ').charAt(0).toUpperCase() + urlTag.replace(/-/g, ' ').slice(1)} Porn Videos - Page {currentPage}
          </h2>
          <p style={{ fontSize: "15px", lineHeight: "1.7", color: "#555", marginBottom: "15px" }}>
            Welcome to our exclusive collection of {urlTag.replace(/-/g, ' ')} adult videos on page {currentPage}. 
            VipMilfNut offers premium quality {urlTag.replace(/-/g, ' ')} content featuring top performers and high-definition streaming. 
            Our curated selection ensures you get the best {urlTag.replace(/-/g, ' ')} entertainment experience with fast loading and crystal clear video quality.
          </p>
          
          {currentPage > 1 && (
            <div style={{ marginBottom: "15px", padding: "10px", backgroundColor: "#e9ecef", borderRadius: "5px" }}>
              <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
                <strong>Page {currentPage} Content:</strong> This page contains videos {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, postData.length + ((currentPage - 1) * itemsPerPage))} 
                from our {urlTag.replace(/-/g, ' ')} collection. Each page is carefully organized to provide diverse content and optimal browsing experience.
              </p>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "15px", marginTop: "15px" }}>
            <div>
              <h3 style={{ fontSize: "16px", marginBottom: "8px", color: "#444" }}>Video Quality</h3>
              <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
                All {urlTag.replace(/-/g, ' ')} videos are available in HD quality with optimized streaming for all devices.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: "16px", marginBottom: "8px", color: "#444" }}>Content Variety</h3>
              <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
                Our {urlTag.replace(/-/g, ' ')} category features diverse scenarios and top-rated performers from around the world.
              </p>
            </div>
            <div>
              <h3 style={{ fontSize: "16px", marginBottom: "8px", color: "#444" }}>Free Access</h3>
              <p style={{ fontSize: "14px", color: "#666", margin: 0 }}>
                Enjoy unlimited access to all {urlTag.replace(/-/g, ' ')} videos without registration or hidden fees.
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced FAQ Section */}
        <div style={{ margin: "20px 0", padding: "20px", backgroundColor: "#fff", border: "1px solid #e9ecef", borderRadius: "8px" }}>
          <h3 style={{ fontSize: "18px", marginBottom: "20px", color: "#333", fontWeight: "600" }}>
            {urlTag.replace(/-/g, ' ').charAt(0).toUpperCase() + urlTag.replace(/-/g, ' ').slice(1)} Videos - Frequently Asked Questions
          </h3>
          
          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ fontSize: "16px", marginBottom: "8px", color: "#444", fontWeight: "500" }}>
              What makes our {urlTag.replace(/-/g, ' ')} collection special?
            </h4>
            <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6", margin: 0 }}>
              Our {urlTag.replace(/-/g, ' ')} video collection stands out due to its high-quality content, diverse performers, and regular updates. 
              We carefully curate each video to ensure premium entertainment value and optimal viewing experience across all devices.
            </p>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ fontSize: "16px", marginBottom: "8px", color: "#444", fontWeight: "500" }}>
              How often do you add new {urlTag.replace(/-/g, ' ')} videos?
            </h4>
            <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6", margin: 0 }}>
              We update our {urlTag.replace(/-/g, ' ')} category daily with fresh content from top studios and independent creators. 
              This ensures our users always have access to the latest and most popular {urlTag.replace(/-/g, ' ')} videos in the industry.
            </p>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <h4 style={{ fontSize: "16px", marginBottom: "8px", color: "#444", fontWeight: "500" }}>
              Can I watch {urlTag.replace(/-/g, ' ')} videos on mobile devices?
            </h4>
            <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6", margin: 0 }}>
              Yes, all our {urlTag.replace(/-/g, ' ')} videos are fully optimized for mobile viewing. 
              Our responsive design ensures smooth playback on smartphones, tablets, and desktop computers with adaptive quality streaming.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: "16px", marginBottom: "8px", color: "#444", fontWeight: "500" }}>
              Are there different categories within {urlTag.replace(/-/g, ' ')} videos?
            </h4>
            <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6", margin: 0 }}>
              Our {urlTag.replace(/-/g, ' ')} section includes various subcategories and related tags to help you find exactly what you're looking for. 
              Use our advanced filtering system to discover content that matches your specific preferences within the {urlTag.replace(/-/g, ' ')} category.
            </p>
          </div>
        </div>

      </div>
      <Footer pageTags={uniqueTagsFromPage} tagPornstars={tagSpecificPornstars} />
    </>
  );
}

export default TagPage;
