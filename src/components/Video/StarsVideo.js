import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import "./Video.css";
import Sidebar from "../partials/Navbar";

const apiUrl = process.env.REACT_APP_API_URL;

function StarsVideo() {
    const { name } = useParams(); // Get pornstar name from the route
    const [results, setResults] = useState([]);
    const [randomImage, setRandomImage] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
        const [search, setSearch] = useState(""); // Search query
    
    const observer = useRef(null);

    useEffect(() => {
        setResults([]); // Reset results when changing pornstar name
        setPage(1);
    }, [name]);

    useEffect(() => {
        const fetchStarsVideos = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${apiUrl}/pornstar/${name}?page=${page}&limit=16`);
                const data = await response.json();

                setResults((prevResults) => {
                    const newVideos = [...prevResults, ...data.records];
                    return [...new Set(newVideos.map((v) => JSON.stringify(v)))].map((v) =>
                        JSON.parse(v)
                    ); // Prevent duplicate videos
                });

                setTotalPages(data.totalPages);

                if (data.records.length > 0) {
                    const randomItem = data.records[Math.floor(Math.random() * data.records.length)];
                    setRandomImage(randomItem.imageUrl);
                }
            } catch (error) {
                console.error("Error fetching stars videos:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStarsVideos();
    }, [name, page]);

    useEffect(() => {
        if (!name) return;
        const formattedName = name.replace(/-/g, " ");
    
        document.title = `${formattedName} xvids porno missax trisha paytas porn`;
        
        const metaDesc = document.querySelector("meta[name='description']");
        const descriptionContent = `sexy movie super movie ${formattedName}. chinese family sex huge tits Porn Videos big natural boobs download vporn sex videos`;
    
        if (metaDesc) {
            metaDesc.setAttribute("content", descriptionContent);
        } else {
            const newMeta = document.createElement("meta");
            newMeta.name = "description";
            newMeta.content = descriptionContent;
            document.head.appendChild(newMeta);
        }
    
        const canonicalLink = document.querySelector("link[rel='canonical']");
        if (canonicalLink) {
            canonicalLink.setAttribute("href", `https://vipmilfnut.com/pornstar/${name}`);
        } else {
            const newCanonical = document.createElement("link");
            newCanonical.rel = "canonical";
            newCanonical.href = `https://vipmilfnut.com/pornstar/${name}`;
            document.head.appendChild(newCanonical);
        }
    
    }, [name]);
    
    

    const lastVideoRef = useRef();

    useEffect(() => {
        if (isLoading) return;
        observer.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && page < totalPages) {
                    setPage((prev) => prev + 1);
                }
            },
            { threshold: 1.0 }
        );

        if (lastVideoRef.current) {
            observer.current.observe(lastVideoRef.current);
        }

        return () => {
            if (observer.current) observer.current.disconnect();
        };
    }, [isLoading, page, totalPages]);

    const slugifyTitle = (title) => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[\s]+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
    };
    
    const handleCardClick = async (id, currentViews) => {
        try {
            const updatedViews = (currentViews || 0) + 1;
    
            // Update UI immediately
            const updatedVideos = results.map((item) =>
                item._id === id ? { ...item, views: updatedViews } : item
            );
            setResults(updatedVideos);
    
            // Send API request to update views
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
                <title>{name.replace(/-/g, " ")} xvids porno missax trisha paytas porn</title>
                <link rel="canonical" href={`https://vipmilfnut.com/pornstar/${name}`} />
                <link rel="icon" href="/favicon.ico?v=2" type="image/x-icon" />
                <meta
                    name="description"
                    content={`sexy movie super movie ${name.replace(
                        /-/g,
                        " "
                    )}. chinese family sex huge tits Porn Videos big natural boobs download vporn sex videos`}
                />
                <meta name="robots" content="index, follow" />
            </Helmet>

            <Sidebar onSearch={(query) => setSearch(query)} />

            <div className="stars-videos">
                <h1>Videos Featuring {name.replace(/-/g, " ")}</h1>

                <div className="row row-cols-1 row-cols-md-4 g-4 mt-0 m-auto">
                    {results.length > 0 ? (
                        results.map((video, index) => (
                            <div className="col" key={video._id} ref={index === results.length - 1 ? lastVideoRef : null}>
                                <Link  onClick={() => handleCardClick(video._id, video.views)} to={`/video/${video._id}-${slugifyTitle(video.titel)}`} style={{ textDecoration: "none" }}>
                                    <div className="card">
                                        <img
                                            loading="lazy"
                                            style={{ height: "250px" }}
                                            src={video.imageUrl}
                                            className="card-img-top"
                                            alt={video.altKeywords?.trim() || video.titel}
                                        />
                                        <div className="card-body">
                                            <div>
                                                <p>
                                                    <i className="bi bi-hand-thumbs-up-fill"></i>{" "}
                                                    {Math.min(Math.round((video.views / 200) * 100), 100)}%
                                                </p>
                                                <p>
                                                    <i className="bi bi-clock-fill"></i> {video.minutes}
                                                </p>
                                                <p>
                                                    <i className="bi bi-eye-fill"></i> {video.views || 2}K+ ..
                                                </p>
                                            </div>
                                            <h2 className="card-title">{video.titel}</h2>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))
                    ) : (
                        !isLoading && <p className="text-center">No videos found.</p>
                    )}
                </div>

                {isLoading && <div className="text-center">Loading...</div>}
            </div>
        </>
    );
}

export default StarsVideo;
