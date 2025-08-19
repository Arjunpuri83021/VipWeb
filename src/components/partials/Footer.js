import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './footer.css';

const Footer = ({ selectedTag = null, pageTags = null, tagPornstars = null }) => {
  const location = useLocation();
  const [topTags, setTopTags] = useState([]);
  const [showAllTags, setShowAllTags] = useState(false);
  const [loading, setLoading] = useState(true);

  // Dynamic tag states for random refresh functionality
  const [allTags, setAllTags] = useState([]); // All available tags from API
  const [displayTags, setDisplayTags] = useState([]); // Currently displayed tags
  const [refreshInterval, setRefreshInterval] = useState(null);

  // Pornstar states for random refresh functionality
  const [allPornstars, setAllPornstars] = useState([]); // All available pornstars from API
  const [displayPornstars, setDisplayPornstars] = useState([]); // Currently displayed pornstars
  const [pornstarsLoading, setPornstarsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top on route change
  }, [location.pathname]);

  // Helper to slugify tags for URL
  const slugifyTag = (tag) => tag.toLowerCase().replace(/\s+/g, "-");

  // Function to get random tags from all available tags
  const getRandomTags = (tags, count = 30) => {
    if (tags.length <= count) return tags;
    const shuffled = [...tags].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Static pornstars that must always be included
  const staticPornstars = [
    'Niks Indian', 'Sunny Leone', 'Mia Khalifa', 'Dani Daniels', 'Sophia Leone',
    'Yasmina Khan', 'Alex Star', 'Blake Blossom', 'Reagan Foxx', 'Valentina Nappi', 'Natasha Nice'
  ];

  // Function to get random pornstars with static ones included
  const getRandomPornstars = (pornstars, count = 32, useTagSpecific = false) => {
    // If we have tag-specific pornstars, use them instead of global random
    if (useTagSpecific && tagPornstars && tagPornstars.length > 0) {
      // Filter out static pornstars from tag-specific pool to avoid duplicates
      const availableTagPornstars = tagPornstars.filter(star => 
        !staticPornstars.some(staticStar => 
          staticStar.toLowerCase().replace(/\s+/g, '') === star.toLowerCase().replace(/[\s-]+/g, '')
        )
      );
      
      // Use all available tag-specific pornstars (no limit since it's tag-specific)
      const tagSpecificPornstars = availableTagPornstars;
      
      // Combine static and tag-specific pornstars
      const allPornstars = [...staticPornstars, ...tagSpecificPornstars];
      
      // Shuffle the combined array so static ones don't always appear first
      return allPornstars.sort(() => 0.5 - Math.random());
    }
    
    // Original logic for home page (global random)
    // Filter out static pornstars from the random pool to avoid duplicates
    const availableForRandom = pornstars.filter(star => 
      !staticPornstars.some(staticStar => 
        staticStar.toLowerCase().replace(/\s+/g, '') === star.toLowerCase().replace(/[\s-]+/g, '')
      )
    );
    
    // Get 21 random pornstars from the remaining pool
    const randomCount = count - staticPornstars.length; // 32 - 11 = 21
    const randomPornstars = availableForRandom.length <= randomCount 
      ? availableForRandom 
      : [...availableForRandom].sort(() => 0.5 - Math.random()).slice(0, randomCount);
    
    // Combine static and random pornstars
    const allPornstars = [...staticPornstars, ...randomPornstars];
    
    // Shuffle the combined array so static ones don't always appear first
    return allPornstars.sort(() => 0.5 - Math.random());
  };

  // Function to fetch random pornstars from optimized API (OPTIMIZED)
  // लाइन 92 के आसपास
  const fetchAllPornstars = async () => {
  try {

  
  // Check localStorage cache first
  const savedPornstarsData = localStorage.getItem('vipmilfnut_footer_display_pornstars');
  const now = Date.now();
  
  if (savedPornstarsData) {
  const { pornstars, timestamp } = JSON.parse(savedPornstarsData);
  const timeDiff = now - timestamp;
  const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
  
  // If less than 10 minutes has passed and not tag-specific, use saved pornstars
  if (timeDiff < tenMinutes && pornstars && pornstars.length > 0 && (!tagPornstars || tagPornstars.length === 0)) {

  setDisplayPornstars(pornstars);
  setAllPornstars(pornstars); // For consistency
  return pornstars;
  }
  }
  
      // Build query parameters
      const params = new URLSearchParams({
        count: 32
      });
      
      // Add tag-specific pornstars if available
      if (tagPornstars && tagPornstars.length > 0) {
        params.append('tagPornstars', tagPornstars.join(','));
      }
      
      // Use the new optimized API endpoint
      const response = await fetch(`${process.env.REACT_APP_API_URL}/footer/pornstars?${params}`, { 
        mode: "cors" 
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch footer pornstars');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API error');
      }
      
      const { pornstars, source } = data;

      
      setDisplayPornstars(pornstars);
      setAllPornstars(pornstars); // For consistency with existing code
      
      // Only cache if it's not tag-specific (home page only)
      if (source !== 'tagSpecific') {
        localStorage.setItem('vipmilfnut_footer_display_pornstars', JSON.stringify({
          pornstars: pornstars,
          timestamp: now
        }));
      }
      
      return pornstars;
      
    } catch (err) {
      console.error('❌ Footer: Error fetching pornstars:', err); // इसे रखें - यह एरर हैंडलिंग के लिए महत्वपूर्ण है
      
      // Fallback to default pornstars if API fails
      const fallbackPornstars = [
        'Sunny Leone', 'Mia Khalifa', 'Angela White', 'Mia Malkova', 'Johnny Sins',
        'Reagan Foxx', 'Ava Addams', 'Brandi Love', 'Cory Chase', 'Lena Paul',
        'Melody Marks', 'Keisha Grey', 'Sophia Leone', 'Bridgette B', 'Valentina Nappi',
        'Blake Blossom', 'Dani Daniels', 'Natasha Nice', 'Ariella Ferrera', 'Danny D',
        'Jordi El Nino Polla', 'Alyx Star', 'Mariska X', 'Yasmina Khan', 'Niks Indian',
        'Riley Reid', 'Abella Danger', 'Adriana Chechik', 'Kenzie Reeves', 'Autumn Falls'
      ];
      setDisplayPornstars(fallbackPornstars);
      setAllPornstars(fallbackPornstars);
      return fallbackPornstars;
    }
  };

  // Function to refresh pornstars with new random selection
  const refreshPornstars = () => {
    if (allPornstars.length > 0) {
      const useTagSpecific = tagPornstars && tagPornstars.length > 0;
      const newRandomPornstars = getRandomPornstars(allPornstars, 32, useTagSpecific);
      const now = Date.now();
      
      // Only save to localStorage if it's not tag-specific (home page only)
      if (!useTagSpecific) {
        localStorage.setItem('vipmilfnut_footer_display_pornstars', JSON.stringify({
          pornstars: newRandomPornstars,
          timestamp: now
        }));
      }
      
      setDisplayPornstars(newRandomPornstars);
    }
  };

  // Function to fetch random tags from optimized API (OPTIMIZED)
  const fetchAllTags = async () => {
    try {

      
      // Build query parameters
      const params = new URLSearchParams({
        count: 30
      });
      
      // Add selectedTag if provided
      if (selectedTag && selectedTag.trim()) {
        params.append('selectedTag', selectedTag.trim());
      }
      
      // Add pageTags if provided
      if (pageTags && pageTags.length > 0) {
        params.append('pageTags', pageTags.join(','));
      }
      
      // Use the new optimized API endpoint
      const response = await fetch(`${process.env.REACT_APP_API_URL}/footer/tags?${params}`, { 
        mode: "cors" 
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch footer tags');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API error');
      }
      
      const { tags, source } = data;

      
      setTopTags(tags);
      setDisplayTags(tags);
      setAllTags(tags); // For consistency with existing code
      
      // Only cache random tags (not selectedTag or pageTags)
      if (source === 'random') {
        const now = Date.now();
        localStorage.setItem('vipmilfnut_footer_display_tags', JSON.stringify({
          tags: tags,
          timestamp: now
        }));
      }
      
      return tags;
      
    } catch (err) {
      console.error('❌ Footer: Error fetching tags:', err);
      
      // Fallback to default categories if API fails
      const fallbackTags = [
        'hardcore', 'milf', 'big-tits', 'big-boobs', 'small-tits', 
        'big-ass', 'threesum', 'white', 'black', 'asian', 'latina',
        'blonde', 'brunette', 'redhead', 'teen', 'mature', 'amateur',
        'professional', 'lesbian', 'gay', 'straight', 'anal', 'oral',
        'vaginal', 'group', 'solo', 'couple', 'gangbang', 'creampie'
      ];
      setTopTags(fallbackTags);
      setDisplayTags(fallbackTags);
      setAllTags(fallbackTags);
      return fallbackTags;
    }
  };

  // Function to refresh tags with new random selection
  const refreshTags = () => {
    if (allTags.length > 0) {
      const newRandomTags = getRandomTags(allTags, 30);
      const now = Date.now();
      
      // Save new tags to localStorage with current timestamp
      localStorage.setItem('vipmilfnut_footer_display_tags', JSON.stringify({
        tags: newRandomTags,
        timestamp: now
      }));
      
      setTopTags(newRandomTags);
      setDisplayTags(newRandomTags);
    }
  };

  // Initial setup and interval management
  useEffect(() => {
    // Fetch all tags and pornstars and set up initial display
    Promise.all([
      fetchAllTags().then((initialTags) => {
        if (initialTags && initialTags.length > 0) {
          setLoading(false);
        }
      }),
      fetchAllPornstars().then((initialPornstars) => {
        if (initialPornstars && initialPornstars.length > 0) {
          setPornstarsLoading(false);
        }
      })
    ]);

    // Only set up interval if no selectedTag, pageTags, or tagPornstars are provided (i.e., on home page only)
    if ((!selectedTag || !selectedTag.trim()) && (!pageTags || pageTags.length === 0) && (!tagPornstars || tagPornstars.length === 0)) {
      // Set up 10-minute interval for refreshing tags and pornstars
      const interval = setInterval(() => {
        refreshTags();
        refreshPornstars();
      }, 10 * 60 * 1000); // 10 minutes in milliseconds

      setRefreshInterval(interval);

      // Cleanup interval on component unmount
      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else {
      // Clear any existing interval if we're on a tag page
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTag, pageTags, tagPornstars]);

  // Handle tagPornstars changes (for tag-specific pages)
  // लाइन 317 के आसपास
  useEffect(() => {
  if (tagPornstars && tagPornstars.length > 0) {

  // Generate tag-specific pornstar display immediately
  const useTagSpecific = true;
  const tagSpecificDisplay = getRandomPornstars([], 32, useTagSpecific);
  setDisplayPornstars(tagSpecificDisplay);
  setPornstarsLoading(false);
  
  // Set up 10-minute interval for tag-specific pornstar refresh
  const tagInterval = setInterval(() => {

  const refreshedTagDisplay = getRandomPornstars([], 32, true);
  setDisplayPornstars(refreshedTagDisplay);
  }, 10 * 60 * 1000); // 10 minutes
      
      // Cleanup interval on component unmount or tagPornstars change
      return () => {
        if (tagInterval) {
          clearInterval(tagInterval);
        }
      };
    }
  }, [tagPornstars]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayedTags = showAllTags ? topTags : displayTags.slice(0, 30);

  return (
    <div>
      
      <div className="footer-title-wrapper">
        <div className="footer-title-container">
          <span className="line" />
          <span className="title">VipMilfNut</span>
          <span className="line" />
        </div>
      </div>

      {/* New Categories and Pornstars Section */}
      <div className="categories-pornstars-section">
        <div className="categories-section">
          <h2 className="section-title">
            Best Porn Categories
          </h2>
          {loading ? (
            <div className="tags-loading">Loading categories...</div>
          ) : (
            <>
              <div className="tags-grid">
                {displayedTags.map((tag, index) => (
                  <Link 
                    key={index} 
                    to={`/tag/${tag}`} 
                    className="tag-button"
                  >
                    {tag.replace(/-/g, ' ').charAt(0).toUpperCase() + tag.replace(/-/g, ' ').slice(1)}
                  </Link>
                ))}
               
              </div>
            </>
          )}
        </div>

        <div className="pornstars-section">
          <h2 className="section-title">Hottest Pornstars</h2>
          {pornstarsLoading ? (
            <div className="tags-loading">Loading pornstars...</div>
          ) : (
            <>
              <div className="tags-grid">
                {displayPornstars.map((pornstar, index) => (
                  <Link 
                    key={index} 
                    to={`/pornstar/${slugifyTag(pornstar)}`} 
                    className="tag-button"
                  >
                    {pornstar.replace(/-/g, ' ')}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">
          <p style={{textAlign:"center", fontSize:"14px", color:"#666", margin:"20px auto"}}>
            © 2024 VipMilfNut. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <button className="scroll-to-top" onClick={scrollToTop}>
        ↑
      </button>
    </div>
  );
};

export default Footer;
