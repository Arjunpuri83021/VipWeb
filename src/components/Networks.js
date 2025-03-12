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
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [networks, setNetworks] = useState([]);

    useEffect(() => {
        fetch(`${apiUrl}/find-website`)
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setNetworks(data);
            });
    }, []);

    useEffect(() => {
        // Set dynamic meta title & description based on first network site
        const firstSite ="VipMilfNut- Providing Best Porn Sites & Free Porn Tubes List of All Time! ";
        const description = networks.length > 0 
            ? `Discover ${firstSite} and other top adult sites offering high-quality streaming. Explore the best porn websites curated by VipMilfNut!` 
            : "Explore VipMilfNut's curated list of the best porn sites & free porn tubes of all time. Enjoy high-quality adult content with fast streaming and unlimited access!";
        
        
        
        const metaDesc = document.querySelector("meta[name='description']");
        if (metaDesc) {
            metaDesc.setAttribute("content", description);
        } else {
            const newMeta = document.createElement("meta");
            newMeta.name = "description";
            newMeta.content = description;
            document.head.appendChild(newMeta);
        }
        const canonicalUrl = "https://vipmilfnut.com/our-network"; // Adjust URL based on your route
    const existingCanonical = document.querySelector("link[rel='canonical']");
    
    if (existingCanonical) {
        existingCanonical.setAttribute("href", canonicalUrl);
    } else {
        const newCanonical = document.createElement("link");
        newCanonical.rel = "canonical";
        newCanonical.href = canonicalUrl;
        document.head.appendChild(newCanonical);
    }
    }, [networks]);

    const handleCardClick = (webLink) => {
        window.open(webLink, "_blank");
    };

    return (
        <>
            <Helmet>
                <title>VipMilfNut- Providing Best Porn Sites & Free Porn Tubes List of All Time! </title>
                <link rel="canonical" href="https://vipmilfnut.com/our-network" />
                <link rel="icon" href="/favicon.ico?v=2" type="image/x-icon" />
                <meta name="description" content="Explore VipMilfNut's curated list of the best porn sites & free porn tubes of all time. Enjoy high-quality adult content with fast streaming and unlimited access!" />
                <meta name="robots" content="index, follow" />
            </Helmet>

            <Sidebar onSearch={(query) => setSearch(query)} />
            <Slider onCategorySelect={(category) => setSelectedCategory(category)} />

            <div style={{ width: "95%", margin: "auto", textAlign: "center" }}>
                <h1>Best Porn Websites</h1>
                <Box
                    sx={{
                        width: '100%',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))',
                        gap: 2,
                        marginTop: 3
                    }}
                >
                    {networks.map((site, index) => (
                        <Card key={index}>
                            <CardActionArea onClick={() => handleCardClick(site.webLink)}>
                                <CardContent>
                                    <Typography sx={{ fontWeight: "bold" }} variant="h5" component="div">
                                        {site.webName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {site.webDesc 
                                            ? site.webDesc.split(" ").length > 13 
                                                ? site.webDesc.split(" ").slice(0, 13).join(" ") + "..."
                                                : site.webDesc
                                            : `Stream high-definition adult videos on ${site.webName} with fast loading speeds and unlimited access!`
                                        }
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    ))}
                </Box>
            </div>

            <Footer/>
        </>
    );
};

export default Network;
