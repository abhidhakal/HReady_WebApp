import React from 'react';
import { Link } from 'react-router-dom';
import './css/Blogs.css'
import Header from './Header';

function Blogs() {
    return(
        <div className="full-screen">
            <div className="blogs-container">
            <Header/>
            <div className="blogs-content">
                <h1>Blogs</h1>
                <p>
                    Blogs will be placed here.
                </p>
            </div>
            </div>
        </div>
    );
}
export default Blogs;