import { useState, useEffect } from "react";
import AdminNav from "./AdminNav";

const OurNetworks = () => {
  const [showModal, setShowModal] = useState(false);
  const [webName, setWebName] = useState('');
  const [webLink, setWebLink] = useState('');
  const [webDesc, setWebDesc] = useState('');
  const [webLogo, setWebLogo] = useState('');
  const [websites, setWebsites] = useState([]);

  const fetchWebsites = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/find-website`);
      if (response.ok) {
        const data = await response.json();
        setWebsites(data);
      } else {
        console.error("Failed to fetch websites");
      }
    } catch (error) {
      console.error("Error fetching websites:", error);
    }
  };

  useEffect(() => {
    fetchWebsites();
  }, []);

  const handleNetwork = async (e) => {
    e.preventDefault();
    const data = { name: webName, link: webLink, description: webDesc, logo: webLogo };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/add-website`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Website added successfully!");
        setWebName('');
        setWebLink('');
        setWebDesc('');
        setWebLogo('');
        setShowModal(false);
        fetchWebsites();
      } else {
        alert("Failed to add website. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while adding the website.");
    }
  };

  const handelDelete = (id) => {
    fetch(`${process.env.REACT_APP_API_URL}/delete-website/${id}`, {
      method: "DELETE"
    }).then((res) => res.json()).then((data) => {
      if (data.message === "deleted") {
        fetchWebsites();
      }
    });
  };

  const toggleActive = async (id) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/toggle-active/${id}`, {
        method: "PATCH",
      });
      if (res.ok) {
        fetchWebsites();
      } else {
        alert("Failed to toggle active status");
      }
    } catch (err) {
      console.error(err);
      alert("Error toggling status");
    }
  };

  return (
    <>
      <AdminNav />
      <div className="mt-5">
       

        {/* Website List */}
        <div className="mt-4">
          <h3 className="text-center text-light">Our Networks</h3>
          <ul style={{ background: "black" }} className="list-group">
            {websites.map((site, key) => (
              <li style={{ background: "black" }} key={site._id} className="list-group-item">
                <p className="text-light">
                  {key + 1}. {site.webName} - 
                  <span style={{ color: site.active ? "lightgreen" : "orange", marginLeft: "10px" }}>
                    {site.active ? "Active" : "Inactive"}
                  </span>
                </p>
                {site.webLogo && (
                  <img className="bg-dark"
                                        src={`${process.env.REACT_APP_API_URL}/${site.webLogo}`} // assumes logo is like "uploads/xyz.jpg"
                                        alt={site.webName}
                                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                    />                )}
                <a href={site.webLink} target="_blank" rel="noopener noreferrer">{site.webLink}</a>
                <p style={{ color: "white" }}>{site.webDesc}</p>
                <p style={{ color: "white" }}>{site.email}</p>
                <button onClick={() => handelDelete(site._id)} className="btn btn-danger me-2">Delete</button>
                <button
                  onClick={() => toggleActive(site._id)}
                  className={`btn ${site.active ? 'btn-warning' : 'btn-success'}`}>
                  {site.active ? "Deactivate" : "Activate"}
                </button>
              </li>
            ))}
          </ul>
        </div>

       
      </div>
    </>
  );
};

export default OurNetworks;
