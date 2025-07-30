import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import AdminNav from "./AdminNav";
const apiUrl = process.env.REACT_APP_API_URL;

function Dashboard() {
  // Predefined tags
  const suggestedTags = [
    'Caught', 'Close Up', 'Redhead', 'BBW', 'Wife', 'Japanese', 'Yoga', 'Spanking',
    'Ladyboy', 'FFM', 'Tattoo', 'Skinny', 'Cumshot', 'Cameltoe', 'Korean', 'Russian',
    'Legs', 'Webcam', 'Pussy', 'Footjob', 'College', 'Slut', 'Orgasm', 'Perfect',
    'Cum In Pussy', 'Panties', 'Sport', 'Cowgirl', 'Natural Tits', 'Pretty', 'Doggystyle',
    'Maid', 'Housewife', 'Curvy', 'Deepthroat', 'Surprise', 'Redhead', 'Party', 'BBC',
    'Doggystyle','Shower','Screaming','Jeans','Handjob','Teacher','Stuck','Babysitter','Masturbation','Girlfriend','Big Tits','Kissing','Panties','Saggy Tits','White','Beautiful','Teen','Chinese','Pregnant','Perfect','Glasses','Twins','Short Hair','Swinger','Stockings','Bathroom','Indian','Wedding','BBC','Cheerleader','office','babe'
  ];

  const [imageUrl, setImgUrl] = useState('');
  const [altKeywords, setAltKeywords] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [name, setname] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [videoNo, setVideoNo] = useState('');
  const [views, setViews] = useState('');
  const [link, setLink] = useState('');
  const [titel, settitel] = useState('');
  const [minutes, setMinutes] = useState('');
  const [Category, setCategory] = useState('');
  const [desc, setDesc] = useState(''); // New state for description

  // State for tag suggestions visibility
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [postdata, setData] = useState([]);
  const [postId, setPostId] = useState('');
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const itemsPerPage = 16;

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = { imageUrl, altKeywords, name, tags, videoNo, views, link, titel, minutes, Category, desc };
  
    const url = isUpdateMode
      ? `${apiUrl}/updatepost/${postId}`
      : `${apiUrl}/postdata`;
  
    const method = isUpdateMode ? 'PUT' : 'POST';
  
    fetch(url, {
      method,
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data._id) {
          e.target.reset();
          resetForm();
          fetchPostData(currentPage, searchQuery); // Re-fetch data for the current page
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };
  

  const fetchPostData = (page = 1, search = searchQuery) => {
    fetch(`${apiUrl}/getpostdata?page=${page}&limit=${itemsPerPage}&search=${search}`, { mode: 'cors' })
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        const reversedData = data.records;
        setData(reversedData);
        setTotalPages(data.totalPages);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  };

  useEffect(() => {
    fetchPostData(currentPage, searchQuery); // Fetch data on mount and whenever currentPage or searchQuery changes
  }, [currentPage, searchQuery]);

  const handleDelete = (id) => {
    fetch(`${apiUrl}/deletepost/${id}`, { method: "DELETE" })
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        if (data._id) {
          fetchPostData(currentPage, searchQuery); // Re-fetch data after deletion
        }
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  const openUpdateModal = (item) => {
    setIsUpdateMode(true);
    setPostId(item._id);
    setImgUrl(item.imageUrl);
    setAltKeywords(item.altKeywords || '');
    setname(item.name || []);
    setTags(item.tags || []);
    setTagInput('');
    setVideoNo(item.videoNo);
    setViews(item.views);
    setLink(item.link);
    settitel(item.titel);
    setMinutes(item.minutes);
    setCategory(item.Category);
    setDesc(item.desc || '');
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to the first page when the search query changes
  };

  const resetForm = () => {
    setImgUrl('');
    setAltKeywords('');
    setNameInput('');
    setname([]);
  setTags([]);
  setTagInput('');
    setVideoNo('');
    setViews('');
    setLink('');
    settitel('');
    setMinutes('');
    setCategory('');
    setDesc(''); // Reset desc
    setIsUpdateMode(false);
  };

  const renderPageNumbers = () => {
    let pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pageNumbers.push(
          <button
            key={i}
            onClick={() => handlePageChange(i)}
            className={`page-button ${currentPage === i ? 'active' : ''}`}
          >
            {i}
          </button>
        );
      } else if (i === 2 && currentPage > 3) {
        pageNumbers.push(<span key="ellipsis1">...</span>);
      } else if (i === totalPages - 1 && currentPage < totalPages - 2) {
        pageNumbers.push(<span key="ellipsis2">...</span>);
      }
    }
    return pageNumbers;
  };

  const removeName = (index) => {
    setname(name.filter((_, i) => i !== index));
  };

  const removeTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  // Filter tags based on input
  const filteredTags = tagInput
    ? suggestedTags.filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase()))
    : suggestedTags;

  // Add tag from suggestions
  const addTagFromSuggestion = (tag) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput('');
      setShowSuggestions(false);
    }
  };

  return (
    <>
      <AdminNav />
      <div className="w-50 m-auto">
        <button
          className="form-control btn btn-light mt-4 d-flex justify-content-center m-auto"
          data-bs-toggle="modal"
          data-bs-target="#exampleModal"
          onClick={resetForm}
        >
          Add Post
        </button>
      </div>

      {/* Search bar */}
      <div className="search-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          className="form-control"
          placeholder="Search by Title or Video No"
        />
      </div>

      <div style={{ marginTop: "7%" }} className="all-cards">
        <div className="row row-cols-2 row-cols-md-5 g-4">
          {postdata.map((item) => (
            <div className="col" key={item._id}>
              <div className="card">
                <img src={item.imageUrl} className="card-img-top" alt="..." />
                <p className="p-0 m-0 text-light">{item.titel}</p>
                <div className="card-body d-flex justify-content-between">
                  <div>
                    <h5 className="card-title">Video No: {item.videoNo}</h5>
                    <span><i className="bi bi-eye-fill"></i>{item.views}K</span>
                  </div>
                  <div>
                    <i onClick={() => handleDelete(item._id)} style={{ color: "#ffff" }} className="bi bi-trash3" />
                    <i onClick={() => openUpdateModal(item)} data-bs-toggle="modal" data-bs-target="#exampleModal" style={{ color: "#cd1f7c" }} className="bi bi-pencil-square d-block" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="pagination">
        {currentPage > 1 && (
          <button onClick={handlePreviousPage} className="nav-button">Previous</button>
        )}
        {renderPageNumbers()}
        {currentPage < totalPages && (
          <button onClick={handleNextPage} className="nav-button">Next</button>
        )}
      </div>

      {/* Modal for Add/Update Post */}
      <div className="modal fade" id="exampleModal" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
        <form onSubmit={handleSubmit} className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5 text-light" id="exampleModalLabel">
                {isUpdateMode ? 'Update Post' : 'Add A Post'}
              </h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
            </div>
            <div className="modal-body">
              <label htmlFor="image">Image Url</label>
              <input value={imageUrl} onChange={(e) => setImgUrl(e.target.value)} className="form-control" type="text" name="imageUrl" id="image" />
              <label>Image Alt Keywords</label>
              <input
                value={altKeywords}
                onChange={(e) => setAltKeywords(e.target.value)}
                className="form-control"
                type="text"
                name="altKeywords"
                id="altKeywords"
              />
              <label htmlFor="name">Star name</label>
              <div className="mb-2 d-flex">
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="form-control"
                  type="text"
                  placeholder="Enter name"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (nameInput.trim() !== "") {
                      setname([...name, nameInput.trim()]);
                      setNameInput('');
                    }
                  }}
                  className="btn btn-light ms-2"
                >
                  Add
                </button>
              </div>
              {/** Render the name tags */}
              {name.map((n, index) => (
                <div style={{background:"black", color:"#ffff"}} className="name-tag" key={index}>
                  {n}
                  <i onClick={() => removeName(index)} className="bi bi-x-circle"></i>
                </div>
              ))}
              <div className="mb-3">
                <label htmlFor="tags" className="form-label">Tags</label>
                <div className="d-flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <span key={index} className="badge bg-primary">
                      {tag} <button onClick={() => removeTag(index)} className="btn-close btn-close-white" aria-label="Remove tag"></button>
                    </span>
                  ))}
                </div>
                <div className="d-flex position-relative">
                  <input
                    type="text"
                    className="form-control"
                    id="tags"
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      if (e.target.value) {
                        setShowSuggestions(true);
                      } else {
                        setShowSuggestions(false);
                      }
                    }}
                    placeholder="Enter tag"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (tagInput.trim() !== '' && !tags.includes(tagInput.trim())) {
                        setTags([...tags, tagInput.trim()]);
                        setTagInput('');
                        setShowSuggestions(false);
                      }
                    }}
                    className="btn btn-light ms-2"
                  >
                    Add
                  </button>
                  {showSuggestions && (
                    <div className="position-absolute top-100 start-0 w-100 bg-white border rounded p-2" style={{ zIndex: 2 }}>
                      {filteredTags.length ? (
                        filteredTags.map((tag, index) => (
                          <div
                            key={index}
                            className="p-1 hoverable text-muted"
                            onClick={() => addTagFromSuggestion(tag)}
                          >
                            {tag}
                          </div>
                        ))
                      ) : (
                        <div className="p-1 text-muted">No suggestions</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <label htmlFor="title">Title</label>
              <input value={titel} onChange={(e) => settitel(e.target.value)} className="form-control" type="text" name="title" id="title" />

              <label htmlFor="minutes">Minutes</label>
              <input value={minutes} onChange={(e) => setMinutes(e.target.value)} className="form-control" type="number" name="minutes" id="minutes" />

              <label htmlFor="category">Category</label>
              <select className="form-control" name="" id="" value={Category} onChange={(e) => { setCategory(e.target.value) }}>
                <option className="text-light" value="english">English</option>
                <option className="text-light" value="indian">Indian</option>
                <option className="text-light" value="hijabi">Hijabi</option>
                <option className="text-light" value="viral">Viral</option>
              </select>
              

             
              <label htmlFor="link">Link</label>
              <input value={link} onChange={(e) => setLink(e.target.value)} className="form-control" type="text" name="link" id="link" />

            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-dark" data-bs-dismiss="modal">Close</button>
              <button data-bs-dismiss="modal" type="submit" className="btn btn-light">{isUpdateMode ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export default Dashboard;
