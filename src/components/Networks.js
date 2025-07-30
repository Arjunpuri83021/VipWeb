import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import Sidebar from "./partials/Navbar";
import Slider from "./partials/Slider";
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import Footer from "./partials/Footer";

const apiUrl = process.env.REACT_APP_API_URL;

const Network = () => {
    const [networks, setNetworks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [webName, setWebName] = useState('');
    const [webLink, setWebLink] = useState('');
    const [webDesc, setWebDesc] = useState('');
    const [webLogo, setWebLogo] = useState(null);
    const [email, setEmail] = useState('');


    useEffect(() => {
        fetchNetworks();
    }, []);

    const fetchNetworks = async () => {
        try {
            const res = await fetch(`${apiUrl}/find-website`);
            const data = await res.json();
            setNetworks(data);
        } catch (err) {
            console.error("Error fetching websites:", err);
        }
    };

    const handleCardClick = (webLink) => {
        window.open(webLink, "_blank");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!webLogo) {
            alert("Please upload a logo image.");
            return;
        }

        const formData = new FormData();
        formData.append("name", webName);
        formData.append("link", webLink);
        formData.append("email", email);

        formData.append("description", webDesc);
        formData.append("logo", webLogo); // this field name must match backend

        try {
            const response = await fetch(`${apiUrl}/add-website`, {
                method: "POST",
                body: formData, // FormData handles all fields including file
            });

            if (response.ok) {
                alert("Website submited successfully you will recive a email when its added");
                setWebName('');
                setWebLink('');
                setWebDesc('');
                setEmail('')
                setWebLogo(null); // Clear uploaded file
                setShowModal(false);
                fetchNetworks(); // Refresh list
            } else {
                alert("Failed to add website.");
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Error adding website.");
        }
    };

    return (
        <>
            <Helmet>
                <title>VipMilfNut - Best Porn Sites & Free Porn Tubes List</title>
                <link rel="canonical" href="https://vipmilfnut.com/our-network" />
                <meta name="description" content="Explore VipMilfNut's curated list of the best porn sites & free porn tubes of all time. Enjoy high-quality adult content with fast streaming and unlimited access!" />
                <meta name="robots" content="index, follow" />
            </Helmet>

            <Sidebar />
            <div className="flex justify-center mt-4 mb-4">
  <button style={{padding:"10px", display:"flex", margin:"auto", border:"none", textDecoration:"underline"}}
    className="px-6 py-3 bg-gradient-to-r from-yellow-300 to-orange-400 text-black font-semibold rounded-xl shadow-md hover:shadow-xl hover:scale-105 transition-transform duration-300"
    onClick={() => setShowModal(true)}
  >
    🚀 Add Your Website
  </button>
</div>


            <div style={{ width: "95%", margin: "auto", textAlign: "center" }}>
                <h1>Best Porn Websites and adult content networks</h1>

               

                <Box
                    sx={{
                        width: '100%',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))',
                        gap: 2,
                        marginTop: 3
                    }}
                >
                    {networks.filter(site => site.active).map((site, index) => (
                        <Card key={index}>
                            <CardActionArea onClick={() => handleCardClick(site.webLink)}>
                                {site.webLogo && (
                                    <img
                                        className="network-logos"
                                        src={`${apiUrl}/${site.webLogo}`}
                                        alt={site.webName}
                                        
                                    />
                                )}
                                <CardContent>
                                    <Typography sx={{ fontWeight: "bold" }} variant="h5">
                                        {site.webName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {site.webDesc
                                            ? site.webDesc.split(" ").slice(0, 13).join(" ") + "..."
                                            : `Stream HD adult videos on ${site.webName}!`}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    ))}
                </Box>

            </div>

            {showModal && (
                <>
                    <div className="modal show d-block" tabIndex="-1">
                        <div className="modal-dialog">
                            
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Promote Your Website with us</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <div className="modal-body">
                                <p>
  <strong>Promote Your Website, Telegram Channel & Social Media – Free for 5 Days!</strong><br /><br />
  We're offering a <strong>limited-time free trial</strong> for new users! Add your <strong>website, Telegram channel, or social media account</strong> to our platform completely <strong>FREE for the first 5 days</strong>.<br /><br />
  Take full advantage of our network to reach more people and grow your online presence.<br /><br />
  After the 5-day trial, continue enjoying all the benefits with a <strong>one-time lifetime fee of just $5</strong> – no monthly or yearly charges!<br /><br />
  ⚠️ <strong>Hurry – this is a limited-time offer!</strong> Prices may increase soon.<br /><br />
  <strong>Start your 5-day free trial now and boost your visibility with us!</strong>
</p>

                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-3">
                                            <label className="form-label">Your Website Logo</label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="form-control"
                                                onChange={(e) => setWebLogo(e.target.files[0])}
                                            />
                                            <label className="form-label">Website Name</label>
                                            <input value={webName} onChange={(e) => setWebName(e.target.value)} type="text" className="form-control" required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Website Link</label>
                                            <input value={webLink} onChange={(e) => setWebLink(e.target.value)} type="url" className="form-control" required />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Description</label>
                                            <textarea value={webDesc} onChange={(e) => setWebDesc(e.target.value)} className="form-control"></textarea>
                                        </div>

                                        <div className="mb-3">
                                            <label className="form-label">Your email (for contect)</label>
                                            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="form-control" required />
                                        </div>
                                        <button type="submit" className="btn btn-success">Submit</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop show" onClick={() => setShowModal(false)}></div>
                </>
            )}

            <Footer />
        </>
    );
};

export default Network;
