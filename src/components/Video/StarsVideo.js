import { useState, useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet";
import "./Video.css";
import Sidebar from "../partials/Navbar";
import Footer from "../partials/Footer";

const apiUrl = process.env.REACT_APP_API_URL;

function StarsVideo() {
    const { name } = useParams(); // Get pornstar name from the route
    const [results, setResults] = useState([]);
    const [setRandomImage] = useState("");
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
    
        document.title = `VipMilfNut ${formattedName} xvids porno missax trisha paytas porn`;
        
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
                <title>VipMilfNut - {name.replace(/-/g, " ")} xvids porno missax trisha paytas porn</title>
                <link rel="canonical" href={`https://vipmilfnut.com/pornstar/${name}`} />
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
                <h1 style={{fontSize:"18px", textAlign:"center", marginTop:"10px", textTransform:"capitalize"}}>{name.replace(/-/g, " ")} All sex Videos On VipMilfNut</h1>

                <div className="row row-cols-1 row-cols-md-4 g-4 mt-0 m-auto">
                    {results.length > 0 ? (
                        results.map((video, index) => (
                            <div className="col" key={video._id} ref={index === results.length - 1 ? lastVideoRef : null}>
                                <Link  onClick={() => handleCardClick(video._id, video.views)} to={`/video/${video._id}`} style={{ textDecoration: "none" }}>
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
                                                    <i className="bi bi-eye-fill"></i> {video.views || 2}
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

            {/* Pornstar Bio Section */}
            <div style={{ margin: "20px 0", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                <h2 style={{ fontSize: "18px", marginBottom: "15px", color: "#333", borderBottom: "2px solid #007bff", paddingBottom: "5px" }}>
                    About {name ? name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'This Pornstar'}
                </h2>
                <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#555", marginBottom: "15px" }}>
                    {name ? name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'This pornstar'} is one of the most popular adult performers featured on VipMilfNut. 
                    Known for incredible performances and stunning looks, {name ? name.replace(/-/g, ' ') : 'this performer'} has captivated audiences worldwide with 
                    passionate scenes and professional adult entertainment. Watch exclusive {name ? name.replace(/-/g, ' ') : 'pornstar'} videos in HD quality.
                </p>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginTop: "15px" }}>
                    <div style={{ padding: "10px", backgroundColor: "white", borderRadius: "5px", border: "1px solid #ddd" }}>
                        <h4 style={{ fontSize: "14px", color: "#007bff", marginBottom: "5px" }}>🎬 Career Highlights</h4>
                        <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>Professional adult performer with multiple award nominations and fan favorite status</p>
                    </div>
                    <div style={{ padding: "10px", backgroundColor: "white", borderRadius: "5px", border: "1px solid #ddd" }}>
                        <h4 style={{ fontSize: "14px", color: "#007bff", marginBottom: "5px" }}>⭐ Performance Style</h4>
                        <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>Known for passionate performances, versatile scenes, and authentic chemistry with co-stars</p>
                    </div>
                    <div style={{ padding: "10px", backgroundColor: "white", borderRadius: "5px", border: "1px solid #ddd" }}>
                        <h4 style={{ fontSize: "14px", color: "#007bff", marginBottom: "5px" }}>🔥 Popular Categories</h4>
                        <p style={{ fontSize: "12px", color: "#666", margin: 0 }}>Featured in various adult categories including hardcore, romantic, and specialty scenes</p>
                    </div>
                </div>
            </div>

            {/* Video Stats & Info */}
            <div style={{ margin: "20px 0", padding: "15px", backgroundColor: "#fff3cd", borderRadius: "8px", border: "1px solid #ffeaa7" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "10px", color: "#856404" }}>📊 {name ? name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Pornstar'} Video Collection Stats</h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
                    <div style={{ textAlign: "center" }}>
                        <strong style={{ display: "block", fontSize: "18px", color: "#d63384" }}>{results.length}+</strong>
                        <span style={{ fontSize: "12px", color: "#856404" }}>HD Videos</span>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <strong style={{ display: "block", fontSize: "18px", color: "#d63384" }}>100%</strong>
                        <span style={{ fontSize: "12px", color: "#856404" }}>Free Access</span>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <strong style={{ display: "block", fontSize: "18px", color: "#d63384" }}>4K</strong>
                        <span style={{ fontSize: "12px", color: "#856404" }}>Quality</span>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <strong style={{ display: "block", fontSize: "18px", color: "#d63384" }}>24/7</strong>
                        <span style={{ fontSize: "12px", color: "#856404" }}>Streaming</span>
                    </div>
                </div>
            </div>

            {/* Why Watch Section */}
            <div style={{ margin: "20px 0", padding: "15px", backgroundColor: "#e7f3ff", borderRadius: "8px", border: "1px solid #b3d9ff" }}>
                <h3 style={{ fontSize: "16px", marginBottom: "15px", color: "#0056b3" }}>🌟 Why Watch {name ? name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'This Pornstar'}?</h3>
                <ul style={{ paddingLeft: "20px", margin: 0 }}>
                    <li style={{ fontSize: "13px", color: "#0056b3", marginBottom: "8px" }}>Exclusive HD content featuring {name ? name.replace(/-/g, ' ') : 'top performer'} in premium adult scenes</li>
                    <li style={{ fontSize: "13px", color: "#0056b3", marginBottom: "8px" }}>Professional cinematography and high production values</li>
                    <li style={{ fontSize: "13px", color: "#0056b3", marginBottom: "8px" }}>Regular updates with latest {name ? name.replace(/-/g, ' ') : 'pornstar'} releases</li>
                    <li style={{ fontSize: "13px", color: "#0056b3", marginBottom: "8px" }}>Mobile-friendly streaming with fast loading times</li>
                    <li style={{ fontSize: "13px", color: "#0056b3" }}>No registration required - instant access to all content</li>
                </ul>
            </div>

            <Footer />
        </>
    );
}

export default StarsVideo;
