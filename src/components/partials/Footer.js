import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import './footer.css';

const Footer = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to the top on route change
  }, [location.pathname]);

  return (
    <div>
      <div className="footer-title-wrapper">
        <div className="footer-title-container">
          <span className="line" />
          <span className="title">VipMilfNut</span>
          <span className="line" />
        </div>
      </div>
      <footer className="footer">
        <div className="footer-content">
          <nav>
            <h6 className="footer-heading">New Videos</h6>
            <Link to="/indian" className="footer-link">Indian Desi</Link>
            <Link to="/boobs-pressing" className="footer-link">Big Boobs</Link>
            <Link to="/blueflim" className="footer-link">BlowJob</Link>
            <Link to="/badwap" className="footer-link">Bad Porn</Link>
          </nav>
          <nav>
            <h6 className="footer-heading">Top Porn videos</h6>
            <Link to="/milfnut" className="footer-link">Milf</Link>
            <Link to="/aunt-sex" className="footer-link">Aunt Sex</Link>
            <Link to="/small-tits" className="footer-link">Small Tits Girl</Link>
            <Link to="/boobs-pressing" className="footer-link">Big Boobs Girl</Link>
          </nav>
          <nav>
            <h6 className="footer-heading">Family Porn Videos</h6>
            <Link to="/famili-sex-com" className="footer-link">Family Swap</Link>
            <Link to="/sex-sister" className="footer-link">Sister & Brother Porn</Link>
            <Link to="/aunt-sex" className="footer-link">Sex With Step Mom</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Footer;
