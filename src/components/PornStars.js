import React, { useEffect, useState } from "react";
import Sidebar from "./partials/Navbar";
import Slider from "./partials/Slider";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import Footer from "./partials/Footer";

const apiUrl = process.env.REACT_APP_API_URL;

function PornStars() {
    const [stars, setStars] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState("");
        const [setSelectedCategory] = useState(""); // For category selection
    
    const itemsPerPage = 16;

    useEffect(() => {
        document.title = "VipMilfNut Adult Actress 3Pornstar 4K Pornstar Black Pornstars";

        const metaDesc = document.querySelector("meta[name='description']");
        if (metaDesc) {
            metaDesc.setAttribute("content", "a pornstar is born aaliyah love abby byens active pornstars black pornstars 3pornstar adult actress Hottest Pornstars Top Rated Pornstars in 4K Tube Pornstars");
        } else {
            const newMeta = document.createElement("meta");
            newMeta.name = "description";
            newMeta.content = "a pornstar is born aaliyah love abby byens active pornstars black pornstars 3pornstar adult actress Hottest Pornstars Top Rated Pornstars in 4K Tube Pornstars";
            document.head.appendChild(newMeta);
        }

        const canonicalLink = document.querySelector("link[rel='canonical']");
        if (!canonicalLink) {
            const newCanonical = document.createElement("link");
            newCanonical.rel = "canonical";
            newCanonical.href = "https://vipmilfnut.com/Pornstars";
            document.head.appendChild(newCanonical);
        }
    }, []);

    const fetchData = async (page = 1, searchQuery = "") => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${apiUrl}/getpostdata?page=${page}&limit=${itemsPerPage}&search=${searchQuery}`, {
                mode: "cors"
            });
            if (!response.ok) {
                throw new Error("Failed to fetch data");
            }
            const data = await response.json();
            
            // Extract names from records
            const extractedNames = data.records.flatMap((record) => record.name || []);
            const uniqueNames = [...new Set(extractedNames)].map(name => ({ name }));

            setStars((prevStars) => [...prevStars, ...uniqueNames]);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(currentPage, search);
    }, [currentPage, search]);

    const handleLoadMore = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <>
            <Helmet>
                <title>VipMilfNut Adult Actress 3Pornstar 4K Pornstar Black Pornstars | VipMilfNut</title>
                <link rel="canonical" href="https://vipmilfnut.com/Pornstars" />
                <meta name="description" content="A list of top-rated adult actresses and pornstars, including black pornstars and 4K-rated performers." />
                <meta name="robots" content="index, follow" />
            </Helmet>

            <Sidebar onSearch={(query) => setSearch(query)} />
            <Slider onCategorySelect={(category) => setSelectedCategory(category)}/>

            <div style={{ width: "95%", margin: "auto" }}>
                <h1 style={{fontSize:"18px", textAlign:"center"}}>Adult Actress 3Pornstar and 4K Pornstar and Black Pornstars Videos </h1>
                {loading && <p>Loading...</p>}
                {error && <p style={{ color: "red" }}>{error}</p>}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around" }}>
                    {stars.length > 0 ? (
                        stars.map((star, index) => (
                            <Link to={`/pornstar/${star.name}`} key={index} style={{ margin: "10px", textAlign: "center", textDecoration: "none", color: "#444" }}>
                                <img style={{ height: "120px", width: "120px", objectFit: "cover" }} src="female.png" alt={star.name} />
                                <h2>{star.name}</h2>
                            </Link>
                        ))
                    ) : (
                        <p>No stars found.</p>
                    )}
                </div>

                {currentPage < totalPages && (
                    <div style={{ marginTop: "20px", textAlign: "center" }}>
                        <button className="btn btn-dark" onClick={handleLoadMore} disabled={loading}>
                            {loading ? "Loading..." : "Load More"}
                        </button>
                    </div>
                )}
            </div>

            <Footer/>
        </>
    );
}

export default PornStars;
