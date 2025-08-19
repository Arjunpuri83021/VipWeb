import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import Sidebar from "./partials/Navbar";
import Footer from "./partials/Footer";
import "./Category/category.css";

const apiUrl = process.env.REACT_APP_API_URL;

function TagsPage() {
  const [allTags, setAllTags] = useState([]);
  const [groupedTags, setGroupedTags] = useState({});
  const [expandedLetters, setExpandedLetters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Set canonical URL and meta tags
  useEffect(() => {
    // Update canonical URL
    const canonicalUrl = `https://vipmilfnut.com/tags`;
    const canonicalLink = document.querySelector("link[rel='canonical']");
    if (canonicalLink) {
      canonicalLink.setAttribute("href", canonicalUrl);
    } else {
      const newCanonical = document.createElement("link");
      newCanonical.rel = "canonical";
      newCanonical.href = canonicalUrl;
      document.head.appendChild(newCanonical);
    }
  }, []);

  // Fetch all tags from API
  useEffect(() => {
    const fetchAllTags = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiUrl}/tags?limit=1000`, { mode: "cors" });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch tags: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch tags');
        }
        
        const tagsArray = data.tags || [];
        
        // Remove duplicates (case-insensitive) and keep the first occurrence
        const uniqueTags = [];
        const seenTags = new Set();
        
        tagsArray.forEach(tag => {
          const lowerTag = tag.toLowerCase();
          if (!seenTags.has(lowerTag)) {
            seenTags.add(lowerTag);
            uniqueTags.push(tag);
          }
        });
        
        setAllTags(uniqueTags);
        
        // Group tags alphabetically
        const grouped = {};
        const expanded = {};
        uniqueTags.forEach(tag => {
          const firstLetter = tag.charAt(0).toUpperCase();
          if (!grouped[firstLetter]) {
            grouped[firstLetter] = [];
            expanded[firstLetter] = true; // Set all letters as expanded by default
          }
          grouped[firstLetter].push(tag);
        });
        
        // Sort tags within each letter group
        Object.keys(grouped).forEach(letter => {
          grouped[letter].sort((a, b) => a.localeCompare(b));
        });
        
        setGroupedTags(grouped);
        setExpandedLetters(expanded); // Set all letters as expanded
        
      } catch (err) {
        console.error('❌ TagsPage: Error fetching tags:', err);
        setError(err.message);
        
        // Fallback tags
        const fallbackTags = [
          'hardcore', 'milf', 'big-tits', 'big-boobs', 'small-tits',
          'big-ass', 'threesum', 'white', 'black', 'asian', 'latina',
          'blonde', 'brunette', 'redhead', 'teen', 'mature', 'amateur',
          'uncensored-asian', 'underwater', 'undressing', 'uniform', 'upskirt',
          'vagina-close-up', 'very-big-pussy', 'vibrator', 'vintage', 'voyeur',
          'webcam', 'wedding', 'wet', 'white-bbw', 'wife'
        ];
        
        const grouped = {};
        const expanded = {};
        fallbackTags.forEach(tag => {
          const firstLetter = tag.charAt(0).toUpperCase();
          if (!grouped[firstLetter]) {
            grouped[firstLetter] = [];
            expanded[firstLetter] = true; // Set all letters as expanded by default
          }
          grouped[firstLetter].push(tag);
        });
        
        Object.keys(grouped).forEach(letter => {
          grouped[letter].sort((a, b) => a.localeCompare(b));
        });
        
        setGroupedTags(grouped);
        setExpandedLetters(expanded); // Set all letters as expanded
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllTags();
  }, []);

  const toggleLetter = (letter) => {
    setExpandedLetters(prev => ({
      ...prev,
      [letter]: !prev[letter]
    }));
  };

  const handleTagClick = (tag) => {
    const slugifiedTag = tag.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    navigate(`/tag/${slugifiedTag}`);
  };

  const displayText = (text) => {
    return text.replace(/-/g, ' ');
  };

  return (
    <>
      <Helmet>
        <title>Best All Porn Tags - Browse by Category | VipMilfNut</title>
        <link rel="canonical" href="https://vipmilfnut.com/tags" />
        <meta
          name="description"
          content="Browse all porn video tags and categories on VipMilfNut. Find your favorite adult content by tag - organized alphabetically for easy navigation."
        />
        <meta
          name="keywords"
          content="porn tags, adult categories, sex video tags, porn categories, adult content tags, xxx categories"
        />
        <meta name="author" content="VipMilfNut" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="1 days" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="adult" />
        <meta name="classification" content="adult content" />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content="All Tags - Browse by Category | VipMilfNut" />
        <meta property="og:description" content="Browse all porn video tags and categories on VipMilfNut. Find your favorite adult content by tag - organized alphabetically for easy navigation." />
        <meta property="og:url" content="https://vipmilfnut.com/tags" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="VipMilfNut" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="All Tags - Browse by Category | VipMilfNut" />
        <meta name="twitter:description" content="Browse all porn video tags and categories on VipMilfNut. Find your favorite adult content by tag - organized alphabetically for easy navigation." />
        <meta name="twitter:site" content="@vipmilfnut" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "All Tags - Browse by Category",
            "description": "Browse all porn video tags and categories on VipMilfNut. Find your favorite adult content by tag - organized alphabetically for easy navigation.",
            "url": "https://vipmilfnut.com/tags",
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": allTags.length,
              "itemListElement": allTags.slice(0, 50).map((tag, index) => ({
                "@type": "Thing",
                "position": index + 1,
                "name": tag,
                "url": `https://vipmilfnut.com/tag/${tag.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}`
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
      
      <div style={{ width: "100%", margin: "auto", padding: "20px" }}>
        <h1 style={{ 
          fontSize: "24px", 
          textAlign: "center", 
          marginBottom: "30px",
          textTransform: "capitalize"
        }}>
          Browse Best Porn Tags
        </h1>

        {loading && (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <p>Loading tags...</p>
          </div>
        )}
        
        {error && (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <p style={{ color: "red" }}>Error: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="tags-page-container">
            {Object.keys(groupedTags).sort().map(letter => (
              <div key={letter} className="letter-section" style={{
                marginBottom: "30px"
              }}>
                <div 
                  className="letter-header"
                  style={{
                    fontWeight: 'bold',
                    fontSize: '24px',
                    marginBottom: '15px',
                    color: '#000'
                  }}
                >
                  {letter}
                </div>
                
                <div className="tags-grid" style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  justifyContent: 'flex-start'
                }}>
                    {groupedTags[letter].map((tag, index) => (
                      <div
                        key={index}
                        className="tag-card"
                        onClick={() => handleTagClick(tag)}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          border: '1px solid #e0e0e0',
                          borderRadius: '6px',
                          textTransform: 'capitalize',
                          transition: 'all 0.2s ease',
                          backgroundColor: '#fff',
                          fontSize: '14px',
                          textAlign: 'center'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#f0f8ff';
                          e.target.style.borderColor = '#007bff';
                          e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#fff';
                          e.target.style.borderColor = '#e0e0e0';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        {displayText(tag)}
                      </div>
                    ))}
                  </div>
                </div>
            ))}
          </div>
        )}

        {/* SEO Content */}
        <div style={{ 
          margin: "40px 0", 
          padding: "20px", 
          backgroundColor: "#f8f9fa", 
          borderRadius: "8px" 
        }}>
          <h2 style={{ fontSize: "18px", marginBottom: "15px", color: "#333" }}>
            Browse Porn Videos by Tags
          </h2>
          <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#666", margin: 0 }}>
            Explore our comprehensive collection of adult video tags. Each tag represents a specific category 
            or theme, making it easy to find exactly the type of content you're looking for. Click on any tag 
            to view all related videos in that category.
          </p>
        </div>
      </div>
      
      <Footer />
    </>
  );
}

export default TagsPage;
