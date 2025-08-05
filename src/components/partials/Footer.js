import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './footer.css';

const Footer = ({ selectedTag = null, pageTags = null }) => {
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

  // Function to get random pornstars from all available pornstars
  const getRandomPornstars = (pornstars, count = 30) => {
    if (pornstars.length <= count) return pornstars;
    const shuffled = [...pornstars].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  // Function to fetch all unique pornstars from the API
  const fetchAllPornstars = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/getpostdata?page=1&limit=1000`, { mode: "cors" });
      
      if (!response.ok) return;
      const data = await response.json();
      
      const allRecords = data.records || [];
      
      // Extract all unique pornstar names from all posts
      const uniquePornstars = new Set();
      allRecords.forEach((post, index) => {
          if (Array.isArray(post.name)) {
          post.name.forEach(name => {
            if (name && name.trim()) {
              uniquePornstars.add(name.trim());
            }
          });
        } else if (post.name && typeof post.name === 'string') {
          uniquePornstars.add(post.name.trim());
        }
      });
      
      const pornstarsArray = Array.from(uniquePornstars);
      
      setAllPornstars(pornstarsArray);
      
      // Check if we have saved pornstars and timestamp in localStorage
      const savedPornstarsData = localStorage.getItem('vipmilfnut_footer_display_pornstars');
      const now = Date.now();
      
      if (savedPornstarsData) {
        const { pornstars, timestamp } = JSON.parse(savedPornstarsData);
        const timeDiff = now - timestamp;
        const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
        
        // If less than 10 minutes has passed, use saved pornstars
        if (timeDiff < tenMinutes && pornstars && pornstars.length > 0) {
          setDisplayPornstars(pornstars);
          return pornstars;
        }
      }
      
      // Generate new random pornstars and save to localStorage
      const randomPornstars = getRandomPornstars(pornstarsArray, 30);
      localStorage.setItem('vipmilfnut_footer_display_pornstars', JSON.stringify({
        pornstars: randomPornstars,
        timestamp: now
      }));
      setDisplayPornstars(randomPornstars);
      
      return randomPornstars;
    } catch (err) {
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
      return fallbackPornstars;
    }
  };

  // Function to refresh pornstars with new random selection
  const refreshPornstars = () => {
    if (allPornstars.length > 0) {
      const newRandomPornstars = getRandomPornstars(allPornstars, 30);
      const now = Date.now();
      
      // Save new pornstars to localStorage with current timestamp
      localStorage.setItem('vipmilfnut_footer_display_pornstars', JSON.stringify({
        pornstars: newRandomPornstars,
        timestamp: now
      }));
      
      setDisplayPornstars(newRandomPornstars);
    }
  };

  // Function to fetch all unique tags from the API
  const fetchAllTags = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/getpostdata?page=1&limit=1000`, { mode: "cors" });
      
      if (!response.ok) return;
      const data = await response.json();
      
      const allRecords = data.records || [];
      
      // Extract all unique tags from all posts
      const uniqueTags = new Set();
      allRecords.forEach((post, index) => {
        if (Array.isArray(post.tags)) {
          post.tags.forEach(tag => {
            if (tag && tag.trim()) {
              uniqueTags.add(tag.trim());
            }
          });
        }
      });
      
      const tagsArray = Array.from(uniqueTags);
      
      setAllTags(tagsArray);
      
      // If pageTags is provided, use those tags from the current page
      if (pageTags && pageTags.length > 0) {
        console.log('Footer: Using page tags:', pageTags);
        setTopTags(pageTags);
        setDisplayTags(pageTags);
        return pageTags;
      }
      
      // If selectedTag is provided, use it instead of random tags
      if (selectedTag && selectedTag.trim()) {
        console.log('Footer: Using selected tag:', selectedTag);
        setTopTags([selectedTag]);
        setDisplayTags([selectedTag]);
        return [selectedTag];
      }
      
      console.log('Footer: Using random tags (no selectedTag or pageTags provided)');
      
      // Check if we have saved tags and timestamp in localStorage
      const savedTagsData = localStorage.getItem('vipmilfnut_footer_display_tags');
      const now = Date.now();
      
      if (savedTagsData) {
        const { tags, timestamp } = JSON.parse(savedTagsData);
        const timeDiff = now - timestamp;
        const tenMinutes = 10 * 60 * 1000; // 10 minutes in milliseconds
        
        // If less than 10 minutes has passed, use saved tags
        if (timeDiff < tenMinutes && tags && tags.length > 0) {
          setTopTags(tags);
          setDisplayTags(tags);
          return tags;
        }
      }
      
      // Generate new random tags and save to localStorage
      const randomTags = getRandomTags(tagsArray, 30);
      localStorage.setItem('vipmilfnut_footer_display_tags', JSON.stringify({
        tags: randomTags,
        timestamp: now
      }));
      setTopTags(randomTags);
      setDisplayTags(randomTags);
      
      return randomTags;
    } catch (err) {
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

    // Only set up interval if no selectedTag or pageTags are provided (i.e., on home page)
    if ((!selectedTag || !selectedTag.trim()) && (!pageTags || pageTags.length === 0)) {
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTag, pageTags]);

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
            {pageTags && pageTags.length > 0 ? `Tags from this page (${pageTags.length})` : 
             selectedTag ? `Related to ${selectedTag.replace(/-/g, ' ').charAt(0).toUpperCase() + selectedTag.replace(/-/g, ' ').slice(1)}` : 
             "Best Porn Categories"}
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
                    {pornstar}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <footer className="footer">
      <p style={{textAlign:"center", fontSize:"15px", color:"#908989", width:"90%", margin:"auto"}}>
 If you're someone who enjoys real, unfiltered adult content, you'll feel right at home here. We've got a solid mix of desi and international videos from trusted names like <strong>Badwap</strong>, <strong>WowUncut</strong>, and <strong>SpanBank</strong>. Whether you're into amateur clips, spicy Indian aunty scenes, or full-on professional shoots, there's something for every mood. And if you're a fan of mature action, don't miss out on what <strong>MilfNut</strong> and <strong>MilfNuts</strong> bring to the table — real women, real passion, no scripts. Fresh videos drop regularly, so there's always something new to check out.
</p>

        <div className="footer-content mt-4">
          <nav>
            <h6 className="footer-heading">New Videos</h6>
            <Link to="/category/indian" className="footer-link">Indian Desi</Link>
            <Link to="/category/boobs-pressing" className="footer-link">Big Boobs</Link>
            <Link to="/category/blueflim" className="footer-link">BlowJob</Link>
            <Link to="/category/badwap" className="footer-link">Bad Porn</Link>
          </nav>
          <nav>
            <h6 className="footer-heading">Top Porn videos</h6>
            <Link to="/category/milfnut" className="footer-link">Milf</Link>
            <Link to="/category/aunt-sex" className="footer-link">Aunt Sex</Link>
            <Link to="/category/small-tits" className="footer-link">Small Tits Girl</Link>
            <Link to="/category/boobs-pressing" className="footer-link">Big Boobs Girl</Link>
          </nav>
          <nav>
            <h6 className="footer-heading">Family Porn Videos</h6>
            <Link to="/category/famili-sex-com" className="footer-link">Family Swap</Link>
            <Link to="/category/sex-sister" className="footer-link">Sister & Brother Porn</Link>
            <Link to="/category/aunt-sex" className="footer-link">Sex With Step Mom</Link>
          </nav>
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
