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

  // Update page metadata and structured data
  useEffect(() => {
    // SEO optimized title (around 56 characters)
    const displayTag = urlTag.replace(/-/g, ' '); // Convert dashes to spaces
    const capitalizedTag = displayTag.charAt(0).toUpperCase() + displayTag.slice(1);
    document.title = `Full ${capitalizedTag} Porn Videos & xxbrits Porn videos VipMilfNut`;

    // SEO optimized description (around 119 characters)
    const metaDescContent = `${capitalizedTag} porn videos collection for 18+ adults. ✔ Free Full Access ✔ Tons Of Movies ✔ 100% Hot sex18 Content ☛ Enjoy NOW!`;

    // Update meta description
    const metaDesc = document.querySelector("meta[name='description']");
    if (metaDesc) {
      metaDesc.setAttribute("content", metaDescContent);
    } else {
      const newMeta = document.createElement("meta");
      newMeta.name = "description";
      newMeta.content = metaDescContent;
      document.head.appendChild(newMeta);
    }

    // Update canonical URL
    const canonicalUrl = `https://vipmilfnut.com/tag/${tag}`;
    const canonicalLink = document.querySelector("link[rel='canonical']");
    if (canonicalLink) {
      canonicalLink.setAttribute("href", canonicalUrl);
    } else {
      const newCanonical = document.createElement("link");
      newCanonical.rel = "canonical";
      newCanonical.href = canonicalUrl;
      document.head.appendChild(newCanonical);
    }

    // Add Open Graph tags
    const ogTags = [
      { property: 'og:title', content: `⬤ Full ${capitalizedTag} Porn Videos & xxbrits Porn videos ⬤ VipMilfNut` },
      { property: 'og:description', content: metaDescContent },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'VipMilfNut' },
      { property: 'og:locale', content: 'en_US' }
    ];

    ogTags.forEach(tag => {
      let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (metaTag) {
        metaTag.setAttribute("content", tag.content);
      } else {
        const newMeta = document.createElement("meta");
        newMeta.setAttribute("property", tag.property);
        newMeta.setAttribute("content", tag.content);
        document.head.appendChild(newMeta);
      }
    });

    // Add Twitter Card tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: `⬤ Full ${capitalizedTag} Porn Videos & xxbrits Porn videos ⬤ VipMilfNut` },
      { name: 'twitter:description', content: metaDescContent },
      { name: 'twitter:site', content: '@vipmilfnut' }
    ];

    twitterTags.forEach(tag => {
      let metaTag = document.querySelector(`meta[name="${tag.name}"]`);
      if (metaTag) {
        metaTag.setAttribute("content", tag.content);
      } else {
        const newMeta = document.createElement("meta");
        newMeta.setAttribute("name", tag.name);
        newMeta.setAttribute("content", tag.content);
        document.head.appendChild(newMeta);
      }
    });

    // Add additional SEO meta tags
    const additionalTags = [
      { name: 'keywords', content: `${capitalizedTag}, ${capitalizedTag} porn, ${capitalizedTag} videos, adult content, free porn, sex videos, xxx movies` },
      { name: 'author', content: 'VipMilfNut' },
      { name: 'robots', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
      { name: 'language', content: 'English' },
      { name: 'revisit-after', content: '1 days' },
      { name: 'distribution', content: 'global' },
      { name: 'rating', content: 'adult' },
      { name: 'classification', content: 'adult content' }
    ];

    additionalTags.forEach(tag => {
      let metaTag = document.querySelector(`meta[name="${tag.name}"]`);
      if (metaTag) {
        metaTag.setAttribute("content", tag.content);
      } else {
        const newMeta = document.createElement("meta");
        newMeta.setAttribute("name", tag.name);
        newMeta.setAttribute("content", tag.content);
        document.head.appendChild(newMeta);
      }
    });

    // Add structured data (JSON-LD)
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${capitalizedTag} Porn Videos`,
      "description": metaDescContent,
      "url": canonicalUrl,
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
      }
    };

    // Remove existing structured data script
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data script
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

  }, [urlTag, currentPage, tag, postData]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all pages to get complete dataset
      let allRecords = [];
      let currentPageNum = 1;
      let hasMoreData = true;
      
      while (hasMoreData) {
        const response = await fetch(
          `${apiUrl}/getpostdata?page=${currentPageNum}&limit=1000`,
          { mode: "cors" }
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        
        if (data.records && data.records.length > 0) {
          allRecords = [...allRecords, ...data.records];
          currentPageNum++;
          // Stop if we've fetched all pages
          if (data.records.length < 1000 || currentPageNum > 20) {
            hasMoreData = false;
          }
        } else {
          hasMoreData = false;
        }
      }
      
      // console.log(`Total records fetched: ${allRecords.length}`);
      
      // Filter posts where tags array includes the decodedTag (case-insensitive, space/hyphen tolerant)
      const normalizeTag = (tag) =>
        tag && tag.trim().toLowerCase().replace(/\s+/g, "-");

      const filteredRecords = allRecords.filter(
        post =>
          Array.isArray(post.tags) &&
          post.tags.some(
            t => normalizeTag(t) === urlTag
          )
      );
      
      // console.log(`Filtered records for tag "${urlTag}": ${filteredRecords.length}`);
      
      setAllFilteredRecords(filteredRecords);
      // Pagination logic
      const totalFiltered = filteredRecords.length;
      const paginatedRecords = filteredRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
      setPostData(paginatedRecords);
      setTotalPages(Math.max(1, Math.ceil(totalFiltered / itemsPerPage)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        <title>{`⬤ Full ${urlTag.replace(/-/g, ' ').charAt(0).toUpperCase() + urlTag.replace(/-/g, ' ').slice(1)} Porn Videos & xxbrits Porn videos ⬤ VipMilfNut`}</title>
        <link
          rel="canonical"
          href={`https://vipmilfnut.com/tag/${tag}`}
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
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={`⬤ Full ${urlTag.replace(/-/g, ' ').charAt(0).toUpperCase() + urlTag.replace(/-/g, ' ').slice(1)} Porn Videos & xxbrits Porn videos ⬤ VipMilfNut`} />
        <meta property="og:description" content={`${urlTag.replace(/-/g, ' ').charAt(0).toUpperCase() + urlTag.replace(/-/g, ' ').slice(1)} porn videos collection for 18+ adults. ✔ Free Full Access ✔ Tons Of Movies ✔ 100% Hot sex18 Content ☛ Enjoy NOW!`} />
        <meta property="og:url" content={`https://vipmilfnut.com/tag/${tag}`} />
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
            "url": `https://vipmilfnut.com/tag/${tag}`,
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
            }
          })}
        </script>
      </Helmet>
      <Sidebar onSearch={() => {}} />
      <div style={{ width: "95%", margin: "auto" }}>
        <h1
          style={{ fontSize: "18px", textAlign: "center", marginTop: "10px", textTransform:"capitalize"}}
        >
          {urlTag.replace(/-/g, ' ')} full sex videos
        </h1>

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
                        <i className="bi bi-eye-fill"></i> {post.views || 2}
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

        {/* SEO-friendly content section */}
        <div style={{ margin: "20px 0", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
          <h2 style={{ fontSize: "16px", marginBottom: "10px", color: "#333" }}>
            {urlTag.replace(/-/g, ' ').charAt(0).toUpperCase() + urlTag.replace(/-/g, ' ').slice(1)} Porn Videos Collection
          </h2>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#666", margin: 0 }}>
            Discover the hottest {urlTag.replace(/-/g, ' ')} porn videos on VipMilfNut. Our collection features high-quality adult content with the best {urlTag.replace(/-/g, ' ')} scenes. 
            Browse through our extensive library of free {urlTag.replace(/-/g, ' ')} videos and enjoy unlimited streaming.
          </p>
        </div>

        {/* FAQ Section for SEO */}
        <div style={{ margin: "20px 0", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
          <h3 style={{ fontSize: "16px", marginBottom: "15px", color: "#333" }}>Frequently Asked Questions</h3>
          <div style={{ marginBottom: "10px" }}>
            <h4 style={{ fontSize: "14px", marginBottom: "5px", color: "#555" }}>What are {urlTag.replace(/-/g, ' ')} porn videos?</h4>
            <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>
              {urlTag.replace(/-/g, ' ').charAt(0).toUpperCase() + urlTag.replace(/-/g, ' ').slice(1)} porn videos feature adult content focused on {urlTag.replace(/-/g, ' ')} scenes and scenarios.
            </p>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <h4 style={{ fontSize: "14px", marginBottom: "5px", color: "#555" }}>Are these videos free to watch?</h4>
            <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>
              Yes, all {urlTag.replace(/-/g, ' ')} videos on VipMilfNut are completely free to watch without any registration required.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: "14px", marginBottom: "5px", color: "#555" }}>How often is new content added?</h4>
            <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>
              We regularly update our {urlTag.replace(/-/g, ' ')} video collection with fresh content to provide the best adult entertainment experience.
            </p>
          </div>
        </div>

      </div>
      <Footer />
    </>
  );
}

export default TagPage;
