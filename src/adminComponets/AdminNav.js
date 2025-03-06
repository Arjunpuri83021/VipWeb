import { NavLink, useNavigate } from "react-router-dom";

function AdminNav() {
   const navigate=useNavigate()
  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    navigate('/admin');
};

    return ( 

        <>
        <button className="btn btn-danger mt-3 mb-4 float-end" onClick={handleLogout}>LogOut</button>
        <ul className="nav-ul admin-nav-ul mt-5">
       
       
       <NavLink exact to="/admin/aman" activeClassName="active-link">
         <li>Posts</li>
       </NavLink>
       <NavLink to="/admin/ournetworks" activeClassName="active-link">
         <li>Networks</li>
       </NavLink>

       <NavLink to="/admin/stars" activeClassName="active-link">
         <li>Stars</li>
       </NavLink>
       <NavLink to="/admin/terabox" activeClassName="active-link">
         <li>TeraBox</li>
       </NavLink>
       <NavLink to="/admin/channels" activeClassName="active-link">
         <li>Channels</li>
       </NavLink>

       
        
       
     </ul>
        </>

     );
}

export default AdminNav;