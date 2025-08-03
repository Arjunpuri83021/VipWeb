import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './footer.css';

const Footer = () => {
  const location = useLocation();
  const [topTags, setTopTags] = useState([]);
  const [showAllTags, setShowAllTags] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top on route change
  }, [location.pathname]);

  // Fetch top tags from API
  useEffect(() => {
    const fetchTopTags = async () => {
      try {
        setLoading(true);
        // Fetch multiple pages to get a good sample of tags
        const promises = [];
        for (let page = 1; page <= 10; page++) {
          promises.push(
            fetch(`${process.env.REACT_APP_API_URL}/getpostdata?page=${page}&limit=50`, {
              mode: "cors"
            }).then(res => res.json())
          );
        }
        
        const results = await Promise.all(promises);
        const allRecords = results.flatMap(result => result.records || []);
        
        // Count tag occurrences
        const tagCount = {};
        allRecords.forEach(record => {
          if (record.tags && Array.isArray(record.tags)) {
            record.tags.forEach(tag => {
              if (tag && tag.trim()) {
                const cleanTag = tag.trim().toLowerCase();
                tagCount[cleanTag] = (tagCount[cleanTag] || 0) + 1;
              }
            });
          }
        });
        
        // Sort by count and get top tags
        const sortedTags = Object.entries(tagCount)
          .sort((a, b) => b[1] - a[1])
          .map(([tag]) => tag)
          .slice(0, 50); // Get top 50 for "More" functionality
        
        setTopTags(sortedTags);
      } catch (error) {
        console.error('Error fetching tags:', error);
        // Fallback to default categories if API fails
        setTopTags([
          'hardcore', 'milf', 'big-tits', 'big-boobs', 'small-tits', 
          'big-ass', 'threesum', 'white', 'black', 'asian', 'latina',
          'blonde', 'brunette', 'redhead', 'teen', 'mature', 'amateur',
          'professional', 'lesbian', 'gay', 'straight', 'anal', 'oral',
          'vaginal', 'group', 'solo', 'couple', 'gangbang', 'creampie'
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopTags();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayedTags = showAllTags ? topTags : topTags.slice(0, 30);

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
          <h2 className="section-title">Best Porn Categories</h2>
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
                {topTags.length > 30 && (
                  <button 
                    className="more-tags-button"
                    onClick={() => setShowAllTags(!showAllTags)}
                  >
                    {showAllTags ? 'Show Less' : 'Show More'}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div className="pornstars-section">
          <h2 className="section-title">Hottest Pornstars</h2>
          <div className="tags-grid">
            <Link to="/pornstar/sunny-leone" className="tag-button">Sunny Leone</Link>
            <Link to="/pornstar/mia-khalifa" className="tag-button">Mia Khalifa</Link>
            <Link to="/pornstar/angela-white" className="tag-button">Angela White</Link>
            <Link to="/pornstar/mia-malkova" className="tag-button">Mia Malkova</Link>
            <Link to="/pornstar/johnny-sins" className="tag-button">Johnny Sins</Link>            
            <Link to="/pornstar/reagan-foxx" className="tag-button">Reagan Foxx</Link>
            <Link to="/pornstar/ava-addams" className="tag-button">Ava Addams</Link>
            <Link to="/pornstar/brandi-love" className="tag-button">Brandi Love</Link>
            <Link to="/pornstar/cory-chase" className="tag-button">Cory Chase</Link>
            <Link to="/pornstar/lena-paul" className="tag-button">Lena Paul</Link>
            <Link to="/pornstar/melody-marks" className="tag-button">Melody Marks</Link>
            <Link to="/pornstar/keisha-grey" className="tag-button">Keisha Grey</Link>
            <Link to="/pornstar/sophia-leone" className="tag-button">Sophia Leone</Link>
            <Link to="/pornstar/bridgette-b" className="tag-button">Bridgette B</Link>
            <Link to="/pornstar/valentina-nappi" className="tag-button">Valentina Nappi</Link>
            <Link to="/pornstar/blake-blossom" className="tag-button">Blake Blossom</Link>
            <Link to="/pornstar/dani-daniels" className="tag-button">Dani Daniels</Link>
            <Link to="/pornstar/natasha-nice" className="tag-button">Natasha Nice</Link>
            <Link to="/pornstar/ariella-ferrera" className="tag-button">Ariella Ferrera</Link>
            <Link to="/pornstar/danny-d" className="tag-button">Danny D</Link>
            <Link to="/pornstar/jordi-el-nino-polla" className="tag-button">Jordi El Nino Polla</Link>
            <Link to="/pornstar/alyx-star" className="tag-button">Alyx Star</Link>
            <Link to="/pornstar/mariska-x" className="tag-button">Mariska X</Link>
            <Link to="/pornstar/yasmina-khan" className="tag-button">Yasmina Khan</Link>
            <Link to="/pornstar/niks-indian" className="tag-button">Niks Indian</Link>
            <Link to="/pornstar/riley-reid" className="tag-button">Riley Reid</Link>
            <Link to="/pornstar/abella-danger" className="tag-button">Abella Danger</Link>
            <Link to="/pornstar/adriana-chechik" className="tag-button">Adriana Chechik</Link>
            <Link to="/pornstar/kenzie-reeves" className="tag-button">Kenzie Reeves</Link>
            <Link to="/pornstar/autumn-falls" className="tag-button">Autumn Falls</Link>
            <Link to="/pornstar/emily-willis" className="tag-button">Emily Willis</Link>
            <Link to="/pornstar/kenna-james" className="tag-button">Kenna James</Link>
            <Link to="/pornstar/kenzie-anne" className="tag-button">Kenzie Anne</Link>
            <Link to="/pornstar/kenzie-madison" className="tag-button">Kenzie Madison</Link>
            <Link to="/pornstar/kenzie-taylor" className="tag-button">Kenzie Taylor</Link>
        
          </div>
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
