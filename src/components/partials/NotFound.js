import React from 'react';
import Footer from './Footer';
import { Link } from '@mui/material';

const NotFound = () => {
    return (
        <main style={{ textAlign: 'center', marginTop: '50px', color: '#333' }}>
            <h1 style={{ fontSize: '2rem' }}>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <Link to="/">Go Back to Home</Link>
            <Footer/>
        </main>
    );
};

export default NotFound;
