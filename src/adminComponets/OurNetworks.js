import { useState, useEffect } from "react";
import AdminNav from "./AdminNav";

const OurNetworks = () => {
  const [showModal, setShowModal] = useState(false);
  const [webName, setWebName] = useState('');
  const [webLink, setWebLink] = useState('');
  const [webDesc, setWebDesc] = useState('');
  const [websites, setWebsites] = useState([]); // State to store fetched websites

  // Fetch website data from API
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
    const data = { name: webName, link: webLink, description: webDesc };

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
        setShowModal(false); // Close the modal after successful submission
        fetchWebsites(); // Refresh the list of websites
      } else {
        alert("Failed to add website. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while adding the website.");
    }
  };

  function handelDelete(id){
// console.log(id) 
   fetch(`${process.env.REACT_APP_API_URL}/delete-website/${id}`,{
    method:"DELETE"
   }).then((res)=>{return res.json()}).then((data)=>{
    console.log(data)
    if(data.message==="deleted"){
      fetchWebsites();
    }
   })
  }

  return (
    <>
      <AdminNav />
      <div className="mt-5">
        <button className="btn btn-primary mt-3 d-flex m-auto" onClick={() => setShowModal(true)}>
          Add Website
        </button>

        {/* Website List */}
        <div className="mt-4">
          <h3 className="text-center text-light">Our Networks</h3>
          <ul style={{background:"black"}} className="list-group">
            {websites.map((site,key) => (
              <li style={{background:"black"}} key={site._id} className="list-group-item">
                 <p className="text-light">{key +1} {site.webName}</p><a href={site.webLink} target="_blank" rel="noopener noreferrer">{site.webLink}</a>
                <p style={{color:"white"}}>{site.webDesc}</p>
                <button onClick={()=>{handelDelete(site._id)}} className="btn btn-danger">delete</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Website</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleNetwork}>
                    <div className="mb-3">
                      <label className="form-label">Website Name</label>
                      <input value={webName} onChange={(e) => setWebName(e.target.value)} type="text" className="form-control" placeholder="Enter website name" required />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Website Link</label>
                      <input value={webLink} onChange={(e) => setWebLink(e.target.value)} type="url" className="form-control" placeholder="Enter website URL" required />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Website Description</label>
                      <textarea value={webDesc} onChange={(e) => setWebDesc(e.target.value)} className="form-control" placeholder="Enter description"></textarea>
                    </div>

                    <button type="submit" className="btn btn-success">Submit</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {showModal && <div className="modal-backdrop show" onClick={() => setShowModal(false)}></div>}
      </div>
    </>
  );
};

export default OurNetworks;
