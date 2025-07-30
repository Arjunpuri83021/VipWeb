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
      <h1 style={{textAlign:"center", fontSize:"15px", color:"white", marginBottom:"30px"}}>For Promation you can connect with us on - "vipmilfnut991@gmail.com"</h1>
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
    </div>
  );
};

export default Footer;
