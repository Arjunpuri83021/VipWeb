
import './App.css';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Home from "./componet/Home"

import Navbar from './componet/Navbar';
import Dashbord from './adminComponets/Dashbord';
import Channel from './componet/Channel';
import Starts from './componet/Starts';
import AdminStars from './adminComponets/AdminStars'
import AdminTeraBox from './adminComponets/AdminTeraBox'
import AdminChannel from './adminComponets/AdminChannels'
import Indians from './componet/Indians';

import { SearchProvider } from './SearchContext';
import Hijabi from './componet/Hijabi';
import Popular from './componet/Popular';
import NewVideos from './componet/NewVideos';
import TopRate from './componet/TopRate';
import Video from './componet/videoPage/Video';
import Movies from './componet/Movies';
import ScrollToTop from './componet/videoPage/ScrollToTop';
import { Navigate } from "react-router-dom";
import NotFound from './componet/NotFound';
import SearchByName from './componet/videoPage/SearchByName';
import Login from './adminComponets/login';

import ProtectedRoute from './adminComponets/ProtectedRoute'; 
import OurNetworks from './adminComponets/OurNetworks';

function App() {
  return (
    <>
      <SearchProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/channels" element={<Channel />} />
            <Route path="/stars" element={<Starts />} />
            <Route path="/indian" element={<Indians />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/hijabi" element={<Hijabi />} />
            <Route path="/popularVideos" element={<Popular />} />
            <Route path="/newVideos" element={<NewVideos />} />
            <Route path="/toprated" element={<TopRate />} />
            <Route path="/playVideo/:id" element={<Video />} />
            <Route path="/pornstar/:name" element={<SearchByName />} />

            {/* Login Route */}
            <Route path='/admin' element={<Login />} />

            {/* Protected Admin Routes */}
            <Route 
              path="/admin/aman" 
              element={
                <ProtectedRoute>
                  <Dashbord />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/stars" 
              element={
                <ProtectedRoute>
                  <AdminStars />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/terabox" 
              element={
                <ProtectedRoute>
                  <AdminTeraBox />
                </ProtectedRoute>
              } 
            />

<Route 
              path="/admin/ournetworks" 
              element={
                <ProtectedRoute>
                   <OurNetworks/>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/channels" 
              element={
                <ProtectedRoute>
                  <AdminChannel />
                </ProtectedRoute>
              } 
            />

            {/* 301 Redirects */}
            <Route path="/old-movies" element={<Navigate to="/movies" replace />} />

            {/* Catch-All 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </SearchProvider>
    </>
  );
}

export default App;
